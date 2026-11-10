# Source explanation: server/services/tenantPaymentMethods.js

**Source:** [server/services/tenantPaymentMethods.js](../../../server/services/tenantPaymentMethods.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `normalizeTenantPaymentMethod` — lines 1–9

Parameters: `method`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 2:** `const value = String(method || "").trim().toUpperCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 3:** `if (["MPESA", "M-PESA"].includes(value)) return "MPESA";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 4:** `if (["CARD", "STRIPE"].includes(value)) return "CARD";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 5:** `if (["BANK", "BANK_TRANSFER", "BANK TRANSFER"].includes(value)) return "BANK_TRANSFER";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 6:** `if (value === "CASH") return "CASH";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 7:** `if (value === "PAYPAL") return "PAYPAL";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 8:** `return "";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isPaypalCurrencySupported` — lines 12–12

Parameters: `currency`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isStripeRuntimeEnvironmentValid` — lines 13–19

Parameters: `environment (defaulted)`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const staging = String(environment.DEPLOYMENT_ENV || "").toLowerCase() === "staging";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (key.startsWith("sk_test_")) return environment.NODE_ENV !== "production" || staging;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if (key.startsWith("sk_live_")) return environment.NODE_ENV === "production" && !staging;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `return false;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isTenantPaymentMethodAvailable` — lines 21–35

Parameters: `settings (defaulted)`, `method`, `environment (defaulted)`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 22:** `switch (normalizeTenantPaymentMethod(method)) {` — This branch selects behavior by the current value; verify every case and the default path.
- **Line 23:** `case "MPESA": return settings.enableMpesa === true;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `case "BANK_TRANSFER": return settings.enableBankTransfer === true && Boolean(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `case "CASH": return settings.enableCash === true && Boolean(String(settings.cashCollectionLocation || "").trim() && String(settings.cashInstructions || "").trim());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `case "PAYPAL": return settings.paypalAvailable === true && isPaypalCurrencySupported(settings.currency);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

## Module-level declarations

- Line 1: `export const normalizeTenantPaymentMethod = (method) => {`.
- Line 2: `const value = String(method || "").trim().toUpperCase();`.
- Line 11: `const PAYPAL_PAYMENT_CURRENCIES = new Set(["AUD", "BRL", "CAD", "CNY", "CZK", "DKK", "EUR", "HKD", "HUF", "ILS", "JPY", "MYR", "MXN", "TWD", "NZD", "NOK", "PHP", "PLN", "GBP", "SGD`.
- Line 12: `export const isPaypalCurrencySupported = (currency) => PAYPAL_PAYMENT_CURRENCIES.has(String(currency || "").trim().toUpperCase());`.
- Line 13: `export const isStripeRuntimeEnvironmentValid = (environment = process.env) => {`.
- Line 14: `<sensitive declaration redacted>`.
- Line 15: `const staging = String(environment.DEPLOYMENT_ENV || "").toLowerCase() === "staging";`.
- Line 21: `export const isTenantPaymentMethodAvailable = (settings = {}, method, environment = process.env) => {`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
