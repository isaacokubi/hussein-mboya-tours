# Source explanation: server/controllers/agentController.js

**Source:** [server/controllers/agentController.js](../../../server/controllers/agentController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Commission` from `../models/Commission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Commission.js](../../../server/models/Commission.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)

## Runtime declarations and data flow

### `getGlobalCommissionRate` — lines 7–11

Parameters: `req`.
Reads request/component inputs: req.tenantId, req.user. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 8:** `const settings = await getSystemSettings({ req, tenantId: req.tenantId || req.user?.tenantId || null });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 9:** `const rate = Number(settings?.defaultCommissionRate);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 10:** `return Number.isFinite(rate) && rate >= 0 && rate <= 100 ? rate : 10;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getAgent` — lines 13–18

Parameters: `user`.
Persistent operations detected: Agent.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 14:** `const tenantFilter = mergeTenantFilter({});` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `let agent = await Agent.findOne({ ...tenantFilter, user: user._id }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 16:** `if (!agent && user.email) agent = await Agent.findOne({ ...tenantFilter, email: String(user.email).toLowerCase() }).lean();` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `return agent;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `cleanText` — lines 20–25

Parameters: `value`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 21:** `if (value === undefined || value === null) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 22:** `const text = String(value).trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 23:** `if (!text || /^undefined(?:\s+undefined)?$/i.test(text) || /^null(?:\s+null)?$/i.test(text)) return "";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 24:** `return text;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `bookingCustomerFallback` — lines 27–38

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 28:** `const customer = booking?.customer;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 29:** `const snapshot = booking?.customerSnapshot || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 30:** `const contact = booking?.contact || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 31:** `const name = cleanText(customer?.name)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 35:** `const email = cleanText(customer?.email) || cleanText(snapshot.email) || cleanText(contact.email);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 36:** `const phone = cleanText(customer?.phone) || cleanText(snapshot.phone) || cleanText(contact.phone);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `return name || email || phone ? { ...(customer || {}), name: name || undefined, email: email || undefined, phone: phone || undefined } : null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `bookingTourFallback` — lines 40–46

Parameters: `booking`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 41:** `if (booking?.tour) return booking.tour;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 42:** `const custom = booking?.customTourRequest;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `if (!custom) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `const destination = cleanText(custom.destination);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `return destination ? { title: \`Custom trip — ${destination}\`, destination } : { title: "Custom trip" };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `normalizeRecentBooking` — lines 48–48

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getAgentDashboard` — lines 50–143

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. Persistent operations detected: Agent.create, Agent.updateOne, Booking.countDocuments, Booking.aggregate, Commission.aggregate, Booking.find; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 52:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 53:** `let agent = await getAgent(req.user);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 54:** `if (!agent) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `agent = (await Agent.create({ ...mergeTenantFilter({}), user: req.user._id, companyName: req.user.name || "", email: String(req.user.email || "").toLowerCase(), phone: req.user.phone || "", status: "active", isApproved: ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 57:** `await Agent.updateOne(mergeTenantFilter({ _id: agent._id }), { $set: { user: req.user._id } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 60:** `const globalCommissionRate = await getGlobalCommissionRate(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 61:** `if (Number(agent.commissionRate) !== globalCommissionRate) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 62:** `await Agent.updateOne(mergeTenantFilter({ _id: agent._id }), { $set: { commissionRate: globalCommissionRate } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 66:** `const base = mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `const commissionBase = mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 68:** `const now = new Date();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 69:** `const activeStatuses = ["confirmed", "assigned", "ongoing"];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 71:** `const [bookings, upcomingBookings, completedTours, salesResult, guestsResult, customersResult, commissionResult, pendingCommissionResult, paidCommissionResult, pendingBookings, cancelledBookings, recentRaw] = await Promi` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 72:** `Booking.countDocuments(base),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 73:** `Booking.countDocuments({ ...base, status: { $in: activeStatuses }, travelDate: { $gte: now } }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 74:** `Booking.countDocuments({ ...base, status: "completed" }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 75:** `Booking.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 79:** `Booking.aggregate([` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getAgentBookings` — lines 145–167

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user, req.query. Persistent operations detected: Booking.find, Booking.countDocuments; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 146:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 147:** `const agent = await getAgent(req.user);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 148:** `if (!agent) return res.status(404).json({ success: false, message: "Agent profile not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 149:** `const page = Math.max(1, Number(req.query.page) || 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 150:** `const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 10));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 151:** `const filter = mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } });` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 152:** `if (req.query.status) filter.status = req.query.status;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 153:** `const [items, total] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 154:** `Booking.find(filter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 161:** `Booking.countDocuments(filter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 163:** `return res.json({ success: true, data: items, bookings: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getAgentCustomers` — lines 169–188

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. Persistent operations detected: Booking.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 170:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 171:** `const agent = await getAgent(req.user);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 172:** `if (!agent) return res.status(404).json({ success: false, message: "Agent profile not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 173:** `const bookings = await Booking.find(mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 177:** `const seen = new Map();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 178:** `for (const booking of bookings) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 179:** `const customer = booking.customer || booking.customerSnapshot || booking.contact;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 180:** `if (!customer) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 181:** `const key = String(customer._id || customer.email || customer.phone || customer.name || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 182:** `if (key && !seen.has(key)) seen.set(key, customer);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 184:** `return res.json({ success: true, data: Array.from(seen.values()) });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getMyAgentCommission` — lines 190–203

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.user. Persistent operations detected: Commission.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 191:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 192:** `const agent = await getAgent(req.user);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 193:** `if (!agent) return res.status(404).json({ success: false, message: "Agent profile not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 194:** `const commissions = await Commission.find(mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 198:** `const globalCommissionRate = await getGlobalCommissionRate(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 199:** `return res.status(200).json({ success: true, commissionRate: globalCommissionRate, data: commissions });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `const getGlobalCommissionRate = async (req) => {`.
- Line 8: `const settings = await getSystemSettings({ req, tenantId: req.tenantId || req.user?.tenantId || null });`.
- Line 9: `const rate = Number(settings?.defaultCommissionRate);`.
- Line 13: `const getAgent = async (user) => {`.
- Line 14: `const tenantFilter = mergeTenantFilter({});`.
- Line 15: `let agent = await Agent.findOne({ ...tenantFilter, user: user._id }).lean();`.
- Line 20: `const cleanText = (value) => {`.
- Line 22: `const text = String(value).trim();`.
- Line 27: `const bookingCustomerFallback = (booking) => {`.
- Line 28: `const customer = booking?.customer;`.
- Line 29: `const snapshot = booking?.customerSnapshot || {};`.
- Line 30: `const contact = booking?.contact || {};`.
- Line 31: `const name = cleanText(customer?.name)`.
- Line 35: `const email = cleanText(customer?.email) || cleanText(snapshot.email) || cleanText(contact.email);`.
- Line 36: `const phone = cleanText(customer?.phone) || cleanText(snapshot.phone) || cleanText(contact.phone);`.
- Line 40: `const bookingTourFallback = (booking) => {`.
- Line 42: `const custom = booking?.customTourRequest;`.
- Line 44: `const destination = cleanText(custom.destination);`.
- Line 48: `const normalizeRecentBooking = (booking) => ({ ...booking, customer: bookingCustomerFallback(booking), tour: bookingTourFallback(booking) });`.
- Line 50: `export const getAgentDashboard = async (req, res, next) => {`.
- Line 53: `let agent = await getAgent(req.user);`.
- Line 60: `const globalCommissionRate = await getGlobalCommissionRate(req);`.
- Line 66: `const base = mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } });`.
- Line 67: `const commissionBase = mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } });`.
- Line 68: `const now = new Date();`.
- Line 69: `const activeStatuses = ["confirmed", "assigned", "ongoing"];`.
- Line 71: `const [bookings, upcomingBookings, completedTours, salesResult, guestsResult, customersResult, commissionResult, pendingCommissionResult, paidCommissionResult, pendingBookings, can`.
- Line 145: `export const getAgentBookings = async (req, res, next) => {`.
- Line 147: `const agent = await getAgent(req.user);`.
- Line 149: `const page = Math.max(1, Number(req.query.page) || 1);`.
- Line 150: `const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 10));`.
- Line 151: `const filter = mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } });`.
- Line 153: `const [items, total] = await Promise.all([`.
- Line 169: `export const getAgentCustomers = async (req, res, next) => {`.
- Line 171: `const agent = await getAgent(req.user);`.
- Line 173: `const bookings = await Booking.find(mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } }))`.
- Line 177: `const seen = new Map();`.
- Line 179: `const customer = booking.customer || booking.customerSnapshot || booking.contact;`.
- Line 181: `const key = String(customer._id || customer.email || customer.phone || customer.name || "");`.
- Line 190: `export const getMyAgentCommission = async (req, res, next) => {`.
- Line 192: `const agent = await getAgent(req.user);`.
- Line 194: `const commissions = await Commission.find(mergeTenantFilter({ agent: agent._id, isDeleted: { $ne: true } }))`.
- Line 198: `const globalCommissionRate = await getGlobalCommissionRate(req);`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
