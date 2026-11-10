# Customer booking management routes (entries 189–192)

All four operations run after `bookingRoutes.js` router-wide `resolveTenant` → `protect`, then `customerOnly`. No branch guard. Controllers use tenant-scoped Booking/Tour/Customer queries.

## GET `/api/bookings/my-bookings` (189)

Optional `page` defaults 1 and minimum 1; `limit` defaults 20 and clamps 1–100. Controller finds an active Customer profile for `req.user`, then filters non-deleted bookings where `user` is the user ID or `customer` is that profile ID; if no profile, only `user` ownership. It loads total, paginated bookings (travelDate ascending, createdAt descending; populates Tour/User/Customer), and all owned booking summaries in parallel. Returns 200 `{success:true,page,pages,total,count,bookings,stats:{totalTrips,loadedTrips,upcomingTrips,completedTrips,cancelledTrips,totalSpent}}`. Upcoming excludes cancelled/refunded and requires travelDate >= local start of today. Total spent only sums qualifying confirmed/completed/assigned/ongoing records with paid/completed/success payment state, preferring amountPaid, paidAmount, depositAmount, totalAmount, amount, and subtracting refundAmount with floor zero. Errors forwarded. Client `getMyBookings` in `client/src/api/bookingApi.js` calls this.

## PUT `/api/bookings/cancel/:id` (190)

No body fields used by handler. Invalid ObjectId returns 400; missing tenant booking 404; non-owner 403; already cancelled or completed returns 400. Controller changes status to cancelled; changes `paymentStatus` to cancelled only when it is not `paid`; paid bookings remain marked paid and this handler does not issue a refund. If booking has Tour, it calls `releaseSlots(tour,numberOfGuests,travelDate)`, sets cancelledAt, then saves Booking and returns 200 `{success:true,message,booking}`. Release and Booking save are not in a transaction; if later save fails, capacity may be released while booking remains active. Repeated cancellation is stopped before release. No email/notification or refund side effect. Client `cancelBooking` calls this route.

## PUT `/api/bookings/reschedule/:id` (191)

Body reads `newTravelDate` and optional `reason` default empty. Date must parse and be strictly future (400 otherwise). Loads booking by tenant, ID, and `user` or customerSnapshot.email equal to authenticated email; missing 404. Cancelled/completed/refunded, same date, or outside configured Tour date range is rejected (400); missing Tour range is 409. Tour range starts at startDate/date and ends at later of stored endDate or calculated duration. Saves originalTravelDate once, new travelDate, adjusted pickupTime day, incremented rescheduleCount and history row `{fromDate,toDate,reason}`. Then creates customer notification and notifies active tenant admins/managers. Success 200 `{success:true,message,booking}`. There is no ObjectId check, capacity release/reservation, transaction, or duplicate request key. A notification write failure after booking save may return error despite successful date change.

## PUT `/api/bookings/:id/travel-date` (192)

Body `travelDate` must parse; controller requires tenant and finds by tenant, ID, and `user` equal to auth User (not Customer ref or snapshot email). Cancelled/completed/refunded returns 400; missing 404. It derives allowed range from associated Tour, or CustomTourRequest startDate/duration; absent range 409, out-of-range 400. On success updates travelDate and preserves pickupTime clock components, saves, returns `{success:true,message,booking}` (default 200). It does not record original date/history/count, notify parties, require target future independently, or reserve capacity for the new date. No transaction. Client wrapper `updateBookingTravelDate` calls this.

No dedicated HTTP/database integration test for these four handlers was found in the inspected tests; documented behavior is source-verified, not runtime-exercised.
