# Booking operations read and status routes (entries 193–197)

Shared router `server/routes/bookingRoutes.js` has `resolveTenant` → `protect`; tenant context is required by handlers and Booking queries. No branch restriction. Admin list operations apply additional role guards.

## GET `/api/bookings/confirmed` (193)

`managerOnly` permits manager, admin, SuperAdmin. Optional `page` default 1/min 1 and `limit` default 20/clamped 1–100. Filters non-deleted tenant bookings to `paymentStatus:"paid"` and status confirmed/assigned/ongoing, populates customer/user/tour/guide/driver/vehicle summaries, sorts travelDate ascending, then verifies every populated reference and known snapshot/contact email belongs to the same tenant using explicit raw collection reads. Records with missing/foreign references are excluded. Success 200 `{success:true,page,pages,total,count,bookings,data}` (bookings and data alias the same page). Errors forwarded. No writes.

## GET `/api/bookings/admin` (194) vs `/api/bookings/admin/all` (195)

Both call `getAllBookings`, but `/admin` allows manager/admin/SuperAdmin (`managerOnly`) while `/admin/all` allows admin/SuperAdmin only (`adminOnly`). Optional page/limit as above; `search` regex is applied to bookingNumber, customerSnapshot name/email/phone and contact name/email/phone (unescaped); `status` and `paymentStatus` are applied only when exact members of booking constants, otherwise ignored. It selects non-deleted tenant bookings newest first, populates refs and explicitly loads raw collection tenant ownership for each linked customer/user/tour/staff/vehicle and emails. Foreign or unresolved references are filtered. It computes total after loading/filtering all candidate documents in memory, then slices pagination, so count/page can be expensive for large tenants. Success 200 `{success:true,count,pagination:{total,page,pages,limit},data,bookings}`. No writes; failures centrally handled. No matching first-party direct caller found for these route aliases in the API wrapper search; admin UI uses `/api/admin/bookings`.

## PUT `/api/bookings/:id/status` (196)

Requires `adminOnly`, then `requireFullPaymentForTrip`, then controller. Body `status` must be one of `BOOKING_STATUSES`; same value returns 400; invalid returns 400 with allowed list; invalid transitions return 409 with current/requested status. Before status `ongoing` or `completed`, middleware loads totals and requires paymentStatus paid and outstanding balance zero (otherwise 409 `PAYMENT_REQUIRED_BEFORE_TRIP`). Controller additionally requires paid for `completed` and returns `PAYMENT_REQUIRED_BEFORE_COMPLETION` if not. On success sets status and saves, returns 200 `{success:true,message,booking}`. No explicit ID validation or isDeleted exclusion in the controller; Mongoose cast/database errors are centralized. No payment status writes, notifications or transaction. This legacy endpoint is distinct from admin booking route `/api/admin/bookings/:id/status`.

## GET `/api/bookings/:id` (197)

Any authenticated tenant role can reach handler, but only privileged roles (admin, super_admin, administrator, manager, tourmanager, guide, tourguide, agent, travelagent) bypass ownership checks. Invalid ObjectId 400, missing/cross-tenant/soft-deleted booking 404. It reads a tenant-scoped booking, populates selected Tour/User/Customer/assigned resource fields, and customer users must match booking.user or populated customer.user. The fallback compares Customer document ID to User ID, which generally will not match; a booking attached only by Customer ref without matching customer.user can therefore return 403. Authorized response is 200 `{success:true,message:"Booking retrieved successfully",data:{booking}}` via `successResponse`. It does not write. First-party callers include `getBooking` and `getBookingById` in `client/src/api/bookingApi.js`.

Existing test evidence: `productionReadinessContract.test.js` has source-contract assertions for booking lifecycle and auth boundaries but no end-to-end request/database test for these list/detail/status handlers was found. Source-reviewed, not live executed.
