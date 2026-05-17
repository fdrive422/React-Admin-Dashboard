# Lessons Learned

## 1. Always use 500 for unexpected server errors
Catch blocks in Express controllers must use `res.status(500)` — not 404. Reserve 404 for explicit "resource not found" cases with a null check guard before accessing the result.

## 2. Guard all array[0] accesses after DB queries
`Model.find()` always returns an array. Access `[0]` only after verifying the array is non-empty: `if (!result || result.length === 0) return res.status(404)...`

## 3. N+1 queries: batch with $in, not per-item findById
Fetching N related documents inside `.map()` creates N+1 DB round trips. Replace with a single `Model.find({ _id: { $in: ids } })` then group results in memory.

## 4. Add .lean() to all read-only Mongoose queries
`.lean()` skips Mongoose document instantiation and returns plain JS objects. ~2-3x faster for read-only endpoints. Only omit when calling Mongoose document methods (.save(), virtuals, etc.).

## 5. RTK Query: providesTags not provideTags
The correct RTK Query property is `providesTags` (plural). `provideTags` is silently ignored — the cache tag registry never gets populated and data is re-fetched on every render.

## 6. React null guard order matters: use && not ||
`data || !isLoading` evaluates to true even when `data` is null and loading is false, allowing `data.map()` to crash. Use `data && !isLoading` to require data to exist.

## 7. Optional chaining on DataGrid renderCell
`params.value` can be null/undefined for missing row fields. Always use `params.value?.length ?? 0` and `params.value?.replace(...) ?? ""` in renderCell callbacks.

## 8. sort spread operator: setSort(...array) not setSort(array)
`setSort(...newSortModel)` spreads array items as arguments to setState, setting state to the first element. Use `setSort(newSortModel[0] || {})` to safely extract the first sort model.

## 9. CORS must be restricted in production
`app.use(cors())` with no config allows all origins. Use `cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" })` so production only accepts requests from the deployed frontend.

## 10. Remove duplicate middleware (body-parser + express built-ins)
Express 4.16+ includes `express.json()` and `express.urlencoded()`. The `body-parser` package is redundant and deprecated — remove it.

## 11. stat is an array from Model.find(), not a single object
`ProductStat.find({ productId })` returns an array. Access properties as `stat[0]?.yearlySalesTotal`, not `stat.yearlySalesTotal`.

## 12. MongoDB Atlas free-tier clusters auto-pause after 60 days
If `querySrv ENOTFOUND` appears, the Atlas cluster is paused. Log into cloud.mongodb.com and resume. Use a local MongoDB fallback for offline dev.
