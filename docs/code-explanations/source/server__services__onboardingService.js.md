# Source explanation: server/services/onboardingService.js

**Source:** [server/services/onboardingService.js](../../../server/services/onboardingService.js)

## Purpose

A backend domain/integration service used by controllers, model hooks, or background work. Its exported operations define reusable business behavior.

## Imports and dependencies

- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `Permission` from `../models/Permission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Permission.js](../../../server/models/Permission.js)
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `permissionMeta` — lines 22–38

Parameters: `name`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 23:** `const [module = "system"] = name.split(".");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `const categoryMap = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `return {` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `ensureSystemRoles` — lines 40–72

Parameters: `arg1 (defaulted)`.
3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 41:** `const permissionMap = new Map();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `for (const name of [...new Set([...SUPERADMIN_PERMISSION_NAMES, ...ADMIN_PERMISSION_NAMES])]) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 43:** `const permission = await withPlatformContext({ bypass: true }, () => permissionModel.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 49:** `const superadmin = await withPlatformContext({ bypass: true }, () => roleModel.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 60:** `const admin = await withPlatformContext({ bypass: true }, () => roleModel.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 71:** `return { superadmin, admin };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `countSuperAdmins` — lines 74–76

Parameters: none.
Persistent operations detected: User.countDocuments; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 75:** `return runWithTenant({ bypass: true }, () => User.countDocuments({ role: { $in: SUPERADMIN_ROLES }, status: { $ne: "blocked" } }));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `countPlatformSuperAdminAccounts` — lines 78–80

Parameters: `arg1 (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 79:** `return withPlatformContext({ bypass: true }, () => userModel.countDocuments({ role: { $in: SUPERADMIN_ROLES } }));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `validateStagingSuperAdminIdentity` — lines 82–93

Parameters: `{name, email, phone, password}`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 83:** `const normalizedEmail = String(email || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 84:** `const normalizedPhone = String(phone || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 86:** `if (!String(name || "").trim()) throw new Error("SuperAdmin name is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 87:** `if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new Error("A valid SuperAdmin email is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 88:** `if (!/^\d{10}$/.test(normalizedPhone)) throw new Error("SuperAdmin phone must contain exactly 10 digits.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 89:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 90:** Sensitive-configuration/data operation; inspect source without copying secret values. — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 92:** `return { normalizedEmail, normalizedPhone };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `bootstrapStagingSuperAdmin` — lines 96–122

Parameters: `{name, email, phone, password}`, `arg2 (defaulted)`.
6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=false, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 100:** `const superAdminCount = count` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 103:** `if (superAdminCount > 0) return { created: false, reason: "exists" };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 105:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 106:** `const duplicateUser = await withPlatformContext({ bypass: true }, () => userModel.findOne({ email: identity.normalizedEmail }).lean());` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 107:** `if (duplicateUser) throw new Error("That email address already belongs to a user.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 109:** `const { superadmin } = await ensureRoles();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 110:** `const user = await withPlatformContext({ bypass: true }, () => userModel.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 116:** `if (!user.tenantId && user.role === "super_admin" && user.legacyRole === "super_admin") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 117:** `return { created: true, superAdmin: { _id: user._id, role: user.role, tenantId: user.tenantId || null } };` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 120:** `await withPlatformContext({ bypass: true }, () => userModel.deleteOne({ _id: user._id })).catch(() => {});` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 121:** `throw new Error("Created account failed platform SuperAdmin verification.");` — Stops the current operation with an error; callers or Express error handling determine the response.

### `validateIdentity` — lines 124–134

Parameters: `{name, email, phone, password, label}`.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 125:** `const normalizedEmail = String(email || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 126:** `const normalizedPhone = String(phone || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 127:** `if (!String(name || "").trim()) throw new Error(\`${label} name is required.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 128:** `if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new Error(\`A valid ${label} email is required.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 129:** `if (!/^\d{10}$/.test(normalizedPhone)) throw new Error(\`${label} phone must contain exactly 10 digits.\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 130:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 131:** Sensitive-configuration/data operation; inspect source without copying secret values. — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 133:** `return { normalizedEmail, normalizedPhone };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `slugify` — lines 136–137

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `bootstrapFirstSuperAdmin` — lines 139–197

Parameters: `{name, email, phone, password, companyName, companySlug, country, timezone, currency, admin}`.
Persistent operations detected: User.findOne, Organization.findOne, Organization.create, User.create, User.deleteOne, Organization.deleteOne; verify tenant/ownership filters in the exact query. 11 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 8 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 143:** `if (await countSuperAdmins() > 0) throw new Error("Initial SuperAdmin already exists. Bootstrap is permanently closed.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 145:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 146:** `const adminIdentity = validateIdentity({ ...admin, label: "First Admin" });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 147:** `if (superAdminIdentity.normalizedEmail === adminIdentity.normalizedEmail) throw new Error("SuperAdmin and first Admin must use different email addresses.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 149:** `const { superadmin, admin: adminRole } = await ensureSystemRoles();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 150:** `const slug = slugify(companySlug || companyName);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 151:** `if (!slug) throw new Error("A valid company slug is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 153:** `const duplicateUser = await runWithTenant({ bypass: true }, () => User.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 156:** `if (duplicateUser) throw new Error("One of the onboarding email addresses already belongs to a user.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 158:** `const existingOrganization = await runWithTenant({ bypass: true }, () => Organization.findOne({ slug }).lean());` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 159:** `if (existingOrganization) throw new Error("That company slug is already in use.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 161:** `let organization = null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 162:** `let superAdminUser = null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 163:** `let adminUser = null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 164:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 165:** `organization = await runWithTenant({ bypass: true }, () => Organization.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 171:** `superAdminUser = await runWithTenant({ bypass: true }, () => User.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 178:** `await runWithTenant({ bypass: true }, () => organization.save());` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 7: `const SUPERADMIN_ROLES = ["super_admin", "superadmin"];`.
- Line 9: `export const ADMIN_PERMISSION_NAMES = [`.
- Line 16: `export const SUPERADMIN_PERMISSION_NAMES = [`.
- Line 22: `const permissionMeta = (name) => {`.
- Line 23: `const [module = "system"] = name.split(".");`.
- Line 24: `const categoryMap = {`.
- Line 41: `const permissionMap = new Map();`.
- Line 43: `const permission = await withPlatformContext({ bypass: true }, () => permissionModel.findOneAndUpdate(`.
- Line 49: `const superadmin = await withPlatformContext({ bypass: true }, () => roleModel.findOneAndUpdate(`.
- Line 60: `const admin = await withPlatformContext({ bypass: true }, () => roleModel.findOneAndUpdate(`.
- Line 82: `<sensitive declaration redacted>`.
- Line 83: `const normalizedEmail = String(email || "").trim().toLowerCase();`.
- Line 84: `const normalizedPhone = String(phone || "").trim();`.
- Line 85: `<sensitive declaration redacted>`.
- Line 100: `const superAdminCount = count`.
- Line 105: `<sensitive declaration redacted>`.
- Line 106: `const duplicateUser = await withPlatformContext({ bypass: true }, () => userModel.findOne({ email: identity.normalizedEmail }).lean());`.
- Line 109: `const { superadmin } = await ensureRoles();`.
- Line 110: `const user = await withPlatformContext({ bypass: true }, () => userModel.create({`.
- Line 124: `<sensitive declaration redacted>`.
- Line 125: `const normalizedEmail = String(email || "").trim().toLowerCase();`.
- Line 126: `const normalizedPhone = String(phone || "").trim();`.
- Line 136: `const slugify = (value) => String(value || "").trim().toLowerCase()`.
- Line 145: `<sensitive declaration redacted>`.
- Line 146: `const adminIdentity = validateIdentity({ ...admin, label: "First Admin" });`.
- Line 149: `const { superadmin, admin: adminRole } = await ensureSystemRoles();`.
- Line 150: `const slug = slugify(companySlug || companyName);`.
- Line 153: `const duplicateUser = await runWithTenant({ bypass: true }, () => User.findOne({`.
- Line 158: `const existingOrganization = await runWithTenant({ bypass: true }, () => Organization.findOne({ slug }).lean());`.
- Line 161: `let organization = null;`.
- Line 162: `let superAdminUser = null;`.
- Line 163: `let adminUser = null;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
