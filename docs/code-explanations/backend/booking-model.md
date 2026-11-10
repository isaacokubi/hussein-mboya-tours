# Booking transaction and `Booking` model

## Atomic creation helper

`services/bookingCreationService.js` imports Mongoose, Booking, inventory reservation and `requireTenantId`. `createBookingAtomically` first requires tenant context, opens a Mongo session, then uses `session.withTransaction` to reserve tour slots (when a tour ID exists) and insert the booking using the same session. If either operation fails, MongoDB aborts the transaction. `finally` ends the session whether success or error. This protects against a booking being created without its corresponding reserved capacity, when deployed MongoDB supports transactions and callers use this helper.

## Schema composition

`models/Booking.js` defines nested traveler/contact snapshot schemas and a large booking document schema. It stores tenant and customer/user references, tour or custom request, travel dates, travelers/guest count, assignment references, pricing/balance, payment method/status/refs, lifecycle status, refund metadata, source/external integration metadata, and audit fields. Enums/defaults/min/max/required flags provide persistence-level constraints. Schema-level indexes support lookups and unique external booking identity (partial when an external ID is present).

The `pre('validate')` hook requires either a tour or custom tour request. `pre('save')` clamps invalid/negative paid amount to zero, recalculates balance, creates booking number when absent, stamps lifecycle dates on status transitions, and requires company name for corporate booking. These are data invariants, not replacements for authorization/business validation in controllers.

## Save hooks and virtuals

The post-save hook suppresses event side effects while a session is attached, so transaction-bound operations do not emit an external webhook before commit. Outside a transaction, it queues tenant booking created/updated webhook events and catches/logs failure so persistence is not rolled back by a webhook queue failure. A separate reconciliation block may synchronize a paid booking into Payment ledger records, and corporate-account exposure is recalculated. Each side effect is best-effort and separately caught; monitor/reconcile it because the booking can persist while a side effect fails.

Virtuals expose remaining balance and state-derived booleans. Instance helpers calculate commission/balance and save paid/completed/cancelled transitions. Static queries find upcoming, completed and pending-payment bookings. The tenant plugin is attached before registering/reusing the Mongoose model.

## Security and performance notes

The schema includes travel personal data such as passport, medical and emergency-contact details; restrict access and retention. Indexes improve query patterns but add write/storage cost. Tenant plugins and explicit controller filters are both relevant; inspect aggregate and static query paths for tenant isolation. Booking hooks are substantial, so understand side effects when using bulk updates that bypass document middleware.
