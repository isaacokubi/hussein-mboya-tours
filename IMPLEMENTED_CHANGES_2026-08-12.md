# Coherent Tours – Enhancement Patch – 12 Aug 2026

Implemented in this package:

1. Fixed RBAC roles/permissions bootstrap so legacy malformed Role documents do not cause HTTP 400 during `/api/admin/roles` and `/api/admin/roles/permissions/all`.
2. Agent dashboard self-heals legacy Agent accounts by creating a pending Agent profile when the User has an agent role but no linked profile.
3. Dashboard guide/agent/vehicle counts now use broader legacy-compatible data matching.
4. Dashboard notification widgets use 5 notifications per page with Previous/Next controls.
5. Admin Notifications and Tour Manager notification widgets also paginate at 5 per page.
6. Manager Create Tour resource dropdowns only show currently available/unassigned guides, drivers and vehicles.
7. Added future booking rescheduling/postponement with history and admin/customer notifications.
8. Added customer completed-booking review form; reviews remain pending until admin approval/rejection.
9. Added custom-tour request workflow: customer submits destination, duration, people, date, budget and requirements; admins quote/decline; customer receives in-app notification and quoted amount.
10. Added admin resource assignment fields for custom-tour requests (guide, driver, agent).
11. Added Stripe Checkout integration using Stripe REST API and a payment verification endpoint.
12. Added bank-transfer payment recording and configurable bank details in System Settings.
13. Added Admin Settings fields for bank transfer enablement and bank details.
14. Kept M-Pesa checkout flow and its redirect to My Bookings.
15. Preserved direct WhatsApp booking/contact flow using the configured support phone.
16. Analytics wording/data presentation is payment-led: confirmed/recognized revenue is derived from completed payment records, not booking status.
17. Added customer Custom Tour page and Admin Custom Tour Requests page.
18. Added implementation/setup notes for Stripe and bank transfer.

## Required production environment

For Stripe, set:
- `STRIPE_SECRET_KEY`
- `CLIENT_URL` (deployed frontend URL)

Bank transfer details are configured from Admin > Settings. Bank transfers remain pending until an administrator verifies the payment and marks it completed.

## Verification

All backend JavaScript files pass `node --check` in this package.
