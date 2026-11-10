# Source explanation: server/seeds/cleanAndReseedGlobalTours.js

**Source:** [server/seeds/cleanAndReseedGlobalTours.js](../../../server/seeds/cleanAndReseedGlobalTours.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

- `dotenv` from `dotenv`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `bcrypt` from `bcryptjs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `crypto` from `crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `image` — lines 10–10

Parameters: `id`, `width (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `oid` — lines 50–50

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `slugify` — lines 51–51

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `run` — lines 53–151

Parameters: none.
24 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=false, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 54:** `if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `await mongoose.connect(process.env.MONGODB_URI);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 56:** `const db = mongoose.connection.db;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 57:** `const oldCollections = await db.listCollections().toArray();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 58:** `for (const collection of oldCollections) await db.collection(collection.name).drop().catch(() => {});` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 60:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 61:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 62:** `const permissionDocs = PERMISSIONS.map((name) => ({ _id: oid(), name, label: name.replace(/_/g, " "), module: name.split(/[._]/)[0], category: "other", description: \`Permission to ${name.replace(/_/g, " ")}\`, isActive:` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 63:** `await db.collection("permissions").insertMany(permissionDocs);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 64:** `const roleDocs = ROLE_DEFS.map(([name, displayName, level]) => ({ _id: oid(), name, displayName, level, isSystem: true, status: "active", permissions: permissionDocs.map((p) => p._id), createdAt: now, updatedAt: now }));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 65:** `await db.collection("roles").insertMany(roleDocs);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 66:** `const roleByName = new Map(roleDocs.map((r) => [r.name, r]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 68:** `const organizations = TENANTS.map((tenant) => ({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 75:** `await db.collection("organizations").insertMany(organizations);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 77:** `const allUsers = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 79:** `for (let t = 0; t < organizations.length; t += 1) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 80:** `const tenant = organizations[t];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `const company = TENANTS[t];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `makeUser` — lines 83–86

Parameters: `name`, `email`, `phone`, `roleName`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 84:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.

### `staffFor` — lines 96–96

Parameters: `user`, `position`, `role`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 8: `<sensitive declaration redacted>`.
- Line 9: `const PLATFORM_ADMIN_EMAIL = "platformadmin@toursaas.co.ke";`.
- Line 10: `const image = (id, width = 1800) => \`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=90\`;`.
- Line 11: `const IMAGE_POOL = [`.
- Line 18: `const TENANTS = [`.
- Line 24: `const DESTINATIONS = [`.
- Line 35: `const TOUR_TEMPLATES = [`.
- Line 43: `const PERMISSIONS = [`.
- Line 49: `const ROLE_DEFS = [["super_admin", "Super Admin", 100], ["admin", "Admin", 90], ["tour_manager", "Tour Manager", 70], ["agent", "Travel Agent", 50], ["tour_guide", "Tour Guide", 40`.
- Line 50: `const oid = () => new mongoose.Types.ObjectId();`.
- Line 51: `const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");`.
- Line 53: `const run = async () => {`.
- Line 56: `const db = mongoose.connection.db;`.
- Line 57: `const oldCollections = await db.listCollections().toArray();`.
- Line 60: `const now = new Date();`.
- Line 61: `<sensitive declaration redacted>`.
- Line 62: `const permissionDocs = PERMISSIONS.map((name) => ({ _id: oid(), name, label: name.replace(/_/g, " "), module: name.split(/[._]/)[0], category: "other", description: \`Permission to`.
- Line 64: `const roleDocs = ROLE_DEFS.map(([name, displayName, level]) => ({ _id: oid(), name, displayName, level, isSystem: true, status: "active", permissions: permissionDocs.map((p) => p._`.
- Line 66: `const roleByName = new Map(roleDocs.map((r) => [r.name, r]));`.
- Line 68: `const organizations = TENANTS.map((tenant) => ({`.
- Line 77: `const allUsers = [];`.
- Line 80: `const tenant = organizations[t];`.
- Line 81: `const company = TENANTS[t];`.
- Line 82: `const suffix = ["at", "scs", "cha"][t];`.
- Line 83: `const makeUser = (name, email, phone, roleName) => {`.
- Line 84: `<sensitive declaration redacted>`.
- Line 87: `const admin = makeUser(\`${company.name} Admin\`, company.email, company.phone, "admin");`.
- Line 88: `const manager = makeUser(\`${company.name} Tour Manager\`, \`manager@${suffix}.co.ke\`, company.phone, "tour_manager");`.
- Line 89: `const agentUser = makeUser(\`${company.name} Travel Agent\`, \`agent@${suffix}.co.ke\`, company.phone, "agent");`.
- Line 90: `const guide1 = makeUser(\`${company.name} Safari Guide\`, \`guide1@${suffix}.co.ke\`, company.phone, "tour_guide");`.
- Line 91: `const guide2 = makeUser(\`${company.name} Wildlife Guide\`, \`guide2@${suffix}.co.ke\`, company.phone, "tour_guide");`.
- Line 92: `const driver = makeUser(\`${company.name} Driver\`, \`driver@${suffix}.co.ke\`, company.phone, "driver");`.
- Line 93: `const customer1 = makeUser(\`${company.name} Customer One\`, \`customer1@${suffix}.co.ke\`, "+254700100001", "customer");`.
- Line 94: `const customer2 = makeUser(\`${company.name} Customer Two\`, \`customer2@${suffix}.co.ke\`, "+254700100002", "customer");`.
- Line 96: `const staffFor = (user, position, role) => ({ _id: oid(), tenantId: tenant._id, user: user._id, name: user.name, email: user.email, phone: user.phone, position, role, status: "acti`.
- Line 97: `const tenantStaff = [staffFor(manager, "tour_manager", "tour_manager"), staffFor(guide1, "guide", "guide"), staffFor(guide2, "guide", "guide"), staffFor(driver, "driver", "driver")`.
- Line 98: `const tenantAgent = { _id: oid(), tenantId: tenant._id, user: agentUser._id, companyName: company.name, name: agentUser.name, email: agentUser.email, phone: agentUser.phone, locati`.
- Line 99: `const tenantCustomers = [customer1, customer2].map((user, i) => ({ _id: oid(), tenantId: tenant._id, user: user._id, name: user.name, email: user.email, phone: user.phone, country:`.
- Line 100: `const tenantVehicles = [1, 2].map((v) => ({ _id: oid(), tenantId: tenant._id, name: \`${company.name} Safari Van ${v}\`, registrationNumber: \`KDA ${t + 10}${v}A\`, type: "Safari V`.
- Line 107: `const destinationDocs = DESTINATIONS.map(([name, slug, region, description], index) => ({ _id: oid(), tenantId: tenant._id, name, slug, country: "Kenya", region, shortDescription: `.
- Line 109: `const destinationByName = new Map(destinationDocs.map((d) => [d.name, d]));`.
- Line 110: `const tourDocs = TOUR_TEMPLATES.map(([title, destinationName, category, days, price], index) => {`.
- Line 111: `const destination = destinationByName.get(destinationName); const startDate = new Date(now); startDate.setDate(startDate.getDate() + 10 + index * 4 + t * 2); const tourImage = IMAG`.
- Line 119: `const bookingSpecs = [`.
- Line 125: `const guideStaff = tenantStaff.filter((s) => s.position === "guide"); const driverStaff = tenantStaff.find((s) => s.position === "driver");`.
- Line 126: `const bookingDocs = bookingSpecs.map((spec, index) => { const amount = spec.tour.price * spec.guests; const travelDate = new Date(spec.tour.startDate); const deposit = spec.payment`.
- Line 128: `const paymentDocs = bookingDocs.map((booking, index) => ({ _id: oid(), tenantId: tenant._id, customer: booking.user, user: booking.user, booking: booking._id, provider: "MPESA", me`.
- Line 140: `<sensitive declaration redacted>`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
