// Centralized server error handling. Logs the full error server-side (with a
// context label) and returns a generic message to the client, so internal
// Postgres/PostgREST error text is never leaked to unauthenticated callers.
export function sendServerError(res, error, context) {
	console.error(`[${context}]`, error);
	res.status(500).json({ message: "Internal server error" });
}
