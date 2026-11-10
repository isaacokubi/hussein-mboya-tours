# Application learning manual

This manual teaches the main runtime paths from the repository. Code excerpts are taken from current source; line numbers in links point to the files. The generated [source walkthrough index](code-explanations/source/INDEX.md) provides per-file structural maps, while this guide explains the system-level reasoning behind the most important flows.

## 1. Start with the process and request pipeline

### Simple explanation

The API process opens an HTTP listener, connects to MongoDB, then serves requests through an ordered Express middleware chain. One request usually crosses global middleware, tenant/auth guards, a route handler, service/model code, and a JSON response.

### Important concepts

- **Node entry module:** starts the server and background tasks.
- **Express middleware:** ordered functions that can modify the request, reject it, or pass it onward with `next()`.
- **Readiness:** whether required startup work and MongoDB are available; different from process liveness.
- **Error boundary:** the last Express error handler converts thrown/passed errors into HTTP responses.

In [`server.js`](../server/server.js), the HTTP listener starts before asynchronous DB initialization. That lets liveness answer during a DB outage; `app.js` still gates database-dependent requests until connected. The bootstrap sequence and cleanup are explained in [server startup](code-explanations/backend/server-startup.md).

In [`app.js`](../server/app.js), middleware order matters: request context, Helmet, rate limits, CORS, readiness, body parsing/cookies, logging, staging handlers, tenant resolution, then routers. A middleware moved after a route cannot affect requests already answered by that route.

### Debugging exercise

Request `/api/live`, `/api/health`, then a normal catalog endpoint while Mongo is disconnected. Explain why liveness can return 200 while a DB-backed endpoint returns 503. Trace the error response to the last middleware in `app.js`.

### Interview prompt

**Why separate liveness and readiness?** Liveness determines whether the process should be restarted; readiness determines whether it can safely serve requests requiring dependencies.

## 2. Authentication, roles, permissions, and tenant context

### Simple explanation

The token proves a signed identity claim. The server reloads the current user, verifies they are active, checks the caller's tenant, and only then allows route-specific role/permission checks.

### Actual code: CSRF and user reload

From [`authMiddleware.js`](../server/middleware/authMiddleware.js):

```js
if (source === "cookie" && !["GET", "HEAD", "OPTIONS"].includes(String(req.method || "").toUpperCase())) {
  const csrfCookie = String(req.cookies?.csrfToken || "").trim();
  const csrfHeader = String(req.get("X-CSRF-Token") || "").trim();
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ success: false, message: "CSRF validation failed." });
  }
}

const userId = decoded.sub || decoded.id || decoded._id || decoded.userId;
if (!userId) return res.status(401).json({ success: false, message: "Invalid authentication token." });
const loadUser = () => User.findById(userId).select("-password").populate({ path: "roleId", populate: { path: "permissions" } }).populate("permissionsOverride");
const user = await runWithTenant({ role: "super_admin", bypass: true }, loadUser);
```

1. The CSRF comparison applies only when authentication used the cookie; a Bearer token is explicitly detected as a different source.
2. Only unsafe HTTP methods are checked because browsers do not normally mutate state via GET/HEAD/OPTIONS.
3. A user identifier is required before a database lookup.
4. The query hides the password hash and loads role permissions/overrides so authorization uses current DB state.
5. The narrowly scoped bypass here lets middleware load identity across tenant scope; subsequent code enforces the resolved tenant and assigns a request context.

The remainder of `protect` rejects missing/inactive accounts, checks token/request/user tenant IDs, attaches `req.user` and calls `next()`. `requireRoles` and `checkPermission` are separate authorization layers. See [authentication explanation](code-explanations/backend/auth-middleware.md).

### Debugging exercise

Compare an invalid token (401), inactive account (403), CSRF mismatch (403), and authenticated wrong-tenant request (403). Use a development account and inspect response status without printing token contents.

### Interview prompt

**Why reload the user instead of trusting the role in a JWT?** It reflects account disablement and current permissions and gives the server a database-backed tenant identity to compare with request selectors.

## 3. Frontend request and server-state flow

### Simple explanation

Pages collect user intent. A small API function calls shared Axios. TanStack Query stores remote results and refetches/invalidate them after mutations. The backend remains authoritative for access and business rules.

### Request construction

[`client/src/api/axios.js`](../client/src/api/axios.js) chooses the API base, validates production URL configuration, sets credentials, separates anonymous auth calls from authenticated calls, attaches a bearer token and tenant selector where applicable, and adds CSRF headers to unsafe cookie-authenticated operations. Values prefixed with `VITE_` are public browser build configuration.

The API wrapper [`bookingApi.js`](../client/src/api/bookingApi.js) demonstrates a small transport boundary:

```js
export const createBooking = async (data) => (await api.post("/bookings", data)).data;
export const getBooking = async (id) => (await api.get(`/bookings/${id}`)).data;
```

The first function serializes the supplied object as request body. The second embeds the ID in the URL. Both return response data; if Axios rejects, the returned promise rejects and the page/query mutation handles the error.

### Query state and UI

`PaymentStatus.jsx` uses `useQuery` to retrieve persisted booking/payment state. Its polling callback stops when a terminal status appears or balance reaches zero. Mutations call provider/API wrappers; invalidation asks the query cache to retrieve current server state. The page also guards PayPal capture with a ref so rerenders do not re-trigger the capture effect.

### Debugging exercise

Open DevTools Network, trigger a booking read, identify its method/path/body, and follow the `bookingApi.js` export into `axios.js`. Then inspect the query key and invalidation in the calling page. Never copy authorization headers into notes.

### Interview prompt

**Why use React Query for remote state?** It tracks asynchronous loading/error/data and cache lifecycle; local `useState` remains suitable for form fields and transient UI state.

## 4. Booking, capacity, and MongoDB transactions

### Simple explanation

The server validates the selected product and date, calculates the price, checks capacity and persists a booking. A transaction-aware helper exists, but the main customer booking controller does not call it; that controller uses reservation followed by document creation and compensation on errors. Keep these code paths distinct when explaining behavior.

### Route and input guards

[`bookingRoutes.js`](../server/routes/bookingRoutes.js) applies router-wide `resolveTenant` and `protect`. The creation endpoint then applies `customerOnly` and `validateBookingTravelDate` before `createCustomerBooking`:

```js
router.post("/", customerOnly, validateBookingTravelDate, createCustomerBooking);
```

The controller reads tour/date/travelers/payment/contact information from `req.body`, queries the tour with a tenant filter, validates guest count and capacity, and calculates the amount server-side. For corporate bookings it checks account status/credit and reserves exposure; on booking creation failure, its catch path releases tour slots and corporate credit. This flow uses `reserveSlots` and direct `Booking.create`; the separate `createBookingAtomically` helper is another transaction-aware path and should only be claimed for callers that actually use it.

### Actual transaction helper

From [`bookingCreationService.js`](../server/services/bookingCreationService.js):

```js
export const createBookingAtomically = async ({ tourId, travelers, travelDate, bookingData }) => {
  requireTenantId();
  const session = await mongoose.startSession();
  try {
    let booking;
    await session.withTransaction(async () => {
      if (tourId) await reserveSlots(tourId, travelers, travelDate, session);
      const created = await Booking.create([bookingData], { session });
      booking = created[0];
    });
    return booking;
  } finally {
    await session.endSession();
  }
};
```

- `requireTenantId()` prevents creation without an active tenant.
- `startSession()` provides the Mongo transaction context.
- `withTransaction()` retries/commits according to driver behavior; slot reservation and document creation receive the same session.
- `Booking.create([bookingData], { session })` uses an array so Mongoose accepts transaction options.
- `finally` closes the session on success or error.

Mongo transactions require a replica-set or sharded deployment. The `Booking` model also enforces schema invariants and indexes; see [all model explanations](code-explanations/database/models/INDEX.md).

### Debugging exercise

Use a test tenant with two requests competing for the final slot. Check the availability/inventory record and booking collection afterward. Confirm whether the exact booking route under test calls the transaction helper or compensating cleanup; do not assume all booking paths share one implementation.

### Interview prompt

**How do you reduce overselling risk?** Reserve capacity atomically or in a transaction with the booking write, use tenant-scoped conditional updates, and test concurrent reservations against the actual Mongo topology.

## 5. M-Pesa and payment lifecycle

### Simple explanation

The server asks Daraja to prompt a phone. Daraja's acceptance creates a pending provider attempt. A later callback/query must be verified before the payment lifecycle records completion.

### Actual STK controller path

[`mpesaController.js`](../server/controllers/mpesaController.js) first requires tenant context, loads tenant settings, checks that M-Pesa is enabled, reads `bookingId` and phone, finds the tenant-scoped booking, checks payment access and computes the server-authoritative balance. It reuses or blocks an existing pending/processing attempt. The phone is normalized and gateway credentials are checked before a new attempt is persisted, avoiding a stuck attempt from invalid input.

The important state sequence is:

1. Persist `Payment` with `status: "processing"` and `activeAttempt: true`.
2. Call `initiateStkPush` and receive provider request identifiers.
3. Save those IDs, set payment to pending, and set booking payment status pending.
4. Return a “waiting for confirmation” response.
5. Process the provider callback through payload validation, tenant resolution, integrity/provider query, and lifecycle update.

The response in step 4 does **not** mean funds settled. If transport fails after request submission, status may be uncertain; reconcile before retrying.

### Callback trust boundary

`resolveMpesaCallbackTenant.js` reads checkout ID from the callback and searches payment/subscription records using a scoped bypass to discover the tenant. It sets tenant context before continuing. `mpesaCallbackIntegrity.js` validates callback shape, finds the corresponding record in that tenant, queries Daraja and compares provider state with callback state. Unknown attempts, state mismatch and provider verification failures return errors without proceeding to the lifecycle controller.

### Debugging exercise

Follow a mocked STK request through `Payment` fields. Then test invalid phone, zero/excess amount, duplicate pending attempt, malformed callback, unknown checkout ID and callback/provider state mismatch. For each, state whether a `Payment` record is created or changed.

### Interview prompt

**What does a successful STK API response prove?** That the provider accepted a prompt request and returned identifiers. It does not prove customer approval or settlement; verified callback/query state must be persisted.

## 6. Data model and tenant ownership

### Concepts

Mongoose schemas validate document fields and add behavior on top of MongoDB collections. `ref` is an application-level ObjectId relationship. `tenantId` and the tenant plugin/query context help scope documents, but raw collection access and aggregations need explicit controls.

Every model now has a [compiled schema page](code-explanations/database/models/INDEX.md). The documentation generator imports schemas with placeholder environment values and does not connect to a database. It reports actual compiled field metadata and indexes. Field-purpose prose is labeled inferred where the schema does not specify business semantics.

### Exercise

For `Payment`, identify `tenantId`, `booking`, `status`, `provider`, `activeAttempt` and partial unique indexes. Search its hooks and callers to see how invoice, ledger and commission updates occur. Then compare a direct `Payment.create` call with a bulk update to determine which middleware executes.

### Interview prompt

**Why is a Mongoose ref not a foreign key?** MongoDB does not enforce referential integrity across documents; application code must validate target existence, tenant ownership and deletion behavior.

## 7. Deployment and environment configuration

`render.yaml` describes an API service and static client; `vercel.json` describes a separate Vite frontend deployment shape. Neither file proves a current deployment. `MONGODB_URI`, JWT and provider secrets are server-side settings. `VITE_*` values are public configuration embedded at client build time.

The API's `/api/live` reports process liveness; `/api/health` and `/api/ready` report database/startup readiness. Use host logs and deployed SHA to establish actual release state. Check [deployment](DEPLOYMENT.md), [environment reference](ENVIRONMENT_VARIABLES.md), and dated readiness evidence.

### Exercise

Trace a local request and a production build's `VITE_API_URL`. Explain why production requires HTTPS and the `/api` suffix, then verify CORS origins match the deployed browser origin. Never inspect or paste secret values into a public build.

### Interview prompt

**What is required to claim end-to-end payment readiness?** Provider sandbox credentials, reachable callback, successful initiated and verified transaction, persisted status/reconciliation evidence, and a controlled production configuration review.

## How to study the remaining files

Use [the source walkthrough index](code-explanations/source/INDEX.md) to open a file-specific structural guide. For each feature, trace the caller, route, middleware, handler, service and model. Automated cues identify operations and line ranges, but read the source to confirm aliases, dynamic imports, hidden helper behavior and full error cases.
