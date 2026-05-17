import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
	{
		userId: String,
		cost: String,
		products: {
			type: [mongoose.Types.ObjectId],
			of: Number,
		},
	},
	{ timestamps: true }
);

TransactionSchema.index({ userId: 1 });
TransactionSchema.index({ cost: 1 });
TransactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;
