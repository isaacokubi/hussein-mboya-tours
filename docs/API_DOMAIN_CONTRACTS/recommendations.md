# Personalized tour recommendations

## `POST /api/recommendations` (inventory entry 375)

**Status: SOURCE-TRACED.** `server/routes/recommendationRoutes.js` applies tenant resolution and JWT protection. Controller `getRecommendations` requires a nonempty JSON body, delegates to `recommendTours` in `server/services/recommendationService.js`, and returns 200 `{success:true,count,recommendations}`; empty body returns 400. No focused recommendation tests were identified.

Body fields consumed by the service: `preferredCountries[]`, `travelStyle[]`, `minBudget`, `maxBudget`, `minDuration`, `maxDuration`, `featuredOnly` (default false), and `limit` (default 10). Query is built for active tours, optionally country/category, numeric-looking price/duration comparisons and featured flag; results populate destination name/country and sort featured, rating, bookingsCount. If no tour matches, it returns top active tours sorted featured/rating, ignoring submitted filters. No normalization, range validation or limit cap appears in this service. It requires tenant context; the imported `mergeTenantFilter` is unused, so isolation depends on the `Tour` model's tenant plugin query hooks. Read-only, no external calls. Controller logs caught errors and delegates to central middleware.
