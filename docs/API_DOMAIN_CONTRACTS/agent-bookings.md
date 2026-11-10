# Agent booking API contracts

## Route aliases and shared middleware

`server/routes/index.js` mounts the same `agentBookingRoutes.js` router at both `/api/agents/bookings` and `/api/agent/bookings`. Therefore each operation has two mounted method/path entries (inventory 111–122); both aliases use the same controller, permissions, and response behavior. The plural `/agents/...` prefix is used by `client/src/api/agentBookingApi.js` and `client/src/services/agentBookingService.js`; legacy `client/src/api/agentApi.js` calls the singular alias for list.

The router pipeline is `resolveTenant` → `protect` → `agentMiddleware`. Authentication requires an active tenant user whose canonical role is agent. `agentMiddleware` tenant-loads the Agent profile (and can repair a missing `Agent.user` link by matching email), sets `req.agentPendingApproval`, but does **not** call `requireApprovedAgent`. Consequently list/detail/status/cancel routes do not enforce profile approval or active status in middleware. Booking creation separately requires approved+active profile. No branch scope. Tenant plugin query hooks constrain Agent/Booking/Tour/Customer queries where the handlers omit explicit tenant predicates.

## GET /api/agents/bookings and GET /api/agent/bookings (entries 111–112; repeated inventory entries 141–142)

**Effective runtime handler:** `server/routes/index.js` mounts the broad `agentRoutes.js` at both prefixes before the dedicated `agentBookingRoutes.js`. Therefore `GET /bookings` is handled by `agentController.getAgentBookings` first, with `requireApprovedAgent`; the dedicated controller’s same-path GET is shadowed. The effective handler accepts `page` (default 1, minimum 1), `limit` (default 10, clamped 1–10), and optional unvalidated `status`, returns `{success:true,data,bookings,pagination:{page,limit,total,pages}}`, and populates only tour title/name and customer summary fields. It filters by agent and nondeleted bookings and sorts newest first. This is a different response/query contract from the shadowed `agentBookingController.getAgentBookings` described below; the frontend route should be verified against the effective envelope.

Optional query keys for the shadowed handler only: `page` defaults 1 and clamps at minimum 1; `limit` defaults 20 and clamps 1–100; `status` is applied only if exactly in `BOOKING_STATUSES`, otherwise silently ignored; `paymentStatus` is passed through without enum validation; `search` is stringified/trimmed and used as case-insensitive regex against customer snapshot name/email/phone and bookingNumber (regex syntax is not escaped or length-limited).

Controller resolves Agent by authenticated user; missing profile returns 404. It finds non-deleted Booking records assigned to that agent, populates tour title/price/agentPrice/duration/destination and customer names/email/phone, newest first, paginates and counts. HTTP 200 `{success:true,page,limit,total,pages,count,bookings}`. Read-only aside from possible `Agent.user` repair in middleware. Both aliases are behavior-identical. Frontend callers are `getAgentBookings` in `agentBookingApi.js` and the legacy singular caller in `agentApi.js`.

## GET /api/agents/bookings/:id and GET /api/agent/bookings/:id (entries 113–114)

Validates booking ID; invalid returns 400 `{success:false,message:"Invalid booking ID."}`. Missing profile is 404. Looks up non-deleted booking by ID and assigned Agent profile; missing/cross-agent/cross-tenant returns 404. Populates full tour, full Customer, and user name/email/phone. Success 200 `{success:true,booking}`. It does not check agent approval/status after middleware. Caller: `getAgentBooking` in `agentBookingApi.js`.

## POST /api/agents/bookings and POST /api/agent/bookings (entries 115–116)

Starts a Mongo session/transaction. Request body reads `customer`, `tour`, `travelDate`, `travelers`, `pickupLocation`, `pickupTime`, `hotelName`, `roomNumber`, `emergencyContact`, `specialRequests`, `paymentMethod`, and `customerNotes`. `customer` and `tour` must be valid ObjectIds; travelDate must parse; travelers must be a nonempty array. No maximum traveler count or individual traveler validation occurs here; Booking schema validation still applies.

The controller finds the authenticated user's Agent profile and requires `isApproved` and `status === "active"`; otherwise 404 or 403. It tenant-loads Tour and Customer, and requires Customer.agent to match this Agent; missing records return 404. It rejects tour status only when `inactive` or `sold_out` (400); it does not check `available`, `published`, travel-date window, or reserve tour capacity. Price is `Number(tour.agentPrice ?? tour.price ?? 0)` and only finite/nonnegative is required; total is price × travelers.length. Payment method defaults to `MPESA` but is not normalized or checked against tenant payment settings.

Creates a pending Booking with bookingSource agent, snapshot/contact from Customer, assigned Agent, requested date/travelers, total/subtotal, commissionRate copied from Agent, and pending payment/status; no Payment request is initiated. It calls `createCommission(booking, session)` and updates Customer totalBookings/lastBookingDate in the transaction. Success 201 `{success:true,message:"Agent booking created successfully.",booking}`. Explicit errors: 400 invalid IDs/date/travelers/tour availability/price; 403 unapproved/inactive; 404 agent, tour, or agent-owned customer missing; other errors delegated after abort.

**Consistency gaps confirmed from source:** this flow does not reserve Tour capacity, so concurrent/duplicate agent bookings can exceed capacity even though a Mongo transaction is used for its own records. `createCommission` currently accepts only `booking` and does not pass the supplied session to its Commission/Agent writes; a later transaction abort can leave a commission outside the rolled-back booking. There is no request idempotency key. The transaction requires a replica set/sharded transaction-capable MongoDB deployment. No dedicated request-level test was found.

## PATCH /api/agents/bookings/:id/status and singular alias (entries 117–118)

Body requires `status` exactly in `BOOKING_STATUSES` (`pending`, `failed`, `confirmed`, `assigned`, `ongoing`, `completed`, `cancelled`, `refunded`). Invalid ID/status returns 400; missing agent profile or booking returns 404. Same status returns 400; disallowed `canTransitionBookingStatus` transition returns 409 with current/requested status. Moving to `ongoing` or `completed` requires `paymentStatus` case-insensitive `paid`, otherwise 409 code `PAYMENT_REQUIRED_BEFORE_COMPLETION`. It sets only booking status and updatedBy, saves, and returns 200 `{success:true,message,booking}`. It does not mutate paymentStatus. Middleware does not enforce agent approval/status. `productionReadinessContract.test.js` has a source-contract test asserting transition guard, payment guard, tenant/auth/agent middleware order and agent-scoped booking query; it does not execute HTTP/database behavior. Frontend `updateBookingStatus` calls plural route.

## PATCH /api/agents/bookings/:id/cancel, singular alias, and DELETE /api/agents/bookings/:id plus singular alias (entries 119–122)

All four routes call the same `cancelAgentBooking`. Body optionally reads `reason`; invalid ID 400, missing Agent profile or assigned booking 404, completed booking 400. It sets status cancelled, cancelledAt/by, reason (empty default), updatedBy, saves and returns 200 `{success:true,message:"Booking cancelled successfully.",booking}`. It does not validate a lifecycle transition, prevent repeat cancellation, release Tour capacity, change paymentStatus/refund fields, issue a refund, adjust commission, or send notifications. This is distinct from the transactional tour-wide cancellation service. The router accepts PATCH cancel with reason or DELETE without body; the client `cancelAgentBooking` wrapper uses DELETE plural. Middleware approval gap also applies.

## Source/test references

- Routes/mounts: `server/routes/agentBookingRoutes.js`, `server/routes/index.js`.
- Auth/profile lookup: `server/middleware/authMiddleware.js` (`protect`), `server/middleware/agentMiddleware.js`.
- Controller functions: `server/controllers/agentBookingController.js` (`createBooking`, `getAgentBookings`, `getAgentBooking`, `updateBookingStatus`, `cancelAgentBooking`).
- Lifecycle: `server/constants/bookingConstants.js` (`BOOKING_STATUSES`, `canTransitionBookingStatus`); commission: `server/services/commissionService.js` (`createCommission`).
- Data: `server/models/Booking.js`, `Tour.js`, `Customer.js`, `Agent.js`, `Commission.js`; tenant enforcement: `server/tenancy/tenantPlugin.js`.
- Client callers: `client/src/api/agentBookingApi.js`, `client/src/services/agentBookingService.js`, `client/src/api/agentApi.js`.
- Existing test: `server/tests/productionReadinessContract.test.js`, test named `agent booking status updates enforce lifecycle and payment boundaries`.
