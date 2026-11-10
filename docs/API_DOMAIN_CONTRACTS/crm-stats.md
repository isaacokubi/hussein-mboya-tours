# CRM statistics contract

## `GET /api/crm/stats` (inventory entry 214)

**Status: SOURCE-TRACED.** Source scope: `server/routes/crmRoutes.js` (`resolveTenant`, then router-wide `protect`, `adminMiddleware`, `authorize("manage_customers")`), `server/controllers/crmController.js:getCRMStats`, and the `Customer`, `Booking`, and `User` models. Client caller: `client/src/api/crmApi.js:getCRMStats` (also a duplicate `getAll` helper); the service requests `/crm/stats` through the shared Axios client. No focused CRM controller test was found in the backend test inventory.

- **Method/path:** `GET /api/crm/stats`, mounted from the API router at `/api/crm`.
- **Authentication/authorization:** Tenant resolution runs before JWT protection. The request must pass `adminMiddleware` and the `manage_customers` permission. The route has no controller-level role check.
- **Request:** No path, query, body, or custom header is read by this handler. Tenant selection is established by the shared tenant middleware and Axios client conventions.
- **Success:** Express default status 200, JSON `{ success: true, customers: <number>, bookings: <number>, users: <number> }`.
- **Database behavior:** The controller runs `Customer.countDocuments()`, `Booking.countDocuments()`, and `User.countDocuments()` in parallel. Despite `resolveTenant` and an imported but unused `mergeTenantFilter`, these queries do not apply tenant filters. This is a confirmed cross-tenant aggregation risk in the current implementation; the permission gate alone does not scope the counts.
- **Failure:** A rejected count logs `CRM Stats Error` and returns 500 `{ success:false, message: publicErrorMessage(error) }`. No partial result is returned if any count fails.
- **Side effects/integrations:** Read-only counts; no notifications or external service calls.
- **Unverified behavior:** No live request was run. Existing tests do not establish the authorization chain or database isolation behavior. The cross-tenant behavior is source-observed, not an assertion about production data.

The `healthCheck` export in the controller is not mounted by this router and is not part of this contract.

## `POST /api/custom-tour-requests` through `POST /api/custom-tour-requests/:id/convert` (entries 215–220)

**Status: SOURCE-TRACED.** Shared route setup is in `server/routes/customTourRequestRoutes.js`: `resolveTenant` applies to every path; create uses `optionalProtect`; `/mine` uses `protect`; admin list/quote/assign use `protect` and `adminMiddleware`; convert uses `protect` and relies on customer ownership in its controller. Controller symbols are in `server/controllers/customTourRequestController.js`. Model: `CustomTourRequest`; related writes/readers include `User`, `Staff`, `Agent`, `Notification`, `Destination`, `Tour`, and `Booking`. No focused tests for these controller flows were found in the backend test inventory.

### Create request — `POST /api/custom-tour-requests`

- Body reads `destination`, `durationDays`, `people`, optional `startDate`, `budget`, requirements/pickup/preferences/emergency/special fields, and guest identity fields. `destination` must be truthy and numeric `durationDays` and `people` must be at least 1. Anonymous callers must supply non-empty name and email; authenticated callers can fall back to `req.user` identity. Values are trimmed/coerced; missing budget defaults to 0, adults to `people || 1`, children to 0, and optional strings to empty strings. Date strings are converted with `new Date` without explicit validity validation in the controller; schema validation may also apply.
- Creates a tenant-stamped request and, if active tenant admins exist, inserts notifications. Notification failure reaches `next(error)` after the request has already been created, so the client may see failure while the request persists.
- Success: 201 `{success:true,message,request}`. Missing required fields/guest identity: 400. Other errors are delegated to central middleware.

### Customer list — `GET /api/custom-tour-requests/mine`

- Requires authenticated user; no query/body fields. Finds tenant-filtered requests by `customer:req.user._id`, sorts newest first, returns 200 `{success:true,requests}`. Errors go to central middleware.

### Admin list — `GET /api/custom-tour-requests/admin`

- Requires authenticated admin. No request fields. Finds using `tenantFilter(req)`, populates customer name/email/phone, sorts newest first, returns 200 `{success:true,requests}`. Errors go to central middleware.

### Quote/reject — `PATCH /api/custom-tour-requests/admin/:id/quote`

- Body: `status` defaults to `quoted`, `quotedAmount`, `adminNotes` defaults empty. Allowed status values: `approved`, `quoted`, `rejected`; non-rejected decisions require finite `quotedAmount > 0`. Rejected requests store amount 0. Tenant-scoped lookup returns 404 if missing; already `converted` or `rejected` requests return 409. Uses validated `findOneAndUpdate`, returns the populated request. Customer notification is emitted for a linked customer; notification errors are handled as request errors after the update, so persistence may precede an error response. Invalid values return 400.

### Resource assignment — `PATCH /api/custom-tour-requests/admin/:id/assign`

- Optional body IDs: `guide`, `driver`, `agent`; omitted values clear the corresponding assignment. Request must exist in tenant and not be converted/rejected (404/409). Supplied guide/driver must be active, not deleted, of matching position, and have availability `available` or `busy`; agent must be active and approved. Invalid or cross-tenant IDs return 400. Saves the request and returns 200 `{success:true,request}`. This validates eligibility but does not reserve staff availability.

### Convert — `POST /api/custom-tour-requests/:id/convert`

- Requires JWT and controller-level tenant, owner and status match: request must belong to `req.user` and be `quoted` or `approved`; otherwise 404. No body is consumed.
- If an existing linked booking is found, returns it idempotently. Otherwise lazily finds/creates a generic unpublished “Custom Tour” destination and a generic unavailable “Custom Tour Package”, then creates a pending booking snapshot with quoted amount, guest count, pickup and preference details. Finally marks the request converted and stores the booking ID.
- Success 200 `{success:true,booking}` (with a different message for an already linked booking). Errors go to central middleware.
- There is no transaction or atomic claim around conversion; concurrent calls can race between checking `bookingId`, creating a booking, and saving the request. A booking can persist while the request update fails. This risk and lack of focused concurrency tests are unresolved.

No live request was executed. Request/response descriptions above are based on implementation; schema validators and centralized error formatting remain the final authority for persistence failures.
