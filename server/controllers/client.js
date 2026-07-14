import getCountryIso3 from "country-iso-2-to-3";
import { getSupabase } from "../db/supabase.js";
import { sendServerError } from "../utils/errors.js";

// Column aliases that reproduce the JSON shape the React client expects
// (`_id` + camelCase keys) directly from PostgREST.
const PRODUCT_COLS =
	"_id:id, name, price, description, category, rating, supply, createdAt:created_at, updatedAt:updated_at";
const PRODUCT_STAT_COLS =
	"_id:id, productId:product_id, yearlySalesTotal:yearly_sales_total, yearlyTotalSoldUnits:yearly_total_sold_units, year, monthlyData:monthly_data, dailyData:daily_data";
const CUSTOMER_COLS =
	"_id:id, name, email, city, state, country, occupation, phoneNumber:phone_number, role, createdAt:created_at, updatedAt:updated_at";
const TRANSACTION_COLS =
	"_id:id, userId:user_id, cost, products, createdAt:created_at, updatedAt:updated_at";

// Cap the free-text search length to bound the ILIKE scan cost.
const MAX_SEARCH_LENGTH = 100;

// Maps the sortable frontend field names to their Postgres columns.
const TRANSACTION_SORT_COLUMNS = {
	_id: "id",
	userId: "user_id",
	cost: "cost",
	createdAt: "created_at",
	products: "products",
};

export const getProducts = async (req, res) => {
	try {
		const supabase = getSupabase();

		const { data: products, error: productsError } = await supabase
			.from("products")
			.select(PRODUCT_COLS);
		if (productsError) throw productsError;

		const productIds = products.map((p) => p._id);

		const { data: stats, error: statsError } = await supabase
			.from("product_stats")
			.select(PRODUCT_STAT_COLS)
			.in("product_id", productIds);
		if (statsError) throw statsError;

		const statsByProductId = stats.reduce((acc, stat) => {
			if (!acc[stat.productId]) acc[stat.productId] = [];
			acc[stat.productId].push(stat);
			return acc;
		}, {});

		const productsWithStats = products.map((product) => ({
			...product,
			stat: statsByProductId[product._id] || [],
		}));

		res.status(200).json(productsWithStats);
	} catch (error) {
		sendServerError(res, error, "getProducts");
	}
};

export const getCustomers = async (req, res) => {
	try {
		const supabase = getSupabase();
		const { data: customers, error } = await supabase
			.from("users")
			.select(CUSTOMER_COLS)
			.eq("role", "user");
		if (error) throw error;

		res.status(200).json(customers);
	} catch (error) {
		sendServerError(res, error, "getCustomers");
	}
};

export const getTransactions = async (req, res) => {
	try {
		// sort should look like this: { "field": "userId", "sort": "desc"}
		const { page = 0, pageSize = 20, sort = null, search = "" } = req.query;
		const supabase = getSupabase();

		const pageNum = Number(page);
		const size = Number(pageSize);
		const from = pageNum * size;
		const to = from + size - 1;

		let query = supabase
			.from("transactions")
			.select(TRANSACTION_COLS, { count: "exact" });

		// Case-insensitive search across cost and userId (matches the old $regex $or).
		// The value is wrapped in a PostgREST quoted literal so reserved filter
		// characters (comma, parentheses) are treated as literal text rather than
		// filter grammar, and embedded quotes/backslashes are escaped. This closes
		// off PostgREST filter injection via the user-supplied search param.
		if (search) {
			const safeSearch = String(search)
				.slice(0, MAX_SEARCH_LENGTH)
				.replace(/["\\]/g, (char) => `\\${char}`);
			query = query.or(
				`cost.ilike."%${safeSearch}%",user_id.ilike."%${safeSearch}%"`
			);
		}

		// Sort — map the frontend field name to its column; default createdAt desc.
		if (sort) {
			const { field, sort: direction } = JSON.parse(sort);
			const column = TRANSACTION_SORT_COLUMNS[field] || "created_at";
			query = query.order(column, { ascending: direction === "asc" });
		} else {
			query = query.order("created_at", { ascending: false });
		}

		const { data: transactions, count, error } = await query.range(from, to);
		if (error) throw error;

		res.status(200).json({ transactions, total: count });
	} catch (error) {
		sendServerError(res, error, "getTransactions");
	}
};

export const getGeography = async (req, res) => {
	try {
		const supabase = getSupabase();
		const { data: users, error } = await supabase.from("users").select("country");
		if (error) throw error;

		const mappedLocations = users.reduce((acc, { country }) => {
			const countryISO3 = getCountryIso3(country);
			if (!acc[countryISO3]) {
				acc[countryISO3] = 0;
			}
			acc[countryISO3]++;
			return acc;
		}, {});

		const formattedLocations = Object.entries(mappedLocations).map(
			([country, count]) => {
				return { id: country, value: count };
			}
		);

		res.status(200).json(formattedLocations);
	} catch (error) {
		sendServerError(res, error, "getGeography");
	}
};
