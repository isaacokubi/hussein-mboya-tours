# Source explanation: server/services/taxEngineService.js

**Source:** [server/services/taxEngineService.js](../../../server/services/taxEngineService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `TaxProfile` from `../models/TaxProfile.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TaxProfile.js](../../../server/models/TaxProfile.js)
- `TaxRule` from `../models/TaxRule.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TaxRule.js](../../../server/models/TaxRule.js)
- `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `ROUND` — lines 5–5

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalizeCategory` — lines 7–7

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `validRate` — lines 8–8

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `resolveRate` — lines 9–16

Parameters: `{category, rate, profile, rule}`.
7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 10:** `const normalized = normalizeCategory(category);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 11:** `if (normalized !== TAX_CATEGORIES.STANDARD) return 0;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `if (rate !== undefined && rate !== null && rate !== "") { if (!validRate(rate)) throw new Error("Invalid VAT rate."); return Number(rate); }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `if (rule?.rate !== undefined && rule?.rate !== null && rule?.rate !== "") { if (!validRate(rule.rate)) throw new Error("Invalid VAT rate."); return Number(rule.rate); }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `if (profile?.defaultVatRate !== undefined && profile?.defaultVatRate !== null && profile?.defaultVatRate !== "") { if (!validRate(profile.defaultVatRate)) throw new Error("Invalid VAT rate."); return Number(profile.defau` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `return 16;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `calculateTax` — lines 18–29

Parameters: `arg1 (defaulted)`, `profile (defaulted)`, `rule (defaulted)`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** `const gross = Number(amount || 0); const discountAmount = Number(discount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `if (!Number.isFinite(gross) || gross < 0) throw new Error("Invalid taxable amount.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `if (!Number.isFinite(discountAmount) || discountAmount < 0 || discountAmount > gross) throw new Error("Invalid discount amount.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `const taxableAmount = ROUND(gross - discountAmount); const normalizedMode = String(mode || "exclusive").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `if (!["exclusive", "inclusive"].includes(normalizedMode)) throw new Error("Invalid tax pricing mode.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `const normalizedCategory = normalizeCategory(category); const taxRate = resolveRate({ category: normalizedCategory, rate, profile, rule });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 25:** `let taxAmount = 0; let netAmount = taxableAmount; let totalAmount = taxableAmount;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 26:** `if (taxRate > 0 && normalizedMode === "inclusive") { netAmount = ROUND(taxableAmount / (1 + taxRate / 100)); taxAmount = ROUND(taxableAmount - netAmount); }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `else if (taxRate > 0) { taxAmount = ROUND(taxableAmount * (taxRate / 100)); totalAmount = ROUND(netAmount + taxAmount); }` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `return { category: normalizedCategory, mode: normalizedMode, rate: taxRate, taxableAmount, netAmount, taxAmount, totalAmount, taxCode: rule?.code || null, currency: "KES" };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `ensureDefaultTaxRules` — lines 31–36

Parameters: none.
Persistent operations detected: TaxProfile.findOne, TaxRule.findOne, TaxRule.create, TaxRule.updateOne, TaxRule.find; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 32:** `const tenantId = requireTenantId(); const profile = await TaxProfile.findOne({ tenantId }).lean(); const configuredVatRate = Number(profile?.defaultVatRate); const vatRate = Number.isFinite(configuredVatRate) && configur` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 33:** `const defaults = [{ code: "VAT_STANDARD", name: "VAT standard rate", taxType: "VAT", rate: vatRate, appliesTo: ["tour", "accommodation", "transport", "activity", "restaurant", "service"] }, { code: "VAT_ZERO", name: "VAT` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `for (const rule of defaults) { const existing = await TaxRule.findOne({ tenantId, code: rule.code }).lean(); const missingRate = existing && (existing.rate === null || existing.rate === undefined || existing.rate === "" ` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 35:** `return TaxRule.find({ tenantId }).sort({ code: 1 }).lean();` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `listTaxRules` — lines 37–37

Parameters: none.
Persistent operations detected: TaxRule.find; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 37:** `async () => TaxRule.find({ tenantId: requireTenantId() }).sort({ code: 1 }).lean()` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `calculateTenantTax` — lines 38–38

Parameters: `input (defaulted)`.
Persistent operations detected: TaxProfile.findOne, TaxRule.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 38:** `async (input = {}) => { const tenantId = requireTenantId(); const profile = await TaxProfile.findOne({ tenantId }).lean(); const category = normalizeCategory(input.category || (profile?.taxRegime === "ZERO_RATED" ? "ZERO` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 5: `const ROUND = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;`.
- Line 6: `export const TAX_CATEGORIES = Object.freeze({ STANDARD: "STANDARD", ZERO_RATED: "ZERO_RATED", EXEMPT: "EXEMPT", NON_VAT: "NON_VAT" });`.
- Line 7: `const normalizeCategory = (value) => { const category = String(value || "STANDARD").trim().toUpperCase(); return Object.prototype.hasOwnProperty.call(TAX_CATEGORIES, category) ? ca`.
- Line 8: `const validRate = (value) => { const n = Number(value); return Number.isFinite(n) && n >= 0 && n <= 100; };`.
- Line 9: `const resolveRate = ({ category, rate, profile, rule }) => {`.
- Line 10: `const normalized = normalizeCategory(category);`.
- Line 18: `export const calculateTax = ({ amount, category = TAX_CATEGORIES.STANDARD, rate, mode = "exclusive", discount = 0 } = {}, profile = null, rule = null) => {`.
- Line 19: `const gross = Number(amount || 0); const discountAmount = Number(discount || 0);`.
- Line 22: `const taxableAmount = ROUND(gross - discountAmount); const normalizedMode = String(mode || "exclusive").toLowerCase();`.
- Line 24: `const normalizedCategory = normalizeCategory(category); const taxRate = resolveRate({ category: normalizedCategory, rate, profile, rule });`.
- Line 25: `let taxAmount = 0; let netAmount = taxableAmount; let totalAmount = taxableAmount;`.
- Line 31: `export const ensureDefaultTaxRules = async () => {`.
- Line 32: `const tenantId = requireTenantId(); const profile = await TaxProfile.findOne({ tenantId }).lean(); const configuredVatRate = Number(profile?.defaultVatRate); const vatRate = Number`.
- Line 33: `const defaults = [{ code: "VAT_STANDARD", name: "VAT standard rate", taxType: "VAT", rate: vatRate, appliesTo: ["tour", "accommodation", "transport", "activity", "restaurant", "ser`.
- Line 37: `export const listTaxRules = async () => TaxRule.find({ tenantId: requireTenantId() }).sort({ code: 1 }).lean();`.
- Line 38: `export const calculateTenantTax = async (input = {}) => { const tenantId = requireTenantId(); const profile = await TaxProfile.findOne({ tenantId }).lean(); const category = normal`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
