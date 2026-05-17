import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Product from "./models/Product.js";
import ProductStat from "./models/ProductStat.js";
import Transaction from "./models/Transaction.js";
import OverallStat from "./models/OverallStat.js";
import AffiliateStat from "./models/AffiliateStat.js";
import {
	dataUser,
	dataProduct,
	dataProductStat,
	dataTransaction,
	dataOverallStat,
	dataAffiliateStat,
} from "./data/index.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URL);
console.log("Connected to MongoDB");

await Promise.all([
	User.deleteMany({}),
	Product.deleteMany({}),
	ProductStat.deleteMany({}),
	Transaction.deleteMany({}),
	OverallStat.deleteMany({}),
	AffiliateStat.deleteMany({}),
]);
console.log("Cleared existing data");

await User.insertMany(dataUser);
await Product.insertMany(dataProduct);
await ProductStat.insertMany(dataProductStat);
await Transaction.insertMany(dataTransaction);
await OverallStat.insertMany(dataOverallStat);
await AffiliateStat.insertMany(dataAffiliateStat);
console.log("Seed complete");

await mongoose.disconnect();
