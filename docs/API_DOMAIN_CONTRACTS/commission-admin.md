# Administrative commission APIs (entries 200–203)

Router chain for all routes: `resolveTenant` → `protect` → `adminMiddleware` (canonical admin or SuperAdmin) → `authorize("commission.view")`. Approve/pay repeat `adminMiddleware`, so those mutations still require admin/SuperAdmin. No branch scope. The mutation routes do not require a separate commission.manage permission.

## GET `/api/commissions` (200)

No query/body/path. Reads non-soft-deleted tenant Commission records newest first, populating Agent/User and Booking/Tour/Customer summaries. Serialization adds displayName/displayEmail/displayPhone, booking displayNumber, commissionAmount, bookingValue and nonnegative netAmount. Returns 200 `{success:true,data:[...]}`. Failures return `error.status || 500` with sanitized `publicErrorMessage`, not `next`.

## GET `/api/commissions/agent/:agentId` (201)

Path ObjectId validated or 400. Returns tenant commissions for that Agent, populated similarly and serialized, `{success:true,data}`. Unlike collection route, this query does not filter `isDeleted`, so soft-deleted commission records may appear. Failure returns sanitized error status/message.

## PATCH `/api/commissions/:id/approve` (202)

No body fields. Tenant Commission lookup; missing 404; already paid or any status other than pending returns 400. Sets status approved, approvedBy/At and updatedBy, saves, returns 200 `{success:true,message,data:commission}`. It does not validate ID explicitly, payment/ledger is not created, and there is no transaction.

## POST `/api/commissions/:id/pay` (203)

Body fields: `paymentMethod` defaults MPESA and must be one of BANK_TRANSFER/MPESA/CASH/CHEQUE; `paymentReference` or `transactionId` must provide a nonempty reference (400); optional `notes`. Tenant commission missing 404; already paid or not approved/processing 400. Checks another nondeleted tenant Commission for duplicate paymentReference or transactionId; duplicate returns 409 `COMMISSION_PAYMENT_REFERENCE_EXISTS`. It marks commission paid, sets method/reference/transactionId/paidAt/updatedBy and optionally financeNotes, saves, then updates linked Agent counters: paidCommission += full commission amount; pendingCommission and walletBalance decremented by amount but floored at zero. Returns 200 `{success:true,message,data}`.

This is manual recordkeeping, not a bank/M-Pesa payout or provider transaction. Commission save and Agent save are separate, not transactional. A failure after the Commission becomes paid can leave Agent balances stale; retry is rejected as already paid, so counters need reconciliation. Duplicate reference check can race absent a unique index. Refunded commission amount is not subtracted from the amount credited to agent statistics here. No idempotency key.

Data/service references: `commissionRoutes.js`, `commissionController.js`, `adminMiddleware.js`, permission middleware, Commission/Agent schemas, `commissionApi.js`, admin Finance Commissions page. No focused route-level tests found in the reviewed test suite; source only.
