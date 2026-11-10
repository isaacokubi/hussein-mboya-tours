# Source explanation: server/controllers/superAdminTenantController.js

**Source:** [server/controllers/superAdminTenantController.js](../../../server/controllers/superAdminTenantController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `SystemSetting` from `../models/SystemSetting.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SystemSetting.js](../../../server/models/SystemSetting.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `activateTenantSubscription` from `../services/tenantSubscriptionService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/tenantSubscriptionService.js](../../../server/services/tenantSubscriptionService.js)

## Runtime declarations and data flow

### `asObjectId` — lines 16–16

Parameters: `id`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `slugify` — lines 17–17

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `normalizeDomain` — lines 18–25

Parameters: `value`.
Error control: try=true, catch=false, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 19:** `const raw = String(value || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 20:** `if (!raw) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 22:** `const url = new URL(raw.includes("://") ? raw : \`https://${raw}\`);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `return url.hostname.replace(/^www\./, "");` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `uniqueSlug` — lines 26–32

Parameters: `name`, `requestedSlug`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 27:** `const base = slugify(requestedSlug || name) || \`company-${Date.now()}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 28:** `let slug = base;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `let suffix = 2;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `while (await Organization.exists({ slug })) slug = \`${base}-${suffix++}\`;` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 31:** `return slug;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `validateAdminPassword` — lines 33–33

Parameters: `password`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getTenantCounts` — lines 35–43

Parameters: `tenantId`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=false.

Key statements:
- **Line 36:** `const db = mongoose.connection.db;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const collections = ["users", "tours", "tourpackages", "bookings", "payments", "customers", "agents", "staffs", "vehicles", "destinations"];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const counts = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `await Promise.all(collections.map(async (name) => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 40:** `try { counts[name] = await db.collection(name).countDocuments({ tenantId: asObjectId(tenantId) }); } catch { counts[name] = 0; }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 42:** `return counts;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTenantPlans` — lines 45–45

Parameters: `req`, `res`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 45:** `async (req, res) => res.json({ success: true, plans: Object.entries(TENANT_PLANS).map(([value, plan]) => ({ value, ...plan })) })` — Sends a JSON response; inspect its caller for status and error semantics.

### `createTenantWithAdmin` — lines 47–131

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Organization.create, Role.findOne, User.create, SystemSetting.create, User.findById; verify tenant/ownership filters in the exact query. 10 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 20 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 48:** `const session = await mongoose.startSession();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 49:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 50:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `if (!String(companyName || "").trim()) return res.status(400).json({ success: false, message: "Company name is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 52:** `if (!/^\S+@\S+\.\S+$/.test(String(companyEmail || "").trim())) return res.status(400).json({ success: false, message: "A valid company email is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** `if (!/^\d{10}$/.test(String(companyPhone || "").trim())) return res.status(400).json({ success: false, message: "Company phone must contain exactly 10 digits." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `if (!String(adminName || "").trim() || !/^\S+@\S+\.\S+$/.test(String(adminEmail || "").trim())) return res.status(400).json({ success: false, message: "Primary administrator name and valid email are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `if (!/^\d{10}$/.test(String(adminPhone || "").trim())) return res.status(400).json({ success: false, message: "Administrator phone must contain exactly 10 digits." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 56:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 57:** `const selectedPlan = TENANT_PLANS[plan];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 58:** `if (!selectedPlan) return res.status(400).json({ success: false, message: "Invalid subscription plan." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 59:** `const requestedSeats = Number(seats);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `const effectiveSeats = Number.isFinite(requestedSeats) && requestedSeats > 0 ? Math.floor(requestedSeats) : selectedPlan.seats;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `if (effectiveSeats < selectedPlan.seats) return res.status(400).json({ success: false, code: "SEAT_LIMIT_BELOW_PLAN_MINIMUM", message: \`${selectedPlan.label} includes a minimum of ${selectedPlan.seats} user seats. Incre` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 62:** `if (effectiveSeats > 10000) return res.status(400).json({ success: false, message: "User seats cannot exceed 10,000." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 63:** `const normalizedCompanyEmail = String(companyEmail).trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 64:** `const normalizedAdminEmail = String(adminEmail).trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `const normalizedCompanyName = String(companyName).trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `listTenants` — lines 133–146

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Organization.find, Organization.countDocuments, User.findOne; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 134:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 135:** `const page = Math.max(Number(req.query.page) || 1, 1), limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100), search = String(req.query.search || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 136:** `const filter = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 137:** `if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { legalName: { $regex: search, $options: "i" } }, { slug: { $regex: search, $options: "i" } }, { supportEmail: { $regex: search, $options: "i" } }];` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 138:** `const [organizations, total] = await Promise.all([Organization.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Organization.countDocuments(filter)]);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 139:** `const tenants = await Promise.all(organizations.map(async (organization) => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 140:** `const counts = await getTenantCounts(organization._id);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 141:** `const owner = await runWithTenant({ role: "super_admin", bypass: true }, () => User.findOne({ tenantId: organization._id, role: { $in: ["admin", "administrator"] } }).select("name email phone status").sort({ createdAt: 1` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 142:** `return { ...organization, owner: owner || null, counts };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 144:** `return res.json({ success: true, tenants, data: tenants, page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getTenant` — lines 148–156

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Organization.findById, User.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 149:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 150:** `if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tenant ID" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 151:** `const tenant = await Organization.findById(req.params.id).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 152:** `if (!tenant) return res.status(404).json({ success: false, message: "Company not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 153:** `const owner = await runWithTenant({ role: "super_admin", bypass: true }, () => User.findOne({ tenantId: tenant._id, role: { $in: ["admin", "administrator"] } }).select("name email phone status").sort({ createdAt: 1 }).le` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 154:** `return res.json({ success: true, tenant: { ...tenant, owner, counts: await getTenantCounts(tenant._id) } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateTenantStatus` — lines 158–195

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. Persistent operations detected: Organization.findById; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 159:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 160:** `const { status, plan, periodDays, transactionReference } = req.body || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 161:** `if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tenant ID" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 162:** `if (!["active", "suspended", "trial", "cancelled"].includes(status)) return res.status(400).json({ success: false, message: "Invalid company status" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 163:** `const existingTenant = await Organization.findById(req.params.id).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 164:** `if (!existingTenant) return res.status(404).json({ success: false, message: "Company not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 166:** `if (status === "active") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 167:** `const selectedPlan = String(plan || existingTenant.subscription?.plan || "starter").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 168:** `if (!TENANT_PLANS[selectedPlan]) return res.status(400).json({ success: false, message: "Invalid subscription plan." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 169:** `const requestedDays = Number(periodDays);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 170:** `const effectivePeriodDays = Number.isFinite(requestedDays) && requestedDays > 0 ? Math.floor(requestedDays) : 30;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 171:** `const activation = await activateTenantSubscription({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 178:** `const tenant = await Organization.findById(existingTenant._id).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 179:** `return res.json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 192:** `const tenant = await Organization.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true, runValidators: true }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 193:** `return res.json({ success: true, tenant, message: \`Company status changed to ${status}\` });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `deleteTenant` — lines 197–222

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. Persistent operations detected: Organization.findById, Organization.deleteOne; verify tenant/ownership filters in the exact query. 7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=true. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 198:** `const session = await mongoose.startSession();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 199:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 200:** `const { id } = req.params;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 201:** `const confirmation = String(req.body?.confirmation || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 202:** `if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid tenant ID" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 203:** `if (confirmation !== "DELETE") return res.status(400).json({ success: false, message: 'Permanent company deletion requires confirmation="DELETE".' });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 204:** `const requesterRole = String(req.user?.role || req.user?.legacyRole || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 205:** `if (!req.user || !["superadmin", "super_admin"].includes(requesterRole)) return res.status(403).json({ success: false, message: "Only a SuperAdmin can permanently delete a company." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 206:** `const tenant = await Organization.findById(id).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 207:** `if (!tenant) return res.status(404).json({ success: false, message: "Company not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 208:** `const protectedSlugs = new Set(["platform", "system", "superadmin", "super-admin"]);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 209:** `const isPlatformOrganization = protectedSlugs.has(String(tenant.slug || "").trim().toLowerCase()) || (tenant.settings && tenant.settings.isPlatform === true) || (tenant.settings && tenant.settings.platform === true);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 210:** `if (isPlatformOrganization) return res.status(403).json({ success: false, message: "The platform/system organization cannot be deleted." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 211:** `const db = mongoose.connection.db;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 212:** `const collections = await db.listCollections().toArray();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 213:** `await session.withTransaction(async () => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 214:** `for (const { name } of collections) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 215:** `if (name.startsWith("system.") || name === "organizations") continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 9: `export const TENANT_PLANS = Object.freeze({`.
- Line 16: `const asObjectId = (id) => new mongoose.Types.ObjectId(id);`.
- Line 17: `const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);`.
- Line 18: `const normalizeDomain = (value) => {`.
- Line 19: `const raw = String(value || "").trim().toLowerCase();`.
- Line 22: `const url = new URL(raw.includes("://") ? raw : \`https://${raw}\`);`.
- Line 26: `const uniqueSlug = async (name, requestedSlug) => {`.
- Line 27: `const base = slugify(requestedSlug || name) || \`company-${Date.now()}\`;`.
- Line 28: `let slug = base;`.
- Line 29: `let suffix = 2;`.
- Line 33: `<sensitive declaration redacted>`.
- Line 35: `const getTenantCounts = async (tenantId) => {`.
- Line 36: `const db = mongoose.connection.db;`.
- Line 37: `const collections = ["users", "tours", "tourpackages", "bookings", "payments", "customers", "agents", "staffs", "vehicles", "destinations"];`.
- Line 38: `const counts = {};`.
- Line 45: `export const getTenantPlans = async (req, res) => res.json({ success: true, plans: Object.entries(TENANT_PLANS).map(([value, plan]) => ({ value, ...plan })) });`.
- Line 47: `export const createTenantWithAdmin = async (req, res, next) => {`.
- Line 48: `const session = await mongoose.startSession();`.
- Line 50: `<sensitive declaration redacted>`.
- Line 57: `const selectedPlan = TENANT_PLANS[plan];`.
- Line 59: `const requestedSeats = Number(seats);`.
- Line 60: `const effectiveSeats = Number.isFinite(requestedSeats) && requestedSeats > 0 ? Math.floor(requestedSeats) : selectedPlan.seats;`.
- Line 63: `const normalizedCompanyEmail = String(companyEmail).trim().toLowerCase();`.
- Line 64: `const normalizedAdminEmail = String(adminEmail).trim().toLowerCase();`.
- Line 65: `const normalizedCompanyName = String(companyName).trim();`.
- Line 66: `const normalizedCompanyPhone = String(companyPhone).trim();`.
- Line 67: `const normalizedCountry = String(country || "Kenya").trim();`.
- Line 68: `const normalizedTimezone = String(timezone || "Africa/Nairobi").trim();`.
- Line 69: `const normalizedCurrency = String(currency || "KES").trim().toUpperCase();`.
- Line 70: `const normalizedWebsiteUrl = String(websiteUrl || "").trim();`.
- Line 71: `const normalizedLogoUrl = String(logoUrl || "").trim();`.
- Line 72: `const domain = normalizeDomain(requestedDomain);`.
- Line 75: `const slug = await uniqueSlug(normalizedCompanyName, requestedSlug);`.
- Line 76: `const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);`.
- Line 77: `let organization;`.
- Line 78: `let admin;`.
- Line 80: `const organizationData = {`.
- Line 98: `const roleDoc = await runWithTenant({ role: "super_admin", bypass: true }, () => Role.findOne({ name: "admin" }).session(session).lean());`.
- Line 117: `<sensitive declaration redacted>`.
- Line 121: `const keyPattern = error?.keyPattern || {}, keyValue = error?.keyValue || {}, duplicateFields = Object.keys(keyPattern);`.
- Line 123: `let message = "A company or administrator with the supplied unique value already exists.";`.
- Line 133: `export const listTenants = async (req, res, next) => {`.
- Line 135: `const page = Math.max(Number(req.query.page) || 1, 1), limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100), search = String(req.query.search || "").trim();`.
- Line 136: `const filter = {};`.
- Line 138: `const [organizations, total] = await Promise.all([Organization.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Organization.countDocuments(filter`.
- Line 139: `const tenants = await Promise.all(organizations.map(async (organization) => {`.
- Line 140: `const counts = await getTenantCounts(organization._id);`.
- Line 141: `const owner = await runWithTenant({ role: "super_admin", bypass: true }, () => User.findOne({ tenantId: organization._id, role: { $in: ["admin", "administrator"] } }).select("name `.
- Line 148: `export const getTenant = async (req, res, next) => {`.
- Line 151: `const tenant = await Organization.findById(req.params.id).lean();`.
- Line 153: `const owner = await runWithTenant({ role: "super_admin", bypass: true }, () => User.findOne({ tenantId: tenant._id, role: { $in: ["admin", "administrator"] } }).select("name email `.
- Line 158: `export const updateTenantStatus = async (req, res, next) => {`.
- Line 160: `const { status, plan, periodDays, transactionReference } = req.body || {};`.
- Line 163: `const existingTenant = await Organization.findById(req.params.id).lean();`.
- Line 167: `const selectedPlan = String(plan || existingTenant.subscription?.plan || "starter").toLowerCase();`.
- Line 169: `const requestedDays = Number(periodDays);`.
- Line 170: `const effectivePeriodDays = Number.isFinite(requestedDays) && requestedDays > 0 ? Math.floor(requestedDays) : 30;`.
- Line 171: `const activation = await activateTenantSubscription({`.
- Line 178: `const tenant = await Organization.findById(existingTenant._id).lean();`.
- Line 192: `const tenant = await Organization.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true, runValidators: true }).lean();`.
- Line 197: `export const deleteTenant = async (req, res, next) => {`.
- Line 198: `const session = await mongoose.startSession();`.
- Line 200: `const { id } = req.params;`.
- Line 201: `const confirmation = String(req.body?.confirmation || "").trim();`.
- Line 204: `const requesterRole = String(req.user?.role || req.user?.legacyRole || "").toLowerCase();`.
- Line 206: `const tenant = await Organization.findById(id).lean();`.
- Line 208: `const protectedSlugs = new Set(["platform", "system", "superadmin", "super-admin"]);`.
- Line 209: `const isPlatformOrganization = protectedSlugs.has(String(tenant.slug || "").trim().toLowerCase()) || (tenant.settings && tenant.settings.isPlatform === true) || (tenant.settings &&`.
- Line 211: `const db = mongoose.connection.db;`.
- Line 212: `const collections = await db.listCollections().toArray();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
