# Customer directory and destination catalog contracts

## Customer directory: entries 222 and 224

**Status: SOURCE-TRACED.** `server/routes/customerRoutes.js` applies `resolveTenant`, `protect`, `adminMiddleware`, and `authorize("manage_customers")` router-wide. Handlers are `getCustomers` and `getCustomerProfile` in `server/controllers/customerController.js`. Both are read-only and tenant-filtered. The controller has no focused tests in the backend test inventory.

### `GET /api/customers`

- Query: `search` defaults to empty string; `page` defaults to 1 and is coerced to a positive integer (minimum 1). Fixed page size is 10; there is no `limit` parameter.
- The handler finds non-customer role IDs in the tenant, then pages tenant-scoped `User` records whose role/legacyRole is customer, excluding deleted records and non-customer role IDs. Search is trimmed and applied case-insensitively across name/email/phone. It separately reads legacy `Customer` profiles and matching non-deleted `Booking` records to derive counts and spend.
- Success 200 `{success:true,pagination:{total,page,pages,limit:10},count,data,customers}`; `data` and `customers` are the same enriched page array. Each user includes customer type, active flag, total/confirmed booking counts, and confirmed spend / totalSpent. The spend helper counts full booking total less refunds only for successful booking states with paid/completed/success payment states.
- Database failures are passed to centralized error middleware. No mutation or external integration.

### `GET /api/customers/:id`

- Path `id` must pass `mongoose.Types.ObjectId.isValid`; invalid ID returns 400. Requires tenant context; lookup is a tenant-scoped non-deleted customer `User` record and excludes password from the projection. Missing/non-customer record returns 404.
- Reads optional legacy customer profile, tenant-scoped bookings, invoices, quotations, reviews, and at most ten notifications. Booking/tour and invoice/quotation/review tour references are populated with selected display fields. Response 200 `{success:true,data:{customer,summary,bookings,invoices,quotations,reviews,communications}}`.
- Summary distinguishes confirmed booking counts/spend from total paid for confirmed bookings; the latter uses deposit amount when present, else total, less refund, clamped at zero. Errors are delegated to central middleware.

No live requests were made. The server computes spend summaries; this endpoint does not reconcile the financial ledger.

## Public destination catalog: entries 226–229

**Status: SOURCE-TRACED.** Routes in `server/routes/destinationRoutes.js` call `getFeaturedDestinations` for `/featured`, `getDestinations` for `/`, and `getDestination` for both `/:slug` and `/slug/:slug`. The API router supplies tenant resolution before mount. The controller is `server/controllers/destinationController.js`; models are `Destination` and `Tour`. No controller-specific test was identified.

- `GET /api/destinations/featured`: no query/body; returns up to six newest active, featured, non-deleted destinations as `{success:true,count,data}`.
- `GET /api/destinations`: query `page` defaults/falls back to 1 and is capped at 10,000; `limit` defaults to 12 and clamps to 1–24; optional `country` is exact match, `featured=true` filters featured, and trimmed `search` (max 120 chars) is regex-escaped then case-insensitively matched against name, slug, country, description. Returns newest first, one image per destination, 200 `{success:true,count,pagination:{total,page,pages,limit},data}`.
- `GET /api/destinations/:slug` and `/api/destinations/slug/:slug` share the same handler and behavior. Slug is trimmed/lowercased; empty returns 400. It first searches exact public slug, then tries name-based canonical aliases (including Diani/Nairobi) without dropping tenant filter. Missing destination returns 404. Success includes selected destination fields, up to 24 public related tours, and up to four same-country related destinations: `{success:true,data:{destination,relatedDestinations}}`.
- All public destination reads require `status:active`, `active:true`, `isDeleted:false`; related tours require non-deleted, published, available, and status scheduled/upcoming/ongoing. Tenant context is applied unless explicitly in platform bypass context. Errors are passed to central middleware.
- Read-only; no auth middleware is declared in this router, but upstream tenant context applies. Queries project fields and cap image arrays to reduce payload size. No external calls.

## `GET /api/database` (entry 225)

Route in `server/routes/databaseRoutes.js`: upstream tenant resolution, JWT `protect`, and `authorize("system.database")`; no controller/model query. Returns 200 `{success:true,database:"connected"|"disconnected",timestamp:<ISO string>}` based only on `mongoose.connection.readyState === 1`. It is a connection-state indicator, not a database health query. No request fields or mutation. Unexpected serialization/runtime errors use Express error handling. No focused route test was identified.
