# Source explanation: server/controllers/adminHeroController.js

**Source:** [server/controllers/adminHeroController.js](../../../server/controllers/adminHeroController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `HeroSlide` from `../models/HeroSlide.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HeroSlide.js](../../../server/models/HeroSlide.js)
- `getTenantContext`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)

## Runtime declarations and data flow

### `tenant` — lines 5–5

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `clean` — lines 6–6

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `payload` — lines 7–13

Parameters: `body (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `listHeroSlides` — lines 15–15

Parameters: `req`, `res`.
Persistent operations detected: HeroSlide.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 15:** `async (req, res) => res.json({ success: true, slides: await HeroSlide.find({ tenantId: tenant() }).sort({ order: 1, createdAt: 1 }).lean() })` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createHeroSlide` — lines 16–16

Parameters: `req`, `res`.
Reads request/component inputs: req.body. Persistent operations detected: HeroSlide.create; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 16:** `async (req, res) => { const slide = await HeroSlide.create({ tenantId: tenant(), ...payload(req.body) }); return res.status(201).json({ success: true, slide }); }` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `updateHeroSlide` — lines 17–17

Parameters: `req`, `res`.
Reads request/component inputs: req.params, req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `async (req, res) => { const tenantId = tenant(); if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid hero slide id" }); const slide = await HeroSlide.findOneAndUp` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `deleteHeroSlide` — lines 18–18

Parameters: `req`, `res`.
Reads request/component inputs: req.params. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 18:** `async (req, res) => { const deleted = await HeroSlide.findOneAndDelete({ _id: req.params.id, tenantId: tenant() }); if (!deleted) return res.status(404).json({ success: false, message: "Hero slide not found" }); return r` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 5: `const tenant = () => { requireTenantId(); return getTenantContext().tenantId; };`.
- Line 6: `const clean = (value) => String(value ?? "").trim();`.
- Line 7: `const payload = (body = {}) => ({`.
- Line 15: `export const listHeroSlides = async (req, res) => res.json({ success: true, slides: await HeroSlide.find({ tenantId: tenant() }).sort({ order: 1, createdAt: 1 }).lean() });`.
- Line 16: `export const createHeroSlide = async (req, res) => { const slide = await HeroSlide.create({ tenantId: tenant(), ...payload(req.body) }); return res.status(201).json({ success: true`.
- Line 17: `export const updateHeroSlide = async (req, res) => { const tenantId = tenant(); if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message:`.
- Line 18: `export const deleteHeroSlide = async (req, res) => { const deleted = await HeroSlide.findOneAndDelete({ _id: req.params.id, tenantId: tenant() }); if (!deleted) return res.status(4`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
