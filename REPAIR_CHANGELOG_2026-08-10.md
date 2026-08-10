# Coherent Tours Functional Repair — 2026-08-10

## Repaired

- Customer Dashboard Total Spent now counts only paid confirmed/assigned/ongoing/completed bookings and subtracts refunds.
- New User accounts default to Active; admin user status handling now uses the User `status` field consistently.
- Admin user Enable/Disable action now supports both PUT and PATCH and returns a normalized `isActive` value.
- Admin staff Disable now uses the valid Staff availability value `offline` instead of the invalid `unavailable`.
- Admin Bookings white-screen issue fixed by defining the missing `paid` and `upcoming` summary values.
- Admin booking search/payload handling improved and User booking ownership is populated.
- Admin Customers CRM now reads User customer accounts and computes booking/spending statistics from actual bookings.
- Admin Analytics now handles the backend response shape safely.
- Admin Finance now reads the nested finance API response and displays actual values.
- M-Pesa Transactions now reads the actual finance transaction response and supports receipt/transaction/customer/booking searching.
- Payment status changes now synchronize the related Booking payment/status fields.
- Reconciliation now reports pending/failed/refunded/missing-receipt and booking/amount mismatches more accurately.
- Roles & Permissions white-screen issue fixed by reading the API `roles` array correctly.
- System Settings completed with a persistent MongoDB-backed settings API and admin UI.
- Tour Manager can mark a paid booking as Completed; status is persisted and returned with the booking.
- `/api/health` endpoint added.
- Tour-manager booking listing now supports User-linked customer accounts.

## Validation

- All server JavaScript files pass `node --check`.
- Frontend build was already confirmed on the source project before this repair; this environment could not reproduce `npm install` because the package registry returned a 404 for `zod-validation-error@4.0.2`.

## Important

Do not commit backup/repair folders or temporary repair scripts from the original working directory. Commit only the actual application changes.
