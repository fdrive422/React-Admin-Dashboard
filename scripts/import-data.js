// One-time data import: seeds the Supabase Postgres tables from the demo dataset
// in server/data/index.js. Idempotent — uses upsert on the text primary key, so
// re-running replaces rows in place. Run once after applying supabase/schema.sql:
//
//   node scripts/import-data.js
//
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment
// (loaded from server/.env below, regardless of the cwd it is run from).

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getSupabase } from "../server/db/supabase.js";
import {
	dataUser,
	dataProduct,
	dataProductStat,
	dataTransaction,
	dataOverallStat,
	dataAffiliateStat,
} from "../server/data/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../server/.env") });

const BATCH_SIZE = 500;

// Timestamp fields present on some seed records; passed through when set,
// otherwise the column default now() applies.
const timestamps = (r) => ({
	...(r.createdAt ? { created_at: r.createdAt } : {}),
	...(r.updatedAt ? { updated_at: r.updatedAt } : {}),
});

const mapUser = (r) => ({
	id: r._id,
	name: r.name,
	email: r.email,
	city: r.city ?? null,
	state: r.state ?? null,
	country: r.country ?? null,
	occupation: r.occupation ?? null,
	phone_number: r.phoneNumber ?? null,
	transactions: r.transactions ?? [],
	role: r.role ?? "admin",
	...timestamps(r),
});

const mapProduct = (r) => ({
	id: r._id,
	name: r.name ?? null,
	price: r.price ?? null,
	description: r.description ?? null,
	category: r.category ?? null,
	rating: r.rating ?? null,
	supply: r.supply ?? null,
	...timestamps(r),
});

const mapProductStat = (r) => ({
	id: r._id,
	product_id: r.productId ?? null,
	yearly_sales_total: r.yearlySalesTotal ?? null,
	yearly_total_sold_units: r.yearlyTotalSoldUnits ?? null,
	year: r.year ?? null,
	monthly_data: r.monthlyData ?? [],
	daily_data: r.dailyData ?? [],
	...timestamps(r),
});

const mapTransaction = (r) => ({
	id: r._id,
	user_id: r.userId ?? null,
	// cost was stored as a String in the Mongoose schema; preserve that.
	cost: r.cost == null ? null : String(r.cost),
	products: r.products ?? [],
	...timestamps(r),
});

const mapOverallStat = (r) => ({
	id: r._id,
	total_customers: r.totalCustomers ?? null,
	yearly_sales_total: r.yearlySalesTotal ?? null,
	yearly_total_sold_units: r.yearlyTotalSoldUnits ?? null,
	year: r.year ?? null,
	monthly_data: r.monthlyData ?? [],
	daily_data: r.dailyData ?? [],
	sales_by_category: r.salesByCategory ?? {},
	...timestamps(r),
});

const mapAffiliateStat = (r) => ({
	id: r._id,
	user_id: r.userId ?? null,
	affiliate_sales: r.affiliateSales ?? [],
	...timestamps(r),
});

const tables = [
	{ name: "users", rows: dataUser.map(mapUser) },
	{ name: "products", rows: dataProduct.map(mapProduct) },
	{ name: "product_stats", rows: dataProductStat.map(mapProductStat) },
	{ name: "transactions", rows: dataTransaction.map(mapTransaction) },
	{ name: "overall_stats", rows: dataOverallStat.map(mapOverallStat) },
	{ name: "affiliate_stats", rows: dataAffiliateStat.map(mapAffiliateStat) },
];

async function importTable(supabase, name, rows) {
	for (let i = 0; i < rows.length; i += BATCH_SIZE) {
		const batch = rows.slice(i, i + BATCH_SIZE);
		const { error } = await supabase
			.from(name)
			.upsert(batch, { onConflict: "id" });
		if (error) {
			throw new Error(`Failed importing ${name} (batch at ${i}): ${error.message}`);
		}
	}
	// Confirm row count.
	const { count, error: countError } = await supabase
		.from(name)
		.select("*", { count: "exact", head: true });
	if (countError) {
		throw new Error(`Failed counting ${name}: ${countError.message}`);
	}
	console.log(`  ${name}: imported ${rows.length}, table now holds ${count}`);
}

async function main() {
	const supabase = getSupabase();
	console.log("Importing demo data into Supabase...");
	for (const { name, rows } of tables) {
		await importTable(supabase, name, rows);
	}
	console.log("Done.");
}

main().catch((err) => {
	console.error(err.message);
	process.exit(1);
});
