# Phase 20 — M-Pesa Callback Contract

Phase 20 centralizes M-Pesa STK callback parsing and success validation into a deterministic service.

## Changes

- Canonical parsing of CheckoutRequestID, provider result code, amount, receipt, phone and transaction date.
- Explicit rejection reasons for failed provider results, invalid amounts, amount mismatches and missing receipts.
- Deterministic SHA-256 callback event identity for audit/idempotency correlation.
- Offline tests for success, failure, malformed amount, amount mismatch, missing receipt and event identity.

## Evidence boundary

These are offline application-contract tests. They do not prove a live Safaricom/M-Pesa sandbox callback, provider query, public callback URL, real credentials, deployed payment completion or financial reconciliation. Those remain external acceptance gates.
