# Source explanation: server/middleware/validateTourCommand.js

**Source:** [server/middleware/validateTourCommand.js](../../../server/middleware/validateTourCommand.js)

## Purpose

Express middleware that runs in a request pipeline, inspecting or enriching the request, rejecting it, or calling next().

## Imports and dependencies

No ES module imports were found.

## Runtime declarations and data flow

### `parseDate` — lines 1–4

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 2:** `const date = new Date(value);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 3:** `return Number.isNaN(date.getTime()) ? null : date;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `validateTourCommand` — lines 6–28

Parameters: `arg1 (defaulted)`.
Reads request/component inputs: req.body. 16 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 7:** `return (req, res, next) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 8:** `const body = req.body || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 9:** `if (req.method !== "DELETE") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `if (body.title !== undefined && !String(body.title).trim()) return res.status(400).json({ success:false, message:"Tour title is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 11:** `if (body.description !== undefined && !String(body.description).trim()) return res.status(400).json({ success:false, message:"Tour description is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 12:** `if (body.price !== undefined && (!Number.isFinite(Number(body.price)) || Number(body.price) < 0)) return res.status(400).json({ success:false, message:"Tour price must be a non-negative number." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 13:** `if (body.capacity !== undefined && (!Number.isInteger(Number(body.capacity)) || Number(body.capacity) < 1)) return res.status(400).json({ success:false, message:"Tour capacity must be a positive whole number." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `if (body.discount !== undefined && (!Number.isFinite(Number(body.discount)) || Number(body.discount) < 0 || Number(body.discount) > 100)) return res.status(400).json({ success:false, message:"Discount must be between 0 a` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 15:** `if (body.depositRequired !== undefined && (!Number.isFinite(Number(body.depositRequired)) || Number(body.depositRequired) < 0)) return res.status(400).json({ success:false, message:"Deposit must be non-negative." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 16:** `if (body.depositType !== undefined && !["fixed","percentage"].includes(String(body.depositType).toLowerCase())) return res.status(400).json({ success:false, message:"depositType must be fixed or percentage." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `if (body.duration !== undefined) { const match = String(body.duration).match(/\d+(?:\.\d+)?/); const duration = Number(match?.[0]); if (!Number.isFinite(duration) || duration < 1 || duration > 365) return res.status(400)` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 18:** `if (body.durationDays !== undefined && (!Number.isInteger(Number(body.durationDays)) || Number(body.durationDays) < 1 || Number(body.durationDays) > 365)) return res.status(400).json({ success:false, message:"durationDay` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 19:** `for (const field of ["date", "startDate"]) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 20:** `if (body[field] === undefined) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 21:** `const date = parseDate(body[field]);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 22:** `if (!date) return res.status(400).json({ success:false, message:\`Tour ${field} must be valid.\` });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 23:** `if (!allowPast) { const today = new Date(); today.setHours(0,0,0,0); date.setHours(0,0,0,0); if (date < today) return res.status(400).json({ success:false, message:\`Tour ${field} cannot be in the past.\` }); }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 26:** `return next();` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 1: `const parseDate = (value) => {`.
- Line 2: `const date = new Date(value);`.
- Line 8: `const body = req.body || {};`.
- Line 21: `const date = parseDate(body[field]);`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
