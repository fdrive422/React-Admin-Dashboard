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

dotenv.config();

if (!process.env.MONGO_URL) {
	console.error("MONGO_URL environment variable is required");
	process.exit(1);
}

// Cache the connection promise — warm Vercel instances reuse it instantly
let connectionPromise = null;
function connectDB() {
	if (!connectionPromise) {
		connectionPromise = mongoose.connect(process.env.MONGO_URL, {
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 30000,
		});
	}
	return connectionPromise;
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
if (process.env.NODE_ENV !== "production") app.use(morgan("common"));
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));

// Await DB connection before every request — must be before routes
app.use(async (req, res, next) => {
	try {
		await connectDB();
		next();
	} catch (err) {
		console.error("DB connection failed:", err.message);
		res.status(503).json({ message: "Database unavailable" });
	}
});

// ROUTES
app.use("/api/client", clientRoutes);
app.use("/api/general", generalRoutes);
app.use("/api/management", managementRoutes);
app.use("/api/sales", salesRoutes);

// Local dev server — Vercel provides its own listener
if (!process.env.VERCEL) {
	const PORT = process.env.PORT || 9000;
	app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
}

export default app;
