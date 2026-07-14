import { getSupabase } from "../db/supabase.js";
import { sendServerError } from "../utils/errors.js";

const USER_COLS =
	"_id:id, name, email, city, state, country, occupation, phoneNumber:phone_number, role, transactions, createdAt:created_at, updatedAt:updated_at";
const TRANSACTION_COLS =
	"_id:id, userId:user_id, cost, products, createdAt:created_at, updatedAt:updated_at";
const OVERALL_STAT_COLS =
	"_id:id, totalCustomers:total_customers, yearlySalesTotal:yearly_sales_total, yearlyTotalSoldUnits:yearly_total_sold_units, year, monthlyData:monthly_data, dailyData:daily_data, salesByCategory:sales_by_category";

export const getUser = async (req, res) => {
	try {
		const { id } = req.params;
		const supabase = getSupabase();
		const { data: user, error } = await supabase
			.from("users")
			.select(USER_COLS)
			.eq("id", id)
			.maybeSingle();
		if (error) throw error;
		if (!user) return res.status(404).json({ message: "User not found" });

		res.status(200).json(user);
	} catch (error) {
		sendServerError(res, error, "getUser");
	}
};

export const getDashboardStats = async (req, res) => {
	try {
		// hardcoded values
		const currentMonth = "November";
		const currentYear = 2021;
		const currentDay = "2021-11-15";
		const supabase = getSupabase();

		/* Recent Transactions */
		const { data: transactions, error: txError } = await supabase
			.from("transactions")
			.select(TRANSACTION_COLS)
			.order("created_at", { ascending: false })
			.limit(50);
		if (txError) throw txError;

		/* Overall Stats */
		const { data: overallStat, error: statError } = await supabase
			.from("overall_stats")
			.select(OVERALL_STAT_COLS)
			.eq("year", currentYear)
			.maybeSingle();
		if (statError) throw statError;

		if (!overallStat) {
			return res
				.status(404)
				.json({ message: "No stats found for the current year" });
		}

		const {
			totalCustomers,
			yearlyTotalSoldUnits,
			yearlySalesTotal,
			monthlyData,
			salesByCategory,
			dailyData,
		} = overallStat;

		const thisMonthStats = monthlyData.find(({ month }) => {
			return month === currentMonth;
		});

		const todayStats = dailyData.find(({ date }) => {
			return date === currentDay;
		});

		res.status(200).json({
			totalCustomers,
			yearlyTotalSoldUnits,
			yearlySalesTotal,
			monthlyData,
			salesByCategory,
			thisMonthStats,
			todayStats,
			transactions,
		});
	} catch (error) {
		sendServerError(res, error, "getDashboardStats");
	}
};
