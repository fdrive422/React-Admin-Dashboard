import { createClient } from "@supabase/supabase-js";

// Singleton Supabase client. supabase-js talks to PostgREST over HTTP, so it is
// stateless — a single instance is reused across requests on a warm serverless
// instance, mirroring the previous cached Mongoose connection.
let client = null;

export function getSupabase() {
	if (!client) {
		const url = process.env.SUPABASE_URL;
		const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
		if (!url || !key) {
			throw new Error(
				"SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required"
			);
		}
		client = createClient(url, key, {
			auth: { persistSession: false, autoRefreshToken: false },
		});
	}
	return client;
}
