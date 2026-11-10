# Source explanation: server/controllers/settingsController.js

**Source:** [server/controllers/settingsController.js](../../../server/controllers/settingsController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `publicErrorMessage` from `../utils/publicError.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/publicError.js](../../../server/utils/publicError.js)
- `SystemSetting` from `../models/SystemSetting.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SystemSetting.js](../../../server/models/SystemSetting.js)
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `getTenantContext`, `requireTenantId`, `isTenantBypassed` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `COMPANY_DEFAULTS` from `../config/companyDefaults.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/config/companyDefaults.js](../../../server/config/companyDefaults.js)
- `PaymentGatewayConfig` from `../models/PaymentGatewayConfig.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PaymentGatewayConfig.js](../../../server/models/PaymentGatewayConfig.js)
- `getEnvironmentMpesaSettings` from `../services/mpesaGatewaySettings.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/mpesaGatewaySettings.js](../../../server/services/mpesaGatewaySettings.js)
- `getPaypalEnvironmentSettings` from `../services/paypalService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/paypalService.js](../../../server/services/paypalService.js)
- `isPaypalCurrencySupported`, `isStripeRuntimeEnvironmentValid` from `../services/tenantPaymentMethods.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tenantPaymentMethods.js](../../../server/services/tenantPaymentMethods.js)

## Runtime declarations and data flow

### `isColor` — lines 17–17

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalizeUpdates` — lines 19–32

Parameters: `body (defaulted)`.
Error control: try=true, catch=false, finally=false. 13 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 20:** `const updates = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 21:** `for (const key of ALLOWED) if (body[key] !== undefined) updates[key] = body[key];` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 22:** `if (updates.companyName !== undefined) updates.companyName = String(updates.companyName).trim();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `if (updates.supportEmail !== undefined) updates.supportEmail = String(updates.supportEmail).trim().toLowerCase();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `if (updates.supportPhone !== undefined) updates.supportPhone = String(updates.supportPhone).trim();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `if (updates.currency !== undefined) updates.currency = String(updates.currency).trim().toUpperCase();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `if (updates.timezone !== undefined) updates.timezone = String(updates.timezone).trim();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 27:** `for (const key of NUMERIC_FIELDS) if (updates[key] !== undefined) { const value = Number(updates[key]); updates[key] = Number.isFinite(value) ? value : updates[key]; }` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 28:** `for (const key of BOOLEAN_FIELDS) if (typeof updates[key] === "string") updates[key] = updates[key] === "true";` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 29:** `if (typeof updates.seoKeywords === "string") { try { updates.seoKeywords = JSON.parse(updates.seoKeywords); } catch { updates.seoKeywords = updates.seoKeywords.split(",").map((v) => v.trim()).filter(Boolean); } }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 30:** `if (typeof updates.homepageSections === "string") { try { updates.homepageSections = JSON.parse(updates.homepageSections); } catch { updates.homepageSections = undefined; } }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 31:** `return updates;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `validateUpdates` — lines 34–52

Parameters: `updates`, `existing (defaulted)`.
12 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 35:** `for (const key of COLOR_FIELDS) if (updates[key] !== undefined && !isColor(updates[key])) return \`${key} must be a valid 6-digit hex color.\`;` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 36:** `if (updates.heroOverlayOpacity !== undefined && (!Number.isFinite(updates.heroOverlayOpacity) || updates.heroOverlayOpacity < 0 || updates.heroOverlayOpacity > 100)) return "Hero overlay opacity must be between 0 and 100` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `for (const key of ["taxRate", "bookingDepositPercentage", "defaultCommissionRate"]) if (updates[key] !== undefined && (!Number.isFinite(updates[key]) || updates[key] < 0 || updates[key] > 100)) return "Tax, deposit and c` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 38:** `const companyName = String(updates.companyName ?? existing.companyName ?? DEFAULTS.companyName).trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `if (!companyName) return "Company name cannot be empty.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `if (updates.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.supportEmail)) return "Enter a valid support email.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `const bankEnabled = updates.enableBankTransfer ?? existing.enableBankTransfer;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `if (bankEnabled === true && ["enableBankTransfer", "bankName", "bankAccountName", "bankAccountNumber", "bankBranch", "bankSwiftCode"].some((key) => updates[key] !== undefined)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 43:** `const values = { ...existing, ...updates };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `if (!String(values.bankName || "").trim() || !String(values.bankAccountName || "").trim() || !/^[A-Za-z0-9][A-Za-z0-9 -]{4,33}$/.test(String(values.bankAccountNumber || "").trim()) || !String(values.bankInstructions || "` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `if (values.bankSwiftCode && !/^[A-Za-z0-9]{8}(?:[A-Za-z0-9]{3})?$/.test(String(values.bankSwiftCode).trim())) return "Enter a valid 8- or 11-character SWIFT/BIC code.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `if ((updates.enableCash ?? existing.enableCash) === true && ["enableCash", "cashInstructions", "cashCollectionLocation"].some((key) => updates[key] !== undefined)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 48:** `const values = { ...existing, ...updates };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `if (!String(values.cashCollectionLocation || "").trim() || !String(values.cashInstructions || "").trim()) return "Cash payments require a collection location and customer instructions.";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 51:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getOrCreateSettings` — lines 54–64

Parameters: `filter`.
Persistent operations detected: SystemSetting.findOne, Organization.findById, SystemSetting.create; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 55:** `let settings = await SystemSetting.findOne(filter).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `if (settings) return settings;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `const seed = { ...filter, ...DEFAULTS };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `if (filter.tenantId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 59:** `const tenant = await Organization.findById(filter.tenantId).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 60:** `if (tenant) Object.assign(seed, { companyName: tenant.name || DEFAULTS.companyName, companyLogo: tenant.logoUrl || "", websiteUrl: tenant.websiteUrl || "", supportEmail: tenant.supportEmail || "", supportPhone: tenant.su` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 62:** `try { settings = await SystemSetting.create(seed); return settings.toObject(); }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 63:** `catch (error) { if (error?.code === 11000) { const existing = await SystemSetting.findOne(filter).lean(); if (existing) return existing; } throw error; }` — Handles an exception from the preceding try block; check whether it returns, rethrows, logs safely, or continues.

### `getTenantProfile` — lines 66–66

Parameters: `tenantId`.
Persistent operations detected: Organization.findById, User.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 66:** `async (tenantId) => { const tenant = await Organization.findById(tenantId).lean(); if (!tenant) return null; const primaryAdministrator = await User.findOne({ tenantId: tenant._id, role: { $in: ["admin", "administrator"]` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `getSettings` — lines 68–68

Parameters: `req`, `res`, `next`.
3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 68:** `async (req, res, next) => { try { if (isTenantBypassed()) { const settings = await getOrCreateSettings({ tenantId: null, key: "platform" }); return res.status(200).json({ success: true, data: settings, settings, scope: "` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `updateSettings` — lines 70–79

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. Persistent operations detected: SystemSetting.findOne, Organization.findById; verify tenant/ownership filters in the exact query. 9 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 13 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 71:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 72:** `const filter = isTenantBypassed() ? { tenantId: null, key: "platform" } : { tenantId: requireTenantId(), key: "default" };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 73:** `let settings = await SystemSetting.findOne(filter);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 74:** `if (!settings) { const seed = { ...filter, ...DEFAULTS }; if (filter.tenantId) { const tenant = await Organization.findById(filter.tenantId).lean(); if (tenant) Object.assign(seed, { companyName: tenant.name || DEFAULTS.` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 75:** `const updates = normalizeUpdates(req.body); if (req.file?.path) updates.companyLogo = req.file.path; const validationError = validateUpdates(updates, settings); if (validationError) return res.status(400).json({ success:` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 76:** `if (!isTenantBypassed()) { const tenantId = requireTenantId(); const organizationUpdates = {}; const map = { companyName: "name", companyLogo: "logoUrl", websiteUrl: "websiteUrl", supportEmail: "supportEmail", supportPho` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 77:** `const saved = settings.toObject(); const scope = filter.key === "platform" ? "platform" : "tenant"; const tenantProfile = scope === "tenant" ? await getTenantProfile(filter.tenantId) : null; const resolved = scope === "t` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 78:** `} catch (error) { console.error("UPDATE SETTINGS ERROR:", error); return res.status(error?.status || 500).json({ success: false, message: publicErrorMessage(error, "Failed to save tenant settings.") }); }` — Builds an HTTP response with an explicit status and JSON payload.

### `getPublicSettings` — lines 81–112

Parameters: `req`, `res`, `next`.
Persistent operations detected: Organization.findById, SystemSetting.findOne, PaymentGatewayConfig.findOne; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 82:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 83:** `requireTenantId(); const { tenantId } = getTenantContext(); const tenant = await Organization.findById(tenantId).lean(); if (!tenant) return res.status(404).json({ success: false, message: "Tenant not resolved" }); let t` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 84:** `const mpesaGateway = await PaymentGatewayConfig.findOne({ tenantId, provider: "MPESA" }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 85:** `const mpesaEnvironment = mpesaGateway?.environment || "sandbox";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 87:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 88:** `const paypalGateway = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 89:** `const paypalEnvironment = getPaypalEnvironmentSettings(paypalGateway || {}, paypalGateway?.environment);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 90:** `const paypalAvailable = Boolean(paypalGateway?.enabled && paypalEnvironment.configured && paypalEnvironment.validatedAt && isPaypalCurrencySupported(tenant.currency || tenantSettings?.currency) && (paypalGateway.environm` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 91:** `const bankName = tenantSettings?.bankName || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 92:** `const bankAccountName = tenantSettings?.bankAccountName || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 93:** `const bankAccountNumber = tenantSettings?.bankAccountNumber || "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 94:** `const bankReady = Boolean(bankName.trim() && bankAccountName.trim() && /^[A-Za-z0-9][A-Za-z0-9 -]{4,33}$/.test(bankAccountNumber.trim()) && String(tenantSettings?.bankInstructions || "").trim());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 95:** `const cashReady = Boolean(String(tenantSettings?.cashCollectionLocation || "").trim() && String(tenantSettings?.cashInstructions || "").trim());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 96:** `const settings = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 110:** `return res.json({ success: true, settings });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 12: `const DEFAULTS = { ...COMPANY_DEFAULTS, primaryColor: "#047857", secondaryColor: "#064e3b", accentColor: "#10b981", backgroundColor: "#f8fafc", surfaceColor: "#ffffff", textColor: `.
- Line 13: `const COLOR_FIELDS = ["primaryColor", "secondaryColor", "accentColor", "backgroundColor", "surfaceColor", "textColor"];`.
- Line 14: `const NUMERIC_FIELDS = ["taxRate", "bookingDepositPercentage", "defaultCommissionRate", "heroOverlayOpacity"];`.
- Line 15: `const BOOLEAN_FIELDS = ["bookingNotifications", "paymentNotifications", "maintenanceMode", "allowRegistrations", "allowAgentRegistrations", "requireEmailVerification", "requirePhon`.
- Line 16: `const ALLOWED = ["companyName", "companyLogo", "websiteUrl", "supportEmail", "supportPhone", "address", "city", "country", "currency", "currencySymbol", "timezone", "language", "ta`.
- Line 17: `const isColor = (value) => /^#[0-9a-fA-F]{6}$/.test(String(value || ""));`.
- Line 19: `const normalizeUpdates = (body = {}) => {`.
- Line 20: `const updates = {};`.
- Line 34: `const validateUpdates = (updates, existing = {}) => {`.
- Line 38: `const companyName = String(updates.companyName ?? existing.companyName ?? DEFAULTS.companyName).trim();`.
- Line 41: `const bankEnabled = updates.enableBankTransfer ?? existing.enableBankTransfer;`.
- Line 43: `const values = { ...existing, ...updates };`.
- Line 48: `const values = { ...existing, ...updates };`.
- Line 54: `const getOrCreateSettings = async (filter) => {`.
- Line 55: `let settings = await SystemSetting.findOne(filter).lean();`.
- Line 57: `const seed = { ...filter, ...DEFAULTS };`.
- Line 59: `const tenant = await Organization.findById(filter.tenantId).lean();`.
- Line 66: `const getTenantProfile = async (tenantId) => { const tenant = await Organization.findById(tenantId).lean(); if (!tenant) return null; const primaryAdministrator = await User.findOn`.
- Line 68: `export const getSettings = async (req, res, next) => { try { if (isTenantBypassed()) { const settings = await getOrCreateSettings({ tenantId: null, key: "platform" }); return res.s`.
- Line 70: `export const updateSettings = async (req, res, next) => {`.
- Line 72: `const filter = isTenantBypassed() ? { tenantId: null, key: "platform" } : { tenantId: requireTenantId(), key: "default" };`.
- Line 73: `let settings = await SystemSetting.findOne(filter);`.
- Line 75: `const updates = normalizeUpdates(req.body); if (req.file?.path) updates.companyLogo = req.file.path; const validationError = validateUpdates(updates, settings); if (validationError`.
- Line 77: `const saved = settings.toObject(); const scope = filter.key === "platform" ? "platform" : "tenant"; const tenantProfile = scope === "tenant" ? await getTenantProfile(filter.tenantI`.
- Line 81: `export const getPublicSettings = async (req, res, next) => {`.
- Line 84: `const mpesaGateway = await PaymentGatewayConfig.findOne({ tenantId, provider: "MPESA" }).lean();`.
- Line 85: `const mpesaEnvironment = mpesaGateway?.environment || "sandbox";`.
- Line 86: `<sensitive declaration redacted>`.
- Line 87: `<sensitive declaration redacted>`.
- Line 88: `const paypalGateway = await PaymentGatewayConfig.findOne({ tenantId, provider: "PAYPAL" }).lean();`.
- Line 89: `const paypalEnvironment = getPaypalEnvironmentSettings(paypalGateway || {}, paypalGateway?.environment);`.
- Line 90: `const paypalAvailable = Boolean(paypalGateway?.enabled && paypalEnvironment.configured && paypalEnvironment.validatedAt && isPaypalCurrencySupported(tenant.currency || tenantSettin`.
- Line 91: `const bankName = tenantSettings?.bankName || "";`.
- Line 92: `const bankAccountName = tenantSettings?.bankAccountName || "";`.
- Line 93: `const bankAccountNumber = tenantSettings?.bankAccountNumber || "";`.
- Line 94: `const bankReady = Boolean(bankName.trim() && bankAccountName.trim() && /^[A-Za-z0-9][A-Za-z0-9 -]{4,33}$/.test(bankAccountNumber.trim()) && String(tenantSettings?.bankInstructions `.
- Line 95: `const cashReady = Boolean(String(tenantSettings?.cashCollectionLocation || "").trim() && String(tenantSettings?.cashInstructions || "").trim());`.
- Line 96: `const settings = {`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
