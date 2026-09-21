# Tour Domain Rules

This is the canonical implementation rule set for the tour domain.

## Pricing
- `price` is the base unit price.
- `discountPrice`, when explicitly set, is the unit-price override.
- A matching `pricingRules` traveler band overrides the global `discount`.
- Otherwise `discount` is the percentage applied to the subtotal.
- Currency rounding is two decimal places.
- `depositRequired` is the configured deposit due; it is never cumulative paid money.
- `depositType` is `fixed` or `percentage`.

## Payment
- `amountPaid` is the cumulative net confirmed payment ledger.
- `balanceAmount = totalAmount - amountPaid`.
- Only confirmed payments increase `amountPaid`.
- Refunds reduce `amountPaid` and restore outstanding balance unless fully refunded.
- `depositAmount` remains the configured deposit requirement.

## Dates and inventory
- `travelDate` must match `Tour.availability[].date` when dated availability exists.
- Dated capacity is keyed by selected travel date.
- Without dated availability, `availabilitySettings` is the fallback capacity ledger.
- Inventory reservation and booking creation use a MongoDB transaction.
- `Tour.availability` is authoritative for date-specific availability reporting.

## Duration
- `durationDays` is the canonical numeric duration.
- `durationDetails.days` and display `duration` are normalized from it.
- End dates are derived from start date and duration.

## Publication
- `published` is an explicit authorized state.
- Sensitive update fields are allow-listed.

## Cancellation
- Tour cancellation/deletion first reconciles active bookings.
- Capacity is released once per active booking.
- Paid bookings enter refund processing instead of losing payment records.
- Guides, drivers and vehicles are released in the same transaction.
- Customer notification work is queued/recorded as part of cancellation.

## Resources
- Guide, driver and vehicle assignment mutations use the safe overlap-checked service.
- Assignments are tenant-scoped and transaction-aware.

## Tax
- Tax is opt-in per tour through `taxEnabled`.
- `taxCategory`, `taxMode` and optional `taxRate` are server-authoritative.
- Booking tax/fee values are persisted as the checkout finance snapshot.

## Legacy data migration
Run `npm run migrate:booking-ledger` against a backup/test database first, then production after validation. The migration reconstructs `amountPaid` from the Payment ledger and recalculates the configured deposit from the linked Tour.