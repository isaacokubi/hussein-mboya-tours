# Admin tour catalogue contracts

## Shared access and tenancy

Mounted by `server/routes/index.js` at `/admin/tours` as `server/routes/adminTourRoutes.js`. Router middleware runs `resolveTenant` → `protect` → `adminMiddleware` → `authorize("tour.manage")`. `adminMiddleware` admits active `admin` or `super_admin`; the permission middleware also admits platform wildcard and admin compatibility permissions. Cookie-authenticated unsafe requests need CSRF, though this GET is safe. No branch scope is applied. The `Tour` model has `tenantPlugin`; its query hooks inject the current tenant into `find` and `countDocuments` filters. The list controller does not add an explicit tenant predicate, so tenant safety here depends on that plugin and request context.

## GET /api/admin/tours

**Handler:** `getAllTours` in `server/controllers/adminTourController.js`.

- **Request:** No body, path parameter, or route-specific headers. Optional query keys read directly are `page`, `limit`, `status`, `category`, `featured`, `destination`, `available`, and `search`. No validator or sanitizer is mounted for this GET.
- **Pagination:** `page = max(Number(page) || 1, 1)`; `limit = min(Number(limit) || 10, 10)`. Thus page defaults to 1 and has a lower bound but no upper bound; limit defaults to 10 and caps at 10, with no explicit positive lower bound. Values are not required to be integers.
- **Filters:** Always `isDeleted:false`. `status`, `category`, and `destination` pass through as supplied. `featured` and `available` filter only when their query value is exactly the string `"true"`; callers cannot use `"false"` to filter false records. `search` creates a case-insensitive regex over `title`, `country`, and `location`; regex metacharacters are not escaped and no length bound is applied in this handler.
- **Database:** Runs `Tour.find(filter)` and `Tour.countDocuments(filter)` concurrently. Populates destination `{name,slug}`, assigned guide/driver `{name,email}`, assigned vehicle `{name,registrationNumber}`, and creator `{name,email}`; sorts newest first; skips/limits; returns lean documents. `Tour` requires destination, country/location/title/description/date/price in its schema, but list filters themselves are not schema-validated. Query and populate failures are passed to Express `next(error)`.
- **Success:** HTTP 200 `{success:true,page,limit,total,pages,count,tours}`; `pages` is `Math.ceil(total / limit)`. No local error response is defined.
- **Side effects:** Read-only; no external integration or database writes.
- **Frontend callers:** `getAdminTours` in `client/src/api/adminTourApi.js` (used by `client/src/pages/admin/ManageTours.jsx`) and the parallel wrapper in `client/src/api/adminApi.js`. `ManageTours` sends no query params and performs its text filtering locally in the browser.
- **Test evidence:** `server/tests/firstTenantAcceptance.integration.test.js` creates a tenant tour and verifies its tenant ownership, but the MongoDB-backed test is opt-in/skipped without `FIRST_TENANT_TEST_MONGODB_URI`; no dedicated GET list pagination/filter contract test was found.

## Source references

- Route/middleware: `server/routes/adminTourRoutes.js` (`router.use`, `router.get`); mount: `server/routes/index.js`.
- Handler: `server/controllers/adminTourController.js` (`getAllTours`).
- Tenant enforcement: `server/models/Tour.js` applies `tenantPlugin`; query hooks are in `server/tenancy/tenantPlugin.js` (`find`, `countDocuments`).
- Schema: `server/models/Tour.js` (`tourSchema`).
- Callers: `client/src/api/adminTourApi.js`, `client/src/api/adminApi.js`, `client/src/pages/admin/ManageTours.jsx`.
