import { getSupabase } from "../db/supabase.js";
import { sendServerError } from "../utils/errors.js";

const OVERALL_STAT_COLS =
	"_id:id, totalCustomers:total_customers, yearlySalesTotal:yearly_sales_total, yearlyTotalSoldUnits:yearly_total_sold_units, year, monthlyData:monthly_data, dailyData:daily_data, salesByCategory:sales_by_category, createdAt:created_at, updatedAt:updated_at";

export const getSales = async (req, res) => {
	try {
		const supabase = getSupabase();
		const { data: overallStats, error } = await supabase
			.from("overall_stats")
			.select(OVERALL_STAT_COLS)
			.limit(1);
		if (error) throw error;

		if (!overallStats || overallStats.length === 0) {
			return res.status(404).json({ message: "No sales stats found" });
		}

		res.status(200).json(overallStats[0]);
	} catch (error) {
		sendServerError(res, error, "getSales");
	}
};
