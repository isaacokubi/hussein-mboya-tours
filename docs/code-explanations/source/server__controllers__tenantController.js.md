# Source explanation: server/controllers/tenantController.js

**Source:** [server/controllers/tenantController.js](../../../server/controllers/tenantController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `tenantFilter` from `../tenancy/tenantQuery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/tenantQuery.js](../../../server/tenancy/tenantQuery.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `ensureSystemRoles` from `../services/onboardingService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/onboardingService.js](../../../server/services/onboardingService.js)

## Runtime declarations and data flow

### `slugify` — lines 9–9

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `validateAdmin` — lines 11–20

Parameters: `admin`.
7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 12:** `if (!admin) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `const values = Object.values(admin).filter(Boolean);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 14:** `if (!values.length) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if (!/^\S+@\S+\.\S+$/.test(String(admin.email).trim())) throw new Error("Administrator email is invalid.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if (!/^\d{10}$/.test(String(admin.phone).trim())) throw new Error("Administrator phone must contain exactly 10 digits.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `return { ...admin, email: String(admin.email).trim().toLowerCase(), phone: String(admin.phone).trim() };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `listTenants` — lines 22–27

Parameters: `req`, `res`, `next`.
Persistent operations detected: Organization.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 23:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 24:** `const tenants = await runWithTenant({ bypass: true }, () => Organization.find(tenantFilter(req)).sort({ createdAt: -1 }).lean());` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 25:** `res.json({ success: true, data: tenants, tenants });` — Sends a JSON response; inspect its caller for status and error semantics.

### `createTenant` — lines 29–66

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Organization.findOne, Organization.create, User.create, User.deleteOne, Organization.deleteOne; verify tenant/ownership filters in the exact query. 7 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 30:** `let organization = null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `let adminUser = null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 33:** `const { name, slug, country = "Kenya", timezone = "Africa/Nairobi", currency = "KES" } = req.body || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 34:** `if (!name?.trim()) return res.status(400).json({ success: false, message: "Company name is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `const admin = validateAdmin(req.body?.admin);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const tenantSlug = slugify(slug || name);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `if (!tenantSlug) return res.status(400).json({ success: false, message: "A valid company slug is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `const duplicateSlug = await runWithTenant({ bypass: true }, () => Organization.findOne({ slug: tenantSlug }).lean());` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 40:** `if (duplicateSlug) return res.status(409).json({ success: false, message: "That company slug is already in use." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `if (admin && await runWithTenant({ bypass: true }, () => User.exists({ email: admin.email }))) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `return res.status(409).json({ success: false, message: "A user with the administrator email already exists." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 45:** `const roles = await ensureSystemRoles();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 46:** `organization = await runWithTenant({ bypass: true }, () => Organization.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 52:** `if (admin) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 53:** `adminUser = await runWithTenant({ tenantId: organization._id, tenant: organization, bypass: false }, () => User.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 59:** `const safeAdmin = adminUser ? { _id: adminUser._id, name: adminUser.name, email: adminUser.email, phone: adminUser.phone, role: "admin", tenantId: adminUser.tenantId } : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `return res.status(201).json({ success: true, tenant: organization, admin: safeAdmin });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getTenant` — lines 68–79

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Organization.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 69:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 70:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tenant ID." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 71:** `const tenant = await runWithTenant({ bypass: true }, () => Organization.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 76:** `if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 77:** `res.json({ success: true, tenant });` — Sends a JSON response; inspect its caller for status and error semantics.

### `updateTenant` — lines 81–92

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 82:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 83:** `const allowed = ["name", "legalName", "logoUrl", "websiteUrl", "domain", "supportEmail", "supportPhone", "country", "timezone", "currency", "status", "subscription", "features", "settings"];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `const tenant = await runWithTenant({ bypass: true }, () => Organization.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 89:** `if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 90:** `res.json({ success: true, tenant });` — Sends a JSON response; inspect its caller for status and error semantics.

## Module-level declarations

- Line 9: `const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);`.
- Line 11: `const validateAdmin = (admin) => {`.
- Line 13: `const values = Object.values(admin).filter(Boolean);`.
- Line 24: `const tenants = await runWithTenant({ bypass: true }, () => Organization.find(tenantFilter(req)).sort({ createdAt: -1 }).lean());`.
- Line 30: `let organization = null;`.
- Line 31: `let adminUser = null;`.
- Line 33: `const { name, slug, country = "Kenya", timezone = "Africa/Nairobi", currency = "KES" } = req.body || {};`.
- Line 35: `const admin = validateAdmin(req.body?.admin);`.
- Line 36: `const tenantSlug = slugify(slug || name);`.
- Line 39: `const duplicateSlug = await runWithTenant({ bypass: true }, () => Organization.findOne({ slug: tenantSlug }).lean());`.
- Line 45: `const roles = await ensureSystemRoles();`.
- Line 59: `const safeAdmin = adminUser ? { _id: adminUser._id, name: adminUser.name, email: adminUser.email, phone: adminUser.phone, role: "admin", tenantId: adminUser.tenantId } : null;`.
- Line 71: `const tenant = await runWithTenant({ bypass: true }, () => Organization.findOne(`.
- Line 83: `const allowed = ["name", "legalName", "logoUrl", "websiteUrl", "domain", "supportEmail", "supportPhone", "country", "timezone", "currency", "status", "subscription", "features", "s`.
- Line 84: `const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));`.
- Line 85: `const tenant = await runWithTenant({ bypass: true }, () => Organization.findOneAndUpdate(`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
