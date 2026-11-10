# Booking route probe

`GET /api/bookings/test` (inventory entry 187) is registered in `server/routes/bookingRoutes.js` after router-wide `resolveTenant` and `protect`. Any active authenticated user with tenant context can call it; it has no role-specific guard, query, path, or body fields. It performs no database operation and returns HTTP 200 `{success:true,message:"Booking routes are loaded"}`. Its purpose is route wiring/readiness confirmation only; it does not test database readiness or booking dependencies. No first-party caller or dedicated test was found.
