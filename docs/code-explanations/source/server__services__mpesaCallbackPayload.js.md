# Source explanation: server/services/mpesaCallbackPayload.js

**Source:** [server/services/mpesaCallbackPayload.js](../../../server/services/mpesaCallbackPayload.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `getStkCallback` — lines 1–1

Parameters: `body`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `validateStkCallback` — lines 3–17

Parameters: `callback`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 4:** `if (!callback || typeof callback !== "object" || Array.isArray(callback)) return "Malformed STK callback.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 5:** `if (!getCheckoutRequestId(callback)) return "Missing CheckoutRequestID.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 6:** `if (callback.ResultCode === undefined || callback.ResultCode === null || String(callback.ResultCode).trim() === "" || !Number.isSafeInteger(Number(callback.ResultCode))) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 7:** `return "Invalid ResultCode.";` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 9:** `if (Number(callback.ResultCode) === 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `const items = callback.CallbackMetadata?.Item;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `if (!Array.isArray(items)) return "Missing callback metadata.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `const hasAmount = items.some((item) => item?.Name === "Amount" && Number.isSafeInteger(Number(item.Value)) && Number(item.Value) > 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 13:** `const hasReceipt = items.some((item) => item?.Name === "MpesaReceiptNumber" && String(item.Value || "").trim());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `if (!hasAmount || !hasReceipt) return "Missing required payment metadata.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getCheckoutRequestId` — lines 19–21

Parameters: `callback`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `evaluateStkPaymentCallback` — lines 23–49

Parameters: `callback`, `expectedAmount`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 24:** `const resultCode = Number(callback?.ResultCode);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `const items = Array.isArray(callback?.CallbackMetadata?.Item) ? callback.CallbackMetadata.Item : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `const getValue = (name) => items.find((item) => item?.Name === name)?.Value ?? null;` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 27:** `const paidAmount = Number(getValue("Amount"));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `const expected = Number(expectedAmount);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const receiptNumber = String(getValue("MpesaReceiptNumber") || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const providerDescription = typeof callback?.ResultDesc === "string" ? callback.ResultDesc.trim().slice(0, 250) : "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `if (resultCode !== 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 33:** `return { state: "provider_failed", resultCode, reason: providerDescription || "M-Pesa payment failed.", paidAmount, expectedAmount: expected, receiptNumber };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 35:** `if (!Number.isSafeInteger(paidAmount) || paidAmount <= 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `return { state: "invalid_amount", resultCode, reason: "M-Pesa callback did not contain a valid paid amount.", paidAmount, expectedAmount: expected, receiptNumber };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 38:** `if (!Number.isSafeInteger(expected) || paidAmount !== expected) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `return { state: "amount_mismatch", resultCode, reason: \`M-Pesa amount mismatch. Expected ${expected}, received ${paidAmount}.\`, paidAmount, expectedAmount: expected, receiptNumber };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 41:** `if (!receiptNumber) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `return { state: "missing_receipt", resultCode, reason: "M-Pesa callback did not contain a receipt number.", paidAmount, expectedAmount: expected, receiptNumber };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 44:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getValue` — lines 26–26

Parameters: `name`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 26:** `(name) => items.find((item) => item?.Name === name)?.Value ?? null` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

## Module-level declarations

- Line 1: `export const getStkCallback = (body) => body?.Body?.stkCallback || null;`.
- Line 3: `export const validateStkCallback = (callback) => {`.
- Line 10: `const items = callback.CallbackMetadata?.Item;`.
- Line 12: `const hasAmount = items.some((item) => item?.Name === "Amount" && Number.isSafeInteger(Number(item.Value)) && Number(item.Value) > 0);`.
- Line 13: `const hasReceipt = items.some((item) => item?.Name === "MpesaReceiptNumber" && String(item.Value || "").trim());`.
- Line 19: `export const getCheckoutRequestId = (callback) => String(`.
- Line 23: `export const evaluateStkPaymentCallback = (callback, expectedAmount) => {`.
- Line 24: `const resultCode = Number(callback?.ResultCode);`.
- Line 25: `const items = Array.isArray(callback?.CallbackMetadata?.Item) ? callback.CallbackMetadata.Item : [];`.
- Line 26: `const getValue = (name) => items.find((item) => item?.Name === name)?.Value ?? null;`.
- Line 27: `const paidAmount = Number(getValue("Amount"));`.
- Line 28: `const expected = Number(expectedAmount);`.
- Line 29: `const receiptNumber = String(getValue("MpesaReceiptNumber") || "").trim();`.
- Line 30: `const providerDescription = typeof callback?.ResultDesc === "string" ? callback.ResultDesc.trim().slice(0, 250) : "";`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
