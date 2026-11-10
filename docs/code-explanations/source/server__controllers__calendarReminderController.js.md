# Source explanation: server/controllers/calendarReminderController.js

**Source:** [server/controllers/calendarReminderController.js](../../../server/controllers/calendarReminderController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `CalendarReminder` from `../models/CalendarReminder.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CalendarReminder.js](../../../server/models/CalendarReminder.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `isValidDateOnly` — lines 5–10

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 6:** `if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 7:** `const [year, month, day] = value.split("-").map(Number);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 8:** `const date = new Date(Date.UTC(year, month - 1, day));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `listCalendarReminders` — lines 12–32

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: CalendarReminder.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 13:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 15:** `const filter = mergeTenantFilter({});` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (req.query.start || req.query.end) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if ((req.query.start && !isValidDateOnly(req.query.start)) || (req.query.end && !isValidDateOnly(req.query.end))) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `return res.status(400).json({ success: false, message: "Use valid YYYY-MM-DD start/end dates." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 20:** `if (req.query.start && req.query.end && req.query.start > req.query.end) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `return res.status(400).json({ success: false, message: "Start date must be on or before end date." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 23:** `if (req.query.start || req.query.end) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 25:** `if (req.query.start) filter.date.$gte = req.query.start;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `if (req.query.end) filter.date.$lte = req.query.end;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 29:** `const reminders = await CalendarReminder.find(filter).sort({ date: 1, createdAt: 1 }).limit(500).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 30:** `return res.status(200).json({ success: true, data: reminders });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createCalendarReminder` — lines 34–56

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: CalendarReminder.findOne, CalendarReminder.create; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 35:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 36:** `const tenantId = requireTenantId();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `const date = typeof req.body?.date === "string" ? req.body.date : "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 38:** `const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 39:** `if (!isValidDateOnly(date)) return res.status(400).json({ success: false, message: "A valid reminder date in YYYY-MM-DD format is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 40:** `if (!title || title.length > 180) return res.status(400).json({ success: false, message: "Reminder title must contain 1–180 characters." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 41:** `const normalizedTitle = title.toLocaleLowerCase("en");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 42:** `const existing = await CalendarReminder.findOne(mergeTenantFilter({ date, normalizedTitle }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 43:** `if (existing) return res.status(409).json({ success: false, message: "That reminder already exists on this date.", data: existing });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 44:** `const reminder = await CalendarReminder.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 51:** `return res.status(201).json({ success: true, data: reminder });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 53:** `if (error?.code === 11000) return res.status(409).json({ success: false, message: "That reminder already exists on this date." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 54:** `return next(error);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `deleteCalendarReminder` — lines 58–66

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 59:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 61:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ success: false, message: "Reminder not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 62:** `const reminder = await CalendarReminder.findOneAndDelete(mergeTenantFilter({ _id: req.params.id }));` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 63:** `if (!reminder) return res.status(404).json({ success: false, message: "Reminder not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 64:** `return res.status(200).json({ success: true, message: "Reminder removed.", data: { id: String(reminder._id) } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 5: `const isValidDateOnly = (value) => {`.
- Line 7: `const [year, month, day] = value.split("-").map(Number);`.
- Line 8: `const date = new Date(Date.UTC(year, month - 1, day));`.
- Line 12: `export const listCalendarReminders = async (req, res, next) => {`.
- Line 15: `const filter = mergeTenantFilter({});`.
- Line 29: `const reminders = await CalendarReminder.find(filter).sort({ date: 1, createdAt: 1 }).limit(500).lean();`.
- Line 34: `export const createCalendarReminder = async (req, res, next) => {`.
- Line 36: `const tenantId = requireTenantId();`.
- Line 37: `const date = typeof req.body?.date === "string" ? req.body.date : "";`.
- Line 38: `const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";`.
- Line 41: `const normalizedTitle = title.toLocaleLowerCase("en");`.
- Line 42: `const existing = await CalendarReminder.findOne(mergeTenantFilter({ date, normalizedTitle }));`.
- Line 44: `const reminder = await CalendarReminder.create({`.
- Line 58: `export const deleteCalendarReminder = async (req, res, next) => {`.
- Line 62: `const reminder = await CalendarReminder.findOneAndDelete(mergeTenantFilter({ _id: req.params.id }));`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
