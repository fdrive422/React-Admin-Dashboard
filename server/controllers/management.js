import { getSupabase } from "../db/supabase.js";
import { sendServerError } from "../utils/errors.js";

const USER_COLS =
	"_id:id, name, email, city, state, country, occupation, phoneNumber:phone_number, role, transactions, createdAt:created_at, updatedAt:updated_at";
const CUSTOMER_COLS =
	"_id:id, name, email, city, state, country, occupation, phoneNumber:phone_number, role, createdAt:created_at, updatedAt:updated_at";
const AFFILIATE_STAT_COLS =
	"_id:id, userId:user_id, affiliateSales:affiliate_sales, createdAt:created_at, updatedAt:updated_at";
const TRANSACTION_COLS =
	"_id:id, userId:user_id, cost, products, createdAt:created_at, updatedAt:updated_at";

export const getAdmins = async (req, res) => {
	try {
		const supabase = getSupabase();
		const { data: admins, error } = await supabase
			.from("users")
			.select(CUSTOMER_COLS)
			.eq("role", "admin");
		if (error) throw error;

		res.status(200).json(admins);
	} catch (error) {
		sendServerError(res, error, "getAdmins");
	}
};

export const getUserPerformance = async (req, res) => {
	try {
		const { id } = req.params;
		const supabase = getSupabase();

		// Replaces the old $match/$lookup/$unwind aggregation: fetch the user's
		// affiliate stats, then the referenced sale transactions.
		const { data: affiliateStats, error: affiliateError } = await supabase
			.from("affiliate_stats")
			.select(AFFILIATE_STAT_COLS)
			.eq("user_id", id)
			.maybeSingle();
		if (affiliateError) throw affiliateError;

		if (!affiliateStats) {
			return res
				.status(404)
				.json({ message: "User not found or has no affiliate stats" });
		}

		const { data: user, error: userError } = await supabase
			.from("users")
			.select(USER_COLS)
			.eq("id", id)
			.maybeSingle();
		if (userError) throw userError;

		const affiliateSaleIds = affiliateStats.affiliateSales || [];
		const { data: salesTransactions, error: salesError } = await supabase
			.from("transactions")
			.select(TRANSACTION_COLS)
			.in("id", affiliateSaleIds);
		if (salesError) throw salesError;

		res.status(200).json({
			user: { ...user, affiliateStats },
			sales: salesTransactions,
		});
	} catch (error) {
		sendServerError(res, error, "getUserPerformance");
	}
};
