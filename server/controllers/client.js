import Product from "../models/Product.js";
import ProductStat from "../models/ProductStat.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import getCountryIso3 from "country-iso-2-to-3";

export const getProducts = async (req, res) => {
	try {
		const products = await Product.find().lean();
		const productIds = products.map((p) => String(p._id));

		const stats = await ProductStat.find({ productId: { $in: productIds } }).lean();
		const statsByProductId = stats.reduce((acc, stat) => {
			if (!acc[stat.productId]) acc[stat.productId] = [];
			acc[stat.productId].push(stat);
			return acc;
		}, {});

		const productsWithStats = products.map((product) => ({
			...product,
			stat: statsByProductId[String(product._id)] || [],
		}));

		res.status(200).json(productsWithStats);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getCustomers = async (req, res) => {
	try {
		const customers = await User.find({ role: "user" }).select("-password").lean();
		res.status(200).json(customers);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getTransactions = async (req, res) => {
	try {
		// sort should look like this: { "field": "userId", "sort": "desc"}
		const { page = 1, pageSize = 20, sort = null, search = "" } = req.query;

		// formatted sort should look like { userId: -1 }
		const generateSort = () => {
			const sortParsed = JSON.parse(sort);
			const sortFormatted = {
				[sortParsed.field]: sortParsed.sort === "asc" ? 1 : -1,
			};

			return sortFormatted;
		};
		const sortFormatted = Boolean(sort) ? generateSort() : {};

		const searchFilter = {
			$or: [
				{ cost: { $regex: new RegExp(search, "i") } },
				{ userId: { $regex: new RegExp(search, "i") } },
			],
		};

		const [transactions, total] = await Promise.all([
			Transaction.find(searchFilter)
				.sort(sortFormatted)
				.skip(page * pageSize)
				.limit(pageSize)
				.lean(),
			Transaction.countDocuments(searchFilter),
		]);

		res.status(200).json({
			transactions,
			total,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getGeography = async (req, res) => {
	try {
		const users = await User.find().select("country -_id").lean();

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
		res.status(500).json({ message: error.message });
	}
};
