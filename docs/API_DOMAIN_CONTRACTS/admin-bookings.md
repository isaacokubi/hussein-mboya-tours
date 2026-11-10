# Admin booking API contracts

These contracts were traced through current mounted source. They are source-inspected, not live-tested. Every route in this file is mounted by `server/routes/index.js` under `/api`; `adminBookingRoutes` is mounted at `/admin/bookings`, and `adminRoutes` at `/admin`.

## Shared access controls

The dedicated booking router runs `resolveTenant` → `protect` → `adminMiddleware` → `authorize("booking.manage")` before all routes. Requests therefore need an authenticated admin identity, tenant context, and the `booking.manage` permission. The router-level middleware does not expose a per-route override. The `adminRoutes` refund aliases instead run `protect` → `resolveTenant` → `adminMiddleware`; those refund declarations do not add `authorize("booking.manage")` in that router. The route-specific access difference is important and should be reviewed as a security policy decision.

Tenant reads/writes use tenant context filters. Booking list/detail additionally verify that populated customer/user/tour/guide/driver/vehicle references and snapshot identities are tenant-consistent; inconsistent records are hidden. `PUT .../assign` also runs `guardBookingResources`, which checks tenant ownership, availability, ID syntax and same-day assignment conflicts before the controller.

## `GET /api/admin/bookings`

- **Source:** `server/routes/adminBookingRoutes.js` → `tenantBookingAdminController.getBookings` (alias of `getAllBookings`).
- **Request:** Optional query `page` and `limit` are numeric; defaults are 1 and 20, lower bounded at 1, limit capped at 100. Optional `search` is converted to case-insensitive regex across booking number and customer snapshot/contact name, email and phone. `status` and `paymentStatus` are applied only when they exactly match the constant arrays in `server/constants/bookingConstants.js`; invalid values are ignored rather than rejected. No custom request headers beyond standard auth/tenant context are required by the handler.
- **Implementation/data:** Loads tenant-scoped, non-deleted bookings newest first, populates customer, user, tour and assigned resources, then checks referenced-record and snapshot-email tenant ownership using Customer, User, Tour, Staff and Vehicle collections. It filters unsafe/legacy references, then paginates in memory after loading/filtering the candidate result set.
- **Success:** HTTP 200 `{success:true,count,pagination:{total,page,pages,limit},data,bookings}`. `data` and `bookings` contain the same page.
- **Failure:** Database/population failures are delegated to Express error handling. Missing tenant context is rejected through `requireTenantId`/tenant middleware. No explicit malformed-query error is returned.
- **Side effects:** Reads only. Pagination after full candidate loading can be expensive for large tenants.

## `GET /api/admin/bookings/:id`

- **Source:** Same router → `tenantBookingAdminController.getBooking`.
- **Request:** `id` is a Mongo ObjectId path parameter. Auth and tenant requirements are shared above.
- **Implementation/data:** Validates ObjectId syntax, queries tenant-scoped non-deleted Booking, populates customer/user/tour/assigned resources, then applies the same reference ownership check as the list route.
- **Success:** HTTP 200 `{success:true,data:booking,booking:booking}`.
- **Errors:** 400 `{success:false,message:"Invalid booking ID."}`; 404 for missing or cross-tenant-inconsistent booking; unexpected errors go to centralized handling.
- **Side effects:** Read only.

## `PUT /api/admin/bookings/:id/status`

- **Source:** `bookingAdminController.updateBookingStatus`.
- **Request:** Path `id`; JSON body `status` must be one of `pending`, `failed`, `confirmed`, `assigned`, `ongoing`, `completed`, `cancelled`, `refunded`. Optional `reason` is passed to the status email helper. There is no route-level body schema shown in this route module.
- **Implementation/data:** Validates ID and status, loads the tenant booking, rejects same-status updates and transitions not permitted by `canTransitionBookingStatus`. A transition to `completed` additionally requires `booking.paymentStatus === "paid"`. A tenant-filtered `findOneAndUpdate` writes status with Mongoose validators and populates related display fields.
- **Success:** HTTP 200 `{success:true,message:"Booking status updated successfully.",data:booking}`.
- **Errors:** 400 invalid ID/status, no-op, illegal transition, or completion while unpaid; 404 if booking is absent at either read or update; unexpected errors are forwarded.
- **Side effects:** Sends status email best-effort after persistence. Email failure is handled by the helper and does not undo the booking update. No transaction wraps the update and email.

## `PUT /api/admin/bookings/:id/assign`

- **Source:** `guardBookingResources` → `bookingAdminController.assignResources`.
- **Request:** Path `id`; optional body IDs `guide`, `driver`, `vehicle`, `agent`. Each supplied ID must be a valid ObjectId. The guard requires booking in the active tenant; supplied guide/driver must be active Staff with the matching position, vehicle active, agent not deleted. It rejects unavailable vehicle/staff and another non-terminal booking using the same guide/driver/vehicle on the same calendar date. Allowed staff availability values are absent or `available`/`busy`.
- **Implementation/data:** Controller reloads the tenant booking; requires payment status `paid`; permits transition to `assigned` only when the lifecycle allows it, while already-assigned bookings can be reassigned. Writes supplied IDs and `status:"assigned"` with validators, then populates resources.
- **Success:** HTTP 200 `{success:true,message:"Resources assigned successfully.",data:booking}`.
- **Errors:** Guard returns 400 invalid IDs, 404 missing booking, or 409 unavailable/cross-tenant/conflicting resources. Controller returns 400 unpaid/illegal transition, 404 if update misses, or forwards unexpected failures.
- **Side effects/limitations:** Booking update is not in a transaction with the preceding checks. Concurrent assignments can race because the guard query and update are separate operations; source does not show a unique scheduling constraint in this handler.

## `PUT /api/admin/bookings/:id/payment`

- **Source:** `bookingAdminController.updatePaymentStatus`.
- **Request:** Path `id`; body is ignored. Same shared admin/tenant/booking permission middleware applies.
- **Actual response:** Always HTTP 410 `{success:false,code:"BOOKING_PAYMENT_STATUS_READ_ONLY",message:"Booking payment status is derived from the verified Payment ledger. Use the payment lifecycle workflow instead of editing booking.paymentStatus directly."}`.
- **Database/side effects:** None. This route is intentionally read-only and instructs callers to use the verified payment lifecycle.

## `GET /api/admin/bookings/:id/timeline`

- **Source:** `bookingAdminController.getBookingTimeline`.
- **Request:** Path `id`; no query/body fields read.
- **Implementation/data:** Tenant-scoped Booking lookup, populates customer/tour, then reads the latest Payment whose status is `completed` or `refunded`, sorting by paid/update/create times. It constructs three timeline entries (creation, payment status, booking status); it does not read an event-history collection.
- **Success:** HTTP 200 `{success:true,timeline:[{event,status,date}, {event,status,date,amount,paymentReference}, {event,status,date}]}`. Payment date and reference may be null when no matching payment exists.
- **Errors:** 404 missing booking; database errors forwarded. The handler does not explicitly validate ObjectId syntax before querying.
- **Side effects:** Read only. This is a synthesized summary, not a complete audit log.

## `GET /api/admin/bookings/:id/invoice`

- **Source:** `bookingAdminController.downloadBookingInvoice`.
- **Request:** Path `id`; no query/body fields.
- **Implementation/data:** Tenant-scoped booking lookup, populates customer and tour, then renders a plain-text invoice with booking ID, customer, tour, total, payment status, booking status and generation timestamp.
- **Success:** HTTP 200 text/plain body; no JSON envelope or generated PDF. The text labels the company `GLOBAL TOURS` and amount `KES` in the current source.
- **Errors:** 404 missing booking; other errors forwarded. No explicit ObjectId validation.
- **Side effects:** Read only; no Invoice model record is created.

## `POST /api/admin/bookings/:id/notify`

- **Source:** `bookingAdminController.sendBookingNotification`.
- **Request:** Path `id`; JSON `message` is converted to trimmed string and must be nonempty. No length limit is enforced in this handler.
- **Implementation/data:** Requires tenant context, finds tenant booking, populates user/customer references, chooses recipient from booking user or customer user reference, and creates a `Notification` document with booking metadata, `channel:"in_app"`, `isSent:true`.
- **Success:** HTTP 200 `{success:true,message,notification,channel:"in_app"}`.
- **Errors:** 400 invalid ID, empty message, or no linked user account; 404 booking absent; unexpected errors forwarded.
- **Side effects/limitations:** Creates an in-app notification only. This handler does not send email/SMS or prove the recipient saw the notification.

## Refund routes declared in `adminRoutes`

### `PUT /api/admin/bookings/:id/refund` and `POST /api/admin/bookings/:id/refund`

Both methods call `adminPaymentController.refundBooking`; route has admin authentication and tenant resolution but no explicit `authorize("payment.manage")` middleware. Body may contain `amount`; omitted amount defaults to payment amount minus `refundedAmount`. The controller tenant-loads booking, selects latest completed tenant payment, resolves a phone from payment or booking snapshots, and supports automated refund only when `provider` is `MPESA`. It calls `submitMpesaRefund`, which atomically claims the payment refund state with `findOneAndUpdate` before the Daraja call, then stores the provider reference and marks the booking refund status processing. Success is HTTP 200 with `{success,message,refundResponse,refundAmount,payment,booking}`. Missing booking/payment/phone returns 404/400; unsupported provider returns 501; amount/claim/provider failures are forwarded to centralized handling. This is a provider refund request, not proof that funds have been reversed.

### `PUT /api/admin/refunds/:id/process`

Calls `adminPaymentController.processRefund`. Body `status` defaults to `processing` and must be `requested`, `approved`, `processing`, `completed`, or `rejected`; optional `mpesaReference` is copied when truthy. It tenant-loads and saves the Refund, timestamps completed records, then either calls `refundBookingPayment` for a linked payment when status is completed, or updates linked booking `refundStatus` for other cases. Success is HTTP 200 `{success:true,message,data:refund}`. Invalid status is 400; missing refund is 404. The refund save and subsequent payment/booking update are sequential, not one transaction; an error after the Refund save can leave cross-record state requiring reconciliation.

## Curl templates

The examples below are syntax/templates only and were not executed. Replace the base URL, bearer token, tenant and IDs with disposable test fixtures. Cookie-authenticated browsers may need the CSRF cookie/header instead of bearer auth.

```sh
curl -i "$API_BASE_URL/api/admin/bookings?page=1&limit=20" -H "Authorization: Bearer $TEST_TOKEN" -H "X-Tenant-Slug: $TEST_TENANT"
curl -i -X PUT "$API_BASE_URL/api/admin/bookings/$BOOKING_ID/status" -H "Authorization: Bearer $TEST_TOKEN" -H "X-Tenant-Slug: $TEST_TENANT" -H 'Content-Type: application/json' --data '{"status":"confirmed"}'
curl -i -X POST "$API_BASE_URL/api/admin/bookings/$BOOKING_ID/notify" -H "Authorization: Bearer $TEST_TOKEN" -H "X-Tenant-Slug: $TEST_TENANT" -H 'Content-Type: application/json' --data '{"message":"Your booking has been updated."}'
```

## Frontend callers and unmatched caller

`client/src/api/adminBookingApi.js` calls the list, detail, status, assignment, payment, timeline, invoice, notify and booking-refund routes described above. `downloadInvoice` requests a Blob because the server returns text/plain; the client behavior does not turn it into a PDF. The `exportBookings()` wrapper requests `/admin/bookings/export?type=...`, but no matching route is mounted in `adminBookingRoutes`, `adminRoutes`, or another mounted router in the current source. Treat this as an unmatched frontend API call; it is not a functioning endpoint contract. `server/controllers/reportController.js` contains an export handler and a comment naming a different `/api/admin/reports/bookings/export` path, but no mounted route declaration uses that handler either.
