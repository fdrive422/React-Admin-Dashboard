import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import clientRoutes from "./routes/client.js";
import generalRoutes from "./routes/general.js";
import managementRoutes from "./routes/management.js";
import salesRoutes from "./routes/sales.js";

// Load server/.env by absolute path so it works regardless of the cwd the
// process was launched from (root `npm start`, `server/` nodemon, or scripts).
// On Vercel the file is absent and the platform-injected env vars are used.
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
	console.error(
		"SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required"
	);
	process.exit(1);
}

const app = express();

// Behind Vercel's proxy, trust one hop so req.ip reflects the real client IP
// (via X-Forwarded-For) for rate limiting rather than the proxy address.
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
if (process.env.NODE_ENV !== "production") app.use(morgan("common"));
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));

// Basic per-IP rate limiting on the public, unauthenticated API. Note: the
// default store is in-memory, so on serverless this is per-instance (resets on
// cold start) — a lightweight guard against scraping/abuse, not a distributed
// limit. Use a shared store (e.g. Redis) if strict global limits are needed.
const apiLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 100, // requests per IP per window
	standardHeaders: true,
	legacyHeaders: false,
});

// No DB connection middleware needed — supabase-js talks to PostgREST over HTTP
// (stateless) and the client is lazily created and reused per warm instance.

// ROUTES
app.use("/api", apiLimiter);
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
