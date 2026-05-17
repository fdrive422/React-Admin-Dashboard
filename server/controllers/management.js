import mongoose from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

export const getAdmins = async (req, res) => {
	try {
		const admins = await User.find({ role: "admin" }).select("-password").lean();
		res.status(200).json(admins);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getUserPerformance = async (req, res) => {
	try {
		const { id } = req.params;

		const userWithStats = await User.aggregate([
			{ $match: { _id: new mongoose.Types.ObjectId(id) } },
			{
				$lookup: {
					from: "affiliatestats",
					localField: "_id",
					foreignField: "userId",
					as: "affiliateStats",
				},
			},
			{ $unwind: "$affiliateStats" },
		]);

		if (!userWithStats || userWithStats.length === 0) {
			return res.status(404).json({ message: "User not found or has no affiliate stats" });
		}

		const affiliateSaleIds = userWithStats[0].affiliateStats.affiliateSales;
		const salesTransactions = await Transaction.find({
			_id: { $in: affiliateSaleIds },
		}).lean();
		const filteredSalesTransactions = salesTransactions.filter(Boolean);

		res.status(200).json({
			user: userWithStats[0],
			sales: filteredSalesTransactions,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
