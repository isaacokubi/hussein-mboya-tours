# Tour manager dashboard contract

## `GET /api/tourmanager/dashboard` and `/api/tour-manager/dashboard`

Both paths reach the same router and handler. `server/routes/index.js` mounts `tourManagerRoutes` under both `/tourmanager` and `/tour-manager`, and `server/app.js` adds `/api`.

- **Access:** Router middleware is `protect` → `resolveTenant` → `managerOnly`; the handler requires tenant context. No query, path, body, or special header fields are read.
- **Reads:** Tenant-scoped, non-deleted Tour and Booking counts/lists; tenant customer User count; paid booking revenue via `getBookingRevenueMetrics`; populated destinations and assigned guide/driver/vehicle for upcoming tours; populated customer/user/tour/custom-tour request for recent bookings. Upcoming tours include statuses `scheduled`, `upcoming`, `confirmed`, `active`, and `ongoing`, with date `startDate` or legacy `date` on/after request time. The response includes up to 10 upcoming tours and 6 newest bookings.
- **Guest counts:** For displayed upcoming tours, aggregates non-deleted tenant bookings whose status is confirmed/assigned/ongoing/completed or whose payment status is paid. Guest quantity falls back through `numberOfGuests`, `guests`, `numberOfPeople`, then 1. Capacity uses tour capacity or availability total slots. `availableSlots` is clamped at zero and occupancy is rounded and capped at 100; zero capacity yields zero occupancy.
- **Transformation:** Tour records become dashboard summaries with duplicate `id`/`_id`, title/name, date, guest/capacity/availability metrics, destination and assigned resource aliases, and status defaults. Recent bookings normalize customer identity from populated customer, snapshot, contact, then user fields; missing tour data may become a custom-tour label or “Tour record unavailable”. Amount uses totalAmount/amount/price fallback; status/payment/date receive display defaults.
- **Success:** HTTP 200 `{success:true,data:{stats:{totalTours,upcomingTours,totalCustomers,revenue,revenueSource:"paid_booking_value"},upcomingTours:[...],recentBookings:[...]}}`.
- **Failures:** Errors are logged and passed to centralized Express error handling. No direct writes or external provider calls occur in this handler; it relies on the revenue service for paid-booking aggregation.
- **Revenue source detail:** getBookingRevenueMetrics sources revenue from posted tenant JournalEntry lines joined to active revenue accounts; it separately counts paid bookings. The emitted revenueSource "paid_booking_value" label therefore does not match the service revenue computation.
- **Frontend:** Tour-manager dashboard pages consume this endpoint through the shared API layer; the route aliases are server compatibility paths and share identical behavior.

The dashboard's `totalTours` count includes every non-deleted tenant tour, while `upcomingTours` is a count of only future-dated active-status tours. These fields therefore have different filters. The data is a dashboard snapshot assembled from parallel reads and is not transactionally consistent across collections.
