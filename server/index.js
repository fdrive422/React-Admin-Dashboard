import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import clientRoutes from "./routes/client.js";
import generalRoutes from "./routes/general.js";
import managementRoutes from "./routes/management.js";
import salesRoutes from "./routes/sales.js";

// Data Imports
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

// CONFIGURATION
dotenv.config();

if (!process.env.MONGO_URL) {
	console.error("MONGO_URL environment variable is required");
	process.exit(1);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));

// ROUTES
app.use("/client", clientRoutes);
app.use("/general", generalRoutes);
app.use("/management", managementRoutes);
app.use("/sales", salesRoutes);

// MONGOOSE SETUP
mongoose
	.connect(process.env.MONGO_URL)
	.catch((error) => console.log(`${error} did not connect`));

// Local dev server — Vercel provides its own listener
if (!process.env.VERCEL) {
	const PORT = process.env.PORT || 9000;
	app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
}

export default app;
