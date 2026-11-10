# Source explanation: server/controllers/authController.js

**Source:** [server/controllers/authController.js](../../../server/controllers/authController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mergeTenantFilter`, `runWithTenant`, `setTenantContext`, `getTenantContext` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `SecurityLog` from `../models/SecurityLog.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SecurityLog.js](../../../server/models/SecurityLog.js)
- `AuditLog` from `../models/AuditLog.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AuditLog.js](../../../server/models/AuditLog.js)
- `generateToken` from `../utils/generateToken.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/generateToken.js](../../../server/utils/generateToken.js)
- `buildPermissions` from `../utils/buildPermissions.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/buildPermissions.js](../../../server/utils/buildPermissions.js)
- `createCustomerLoginChallenge` from `./mfaController.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/controllers/mfaController.js](../../../server/controllers/mfaController.js)
- `sendSMS` from `../services/smsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/smsService.js](../../../server/services/smsService.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)
- `setAuthCookie`, `clearAuthCookies` from `../utils/authCookie.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/authCookie.js](../../../server/utils/authCookie.js)

## Runtime declarations and data flow

### `normalizeRole` — lines 15–15

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `effectiveRoleForUser` — lines 16–16

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isPlatformRole` — lines 17–17

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isPlatformOwner` — lines 18–18

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isCustomer` — lines 19–19

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `publicUser` — lines 21–25

Parameters: `user`, `permissions (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 22:** `const role = effectiveRoleForUser(user);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `const platformOwner = ["super_admin", "superadmin"].includes(role);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 24:** `return { _id: user._id, name: user.name, email: user.email, phone: user.phone, role, tenantId: platformOwner ? null : (user.tenantId || null), permissions, profileImage: user.profileImage, status: user.status, isVerified` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createAuditLog` — lines 26–26

Parameters: `data`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `isLocalPublicLogin` — lines 28–37

Parameters: `req`.
Reads request/component inputs: req.tenantId.

Key statements:
- **Line 29:** `const host = String(req.get("X-Forwarded-Host") || req.get("Host") || "").split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const hasExplicitTenant = Boolean(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `return ["localhost", "127.0.0.1", "[::1]"].includes(host) && !hasExplicitTenant;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `mongooseConnectionAvailable` — lines 39–39

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `findUniqueLocalTenantUser` — lines 44–73

Parameters: `req`, `email`.
Persistent operations detected: User.findById; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 45:** `if (!isLocalPublicLogin(req) || !mongooseConnectionAvailable()) return { resolved: false, ambiguous: false, user: null };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `const matches = await User.collection` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 48:** `.find({ email, tenantId: { $exists: true, $ne: null } })` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 53:** `if (matches.length > 1) return { resolved: true, ambiguous: true, user: null };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `if (matches.length !== 1 || !matches[0]?.tenantId) return { resolved: false, ambiguous: false, user: null };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 56:** `const tenantId = matches[0].tenantId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 59:** `const rawUser = matches[0];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 60:** `const rawRole = normalizeRole(rawUser.role || rawUser.legacyRole);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** `const tenantAdminRoles = new Set(["admin", "administrator"]);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 66:** `if (tenantAdminRoles.has(rawRole)) return { resolved: true, ambiguous: false, user: User.hydrate(rawUser) };` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 68:** `const user = await User.findById(rawUser._id)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 72:** `return { resolved: true, ambiguous: false, user };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `login` — lines 75–163

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.tenantId. Persistent operations detected: User.findOne; verify tenant/ownership filters in the exact query. 14 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 13 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 76:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 77:** `const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 78:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 79:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 83:** `const selectedTenantId = String(req.tenantId || getTenantContext().tenantId || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 85:** `const localResolution = await findUniqueLocalTenantUser(req, email);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 86:** `if (localResolution.ambiguous) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 87:** `return res.status(409).json({ success: false, code: "TENANT_SELECTION_REQUIRED", message: "This email is registered with more than one company. Open the company login page or provide the company identifier before signing` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 90:** `let user = localResolution.user;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 96:** `if (!user) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 99:** `async () => User.findOne({ email, role: { $in: ["super_admin", "superadmin"] }, tenantId: null })` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 109:** `if (!user && selectedTenantId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 110:** `user = await User.findOne(mergeTenantFilter({ email }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 116:** `if (user && !isPlatformOwner(user) && selectedTenantId && String(user.tenantId || "") !== selectedTenantId) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 117:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 120:** `if (!user) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 121:** `await SecurityLog.logEvent({ email, action: "login_failed", status: "failed", severity: "high", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "User not found" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 122:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `register` — lines 165–183

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.tenant, req.tenantId. Persistent operations detected: User.findOne, Role.findOne, User.create; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 166:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 167:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 168:** `const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 169:** `const normalizedPhone = String(phone || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 170:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 171:** `if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return res.status(400).json({ success: false, message: "Enter a valid email address." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 172:** `if (!/^\d{10}$/.test(normalizedPhone)) return res.status(400).json({ success: false, message: "Phone number must contain exactly 10 digits." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 173:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 174:** `const tenantId = req.tenant?._id || req.tenant?.id || req.tenantId || null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 175:** `if (!tenantId) return res.status(400).json({ success: false, message: "Unable to determine the company for this registration. Configure the public tenant or use the company domain and try again." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 176:** `const existingUser = await User.findOne(mergeTenantFilter({ $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 177:** `if (existingUser) return res.status(400).json({ success: false, message: existingUser.email === normalizedEmail ? "Email is already registered." : "Phone number is already registered." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 178:** `const customerRole = await Role.findOne({ name: "customer" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 179:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 180:** `await SecurityLog.logEvent({ user: user._id, email: user.email, action: "register", status: "success", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "User registration" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 181:** `return res.status(201).json({ success: true, user: publicUser(user, []), message: "Registration successful. You can now log in." });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `logout` — lines 185–192

Parameters: `req`, `res`, `next`.
Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 186:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 188:** `return res.status(204).send();` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 190:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getMe` — lines 194–200

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. Persistent operations detected: User.findById; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 195:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 196:** `const user = await User.findById(req.user._id).populate("roleId").populate("tenantId");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 197:** `if (!user) return res.status(404).json({ success: false, message: "User not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 198:** `return res.json({ success: true, user: { ...user.toObject(), tenantId: user.tenantId?._id || null, tenantSlug: user.tenantId?.slug || null } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `changePassword` — lines 202–214

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.body. Persistent operations detected: User.findById; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 203:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 204:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 205:** `if (!user) return res.status(404).json({ success: false, message: "User not found" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 206:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 207:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 208:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 210:** `await user.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 211:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 212:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.

### `findPasswordResetUser` — lines 216–227

Parameters: `email`.
Persistent operations detected: User.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 217:** `let user = await User.findOne(mergeTenantFilter({ email }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 219:** `if (!user) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 222:** `async () => User.findOne({ email, role: { $in: ["super_admin", "superadmin"] }, tenantId: null })` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 226:** `return user;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `escapeHtml` — lines 229–231

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `accountEmailCompanyName` — lines 233–238

Parameters: `req`.
Reads request/component inputs: req.tenant.

Key statements:

### `requestEmailChange` — lines 240–319

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user, req.tenant. Persistent operations detected: User.findById, User.findOne, Staff.findOne, Agent.findOne; verify tenant/ownership filters in the exact query. 10 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 241:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 242:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 243:** `const newEmail = String(req.body?.newEmail || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 245:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 246:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 248:** `if (!/^\S+@\S+\.\S+$/.test(newEmail)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 249:** `return res.status(400).json({ success: false, message: "Enter a valid new email address." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 252:** `const user = await User.findById(req.user._id)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 257:** `if (!user) return res.status(404).json({ success: false, message: "User not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 258:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 259:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 260:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 262:** `if (newEmail === String(user.email || "").trim().toLowerCase()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 263:** `return res.status(400).json({ success: false, message: "The new email address must be different from your current email." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 266:** `const existing = await runWithTenant(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 269:** `if (isPlatformOwner(user)) return User.findOne({ email: newEmail, role: { $in: ["super_admin", "superadmin"] }, tenantId: null }).select("_id email");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 270:** `return User.findOne({ email: newEmail, tenantId: user.tenantId }).select("_id email");` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 273:** `if (existing && String(existing._id) !== String(user._id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `confirmEmailChange` — lines 321–404

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user, req.tenant. Persistent operations detected: User.findById, User.findOne, Staff.findOne, Agent.findOne, Staff.updateOne, Agent.updateOne; verify tenant/ownership filters in the exact query. 9 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 322:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 323:** `const code = String(req.body?.code || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 324:** `if (!/^\d{6}$/.test(code)) return res.status(400).json({ success: false, message: "Enter the 6-digit verification code." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 326:** `const user = await User.findById(req.user._id)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 331:** `if (!user || !user.pendingEmail || !user.emailChangeCodeHash || !user.emailChangeExpiresAt) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 332:** `return res.status(400).json({ success: false, message: "There is no active email-change request. Request a new verification code." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 334:** `if (new Date(user.emailChangeExpiresAt).getTime() < Date.now()) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 339:** `await user.save({ validateBeforeSave: false });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 340:** `return res.status(400).json({ success: false, message: "The verification code has expired. Request a new code." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 342:** `if (Number(user.emailChangeAttempts || 0) >= 5) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 343:** `return res.status(429).json({ success: false, message: "Too many incorrect verification attempts. Request a new code." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 346:** `const hash = crypto.createHash("sha256").update(code).digest("hex");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 347:** `if (hash !== user.emailChangeCodeHash) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 349:** `await user.save({ validateBeforeSave: false });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 350:** `return res.status(401).json({ success: false, message: "Invalid verification code." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 353:** `const oldEmail = user.email;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 354:** `const newEmail = String(user.pendingEmail).trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 356:** `const duplicate = await runWithTenant(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `requestPasswordReset` — lines 406–449

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.tenant. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 407:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 408:** `const email = String(req.body?.email || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 409:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 410:** `if (!email || !/^\S+@\S+\.\S+$/.test(email)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 411:** `return res.status(400).json({ success: false, message: "A valid email address is required." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 413:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 414:** `if (!user) return res.json(generic);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 416:** `const code = String(crypto.randomInt(100000, 1000000));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 420:** `await user.save({ validateBeforeSave: false });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 422:** `const companyName = isPlatformOwner(user)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 425:** `const safeCompanyName = companyName.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 426:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 427:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 428:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 430:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 431:** `const { sendEmail } = await import("../services/emailService.js");` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 432:** `await sendEmail({ to: user.email, subject, html, text, fromName: companyName, settingsSource: req });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 438:** `await user.save({ validateBeforeSave: false });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `resetPasswordWithCode` — lines 451–476

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. Persistent operations detected: User.findOne; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 452:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 453:** `const email = String(req.body?.email || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 454:** `const code = String(req.body?.code || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 455:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 456:** `if (!email || !/^\d{6}$/.test(code)) return res.status(400).json({ success: false, message:"Email and a 6-digit reset code are required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 457:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 458:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 459:** `if (!user) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 462:** `async () => User.findOne({ email, role: { $in: ["super_admin", "superadmin"] }, tenantId: null })` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 466:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 467:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 468:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 469:** `const hash = crypto.createHash("sha256").update(code).digest("hex");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 470:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 472:** `await user.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 473:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 474:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 15: `const normalizeRole = (value) => String(value?.name || value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");`.
- Line 16: `const effectiveRoleForUser = (user) => normalizeRole(user?.role) || normalizeRole(user?.legacyRole) || normalizeRole(user?.roleId) || "customer";`.
- Line 17: `const isPlatformRole = (user) => ["super_admin", "superadmin"].includes(effectiveRoleForUser(user));`.
- Line 18: `const isPlatformOwner = (user) => isPlatformRole(user) && !user.tenantId;`.
- Line 19: `const isCustomer = (user) => effectiveRoleForUser(user) === "customer";`.
- Line 20: `const MFA_ENABLED = String(process.env.MFA_ENABLED || "false").toLowerCase() === "true";`.
- Line 21: `const publicUser = (user, permissions = []) => {`.
- Line 22: `const role = effectiveRoleForUser(user);`.
- Line 23: `const platformOwner = ["super_admin", "superadmin"].includes(role);`.
- Line 26: `const createAuditLog = (data) => AuditLog.log(data);`.
- Line 28: `const isLocalPublicLogin = (req) => {`.
- Line 29: `const host = String(req.get("X-Forwarded-Host") || req.get("Host") || "").split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");`.
- Line 30: `const hasExplicitTenant = Boolean(`.
- Line 39: `const mongooseConnectionAvailable = () => Boolean(User?.db?.readyState === 1 && User?.collection);`.
- Line 44: `const findUniqueLocalTenantUser = async (req, email) => {`.
- Line 47: `const matches = await User.collection`.
- Line 56: `const tenantId = matches[0].tenantId;`.
- Line 59: `const rawUser = matches[0];`.
- Line 60: `const rawRole = normalizeRole(rawUser.role || rawUser.legacyRole);`.
- Line 61: `const tenantAdminRoles = new Set(["admin", "administrator"]);`.
- Line 68: `const user = await User.findById(rawUser._id)`.
- Line 75: `export const login = async (req, res, next) => {`.
- Line 77: `const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";`.
- Line 78: `<sensitive declaration redacted>`.
- Line 83: `const selectedTenantId = String(req.tenantId || getTenantContext().tenantId || "");`.
- Line 85: `const localResolution = await findUniqueLocalTenantUser(req, email);`.
- Line 90: `let user = localResolution.user;`.
- Line 137: `const effectiveRole = effectiveRoleForUser(user);`.
- Line 138: `const platformOwner = isPlatformOwner(user);`.
- Line 139: `const platformRoleWithTenant = isPlatformRole(user) && !platformOwner;`.
- Line 141: `const permissions = buildPermissions(user);`.
- Line 145: `const challenge = await createCustomerLoginChallenge(user);`.
- Line 153: `<sensitive declaration redacted>`.
- Line 154: `<sensitive declaration redacted>`.
- Line 165: `export const register = async (req, res, next) => {`.
- Line 167: `<sensitive declaration redacted>`.
- Line 168: `const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";`.
- Line 169: `const normalizedPhone = String(phone || "").trim();`.
- Line 174: `const tenantId = req.tenant?._id || req.tenant?.id || req.tenantId || null;`.
- Line 176: `const existingUser = await User.findOne(mergeTenantFilter({ $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] }));`.
- Line 178: `const customerRole = await Role.findOne({ name: "customer" });`.
- Line 179: `<sensitive declaration redacted>`.
- Line 185: `export const logout = async (req, res, next) => {`.
- Line 194: `export const getMe = async (req, res, next) => {`.
- Line 196: `const user = await User.findById(req.user._id).populate("roleId").populate("tenantId");`.
- Line 202: `<sensitive declaration redacted>`.
- Line 204: `<sensitive declaration redacted>`.
- Line 207: `<sensitive declaration redacted>`.
- Line 216: `<sensitive declaration redacted>`.
- Line 217: `let user = await User.findOne(mergeTenantFilter({ email }))`.
- Line 229: `const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({`.
- Line 233: `const accountEmailCompanyName = (req) => String(`.
- Line 240: `export const requestEmailChange = async (req, res, next) => {`.
- Line 242: `<sensitive declaration redacted>`.
- Line 243: `const newEmail = String(req.body?.newEmail || "").trim().toLowerCase();`.
- Line 252: `const user = await User.findById(req.user._id)`.
- Line 266: `const existing = await runWithTenant(`.
- Line 278: `const [staffConflict, agentConflict] = await Promise.all([`.
- Line 287: `const code = String(crypto.randomInt(100000, 1000000));`.
- Line 294: `const companyName = accountEmailCompanyName(req);`.
- Line 295: `const safeCompanyName = escapeHtml(companyName);`.
- Line 296: `const subject = \`Confirm your new email address - ${companyName}\`;`.
- Line 297: `const text = \`We received a request to change your ${companyName} account email to ${newEmail}. Your verification code is: ${code}. This code expires in 10 minutes. If you did not`.
- Line 298: `const html = \`<div style="max-width:620px;margin:0 auto;padding:28px;font-family:Arial,sans-serif;color:#1f2937;line-height:1.6;border:1px solid #e5e7eb;border-radius:12px"><h2 st`.
- Line 301: `const { sendEmail } = await import("../services/emailService.js");`.
- Line 321: `export const confirmEmailChange = async (req, res, next) => {`.
- Line 323: `const code = String(req.body?.code || "").trim();`.
- Line 326: `const user = await User.findById(req.user._id)`.
- Line 346: `const hash = crypto.createHash("sha256").update(code).digest("hex");`.
- Line 353: `const oldEmail = user.email;`.
- Line 354: `const newEmail = String(user.pendingEmail).trim().toLowerCase();`.
- Line 356: `const duplicate = await runWithTenant(`.
- Line 363: `const [staffConflict, agentConflict] = await Promise.all([`.
- Line 387: `const tenantFilter = user.tenantId ? { tenantId: user.tenantId } : {};`.
- Line 393: `const permissions = buildPermissions(user);`.
- Line 394: `<sensitive declaration redacted>`.
- Line 395: `<sensitive declaration redacted>`.
- Line 406: `<sensitive declaration redacted>`.
- Line 408: `const email = String(req.body?.email || "").trim().toLowerCase();`.
- Line 409: `<sensitive declaration redacted>`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
