# Source explanation: server/controllers/managementAccountingController.js

**Source:** [server/controllers/managementAccountingController.js](../../../server/controllers/managementAccountingController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `crypto` from `node:crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `FixedAsset` from `../models/FixedAsset.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/FixedAsset.js](../../../server/models/FixedAsset.js)
- `FinanceBudget` from `../models/FinanceBudget.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/FinanceBudget.js](../../../server/models/FinanceBudget.js)
- `AccountingPeriod` from `../models/AccountingPeriod.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AccountingPeriod.js](../../../server/models/AccountingPeriod.js)
- `ChartOfAccount` from `../models/ChartOfAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ChartOfAccount.js](../../../server/models/ChartOfAccount.js)
- `JournalEntry` from `../models/JournalEntry.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/JournalEntry.js](../../../server/models/JournalEntry.js)
- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `postFinanceEntry` from `../services/financeLifecycleService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/financeLifecycleService.js](../../../server/services/financeLifecycleService.js)

## Runtime declarations and data flow

### `money` — lines 10–10

Parameters: `n`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `actor` — lines 11–11

Parameters: `req`.
Reads request/component inputs: req.user.

Key statements:

### `currentPeriod` — lines 12–12

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `listAssets` — lines 14–14

Parameters: `req`, `res`, `next`.
Persistent operations detected: FixedAsset.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 14:** `async function listAssets(req, res, next) { try { return res.json({ success: true, data: await FixedAsset.find(mergeTenantFilter(req, {})).sort({ acquisitionDate: -1 }).lean() }); } catch (e) { next(e); } }` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createAsset` — lines 16–26

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. Persistent operations detected: FixedAsset.create, FixedAsset.deleteOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 17:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 18:** `const tenantId = requireTenantId(); const b = req.body || {}; const cost = money(b.acquisitionCost); const residual = money(b.residualValue);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 19:** `if (!b.assetNumber || !b.name || !b.acquisitionDate || cost <= 0 || Number(b.usefulLifeMonths) <= 0 || residual > cost) return res.status(400).json({ success: false, message: "Asset number, name, acquisition date, positi` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 20:** `const data = await FixedAsset.create({ ...b, tenantId, acquisitionCost: cost, residualValue: residual, usefulLifeMonths: Number(b.usefulLifeMonths), createdBy: actor(req) });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 21:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 22:** `const entry = await postFinanceEntry({ tenantId, sourceType: "fixed_asset_acquisition", sourceId: data._id, description: \`Fixed asset acquisition ${data.assetNumber}\`, reference: data.assetNumber, date: data.acquisitio` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 23:** `return res.status(201).json({ success: true, data, entry });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 24:** `} catch (error) { await FixedAsset.deleteOne({ _id: data._id, tenantId }); throw error; }` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `disposeAsset` — lines 28–37

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: FixedAsset.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 29:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 30:** `const tenantId = requireTenantId(); const asset = await FixedAsset.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!asset) return res.status(404).json({ success: false, message: "Fixed asset not found." }); ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 31:** `const proceeds = money(req.body?.proceeds); const date = req.body?.disposalDate || new Date(); const netBook = money(asset.acquisitionCost - asset.accumulatedDepreciation); const gain = money(proceeds - netBook); const l` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 32:** `const lines = [{ code: "1490", debit: money(asset.accumulatedDepreciation), credit: 0, description: "Remove accumulated depreciation" }, { code: "1010", debit: proceeds, credit: 0, description: "Disposal proceeds" }, { c` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 33:** `if (gain > 0) lines.push({ code: "4100", debit: 0, credit: gain, description: "Gain on disposal" }); else if (loss > 0) lines.push({ code: "5200", debit: loss, credit: 0, description: "Loss on disposal" });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 34:** `const entry = await postFinanceEntry({ tenantId, sourceType: "fixed_asset_disposal", sourceId: asset._id, description: \`Fixed asset disposal ${asset.assetNumber}\`, reference: String(req.body?.reference || \`DISP-${asse` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 35:** `asset.status = "disposed"; asset.disposalDate = date; asset.disposalProceeds = proceeds; await asset.save(); return res.json({ success: true, data: asset, entry, gain, loss });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `postAssetDepreciation` — lines 39–49

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: FixedAsset.findOne; verify tenant/ownership filters in the exact query. 4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 40:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 41:** `const tenantId = requireTenantId(); const asset = await FixedAsset.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!asset) return res.status(404).json({ success: false, message: "Fixed asset not found." }); ` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 42:** `const months = Math.max(1, Number(req.body?.months || 1)); const p = String(req.body?.period || currentPeriod()); if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(p)) return res.status(400).json({ success: false, message: "Depreciati` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 43:** `const remaining = Math.max(0, money(asset.acquisitionCost - asset.residualValue - asset.accumulatedDepreciation)); const monthly = money((asset.acquisitionCost - asset.residualValue) / asset.usefulLifeMonths); const amou` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `if (amount <= 0) { asset.status = "fully_depreciated"; await asset.save(); return res.json({ success: true, data: asset, posted: false }); }` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `const sourceId = crypto.createHash("sha256").update(\`${asset._id}:${p}:${months}\`).digest("hex").slice(0, 24); const entry = await postFinanceEntry({ tenantId, sourceType: "fixed_asset_depreciation", sourceId, descript` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 46:** `if (entry) { asset.accumulatedDepreciation = money(Math.min(asset.acquisitionCost - asset.residualValue, asset.accumulatedDepreciation + amount)); if (asset.accumulatedDepreciation >= asset.acquisitionCost - asset.residu` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 47:** `return res.json({ success: true, data: asset, entry });` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `listBudgets` — lines 51–51

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: FinanceBudget.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 51:** `async function listBudgets(req, res, next) { try { const filter = {}; if (req.query.fiscalYear) filter.fiscalYear = Number(req.query.fiscalYear); if (req.query.accountCode) filter.accountCode = String(req.query.accountCo` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `upsertBudget` — lines 52–52

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 52:** `async function upsertBudget(req, res, next) { try { const tenantId = requireTenantId(); const b = req.body || {}; const fiscalYear = Number(b.fiscalYear); const month = b.month == null || b.month === "" ? null : Number(b` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `approveBudget` — lines 53–53

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: FinanceBudget.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 53:** `async function approveBudget(req, res, next) { try { const data = await FinanceBudget.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!data) return res.status(404).json({ success: false, message: "Budget not` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `budgetVsActual` — lines 54–54

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: FinanceBudget.find, ChartOfAccount.find, JournalEntry.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 54:** `async function budgetVsActual(req, res, next) { try { requireTenantId(); const fiscalYear = Number(req.query.fiscalYear || new Date().getFullYear()); const budgets = await FinanceBudget.find(mergeTenantFilter(req, { fisc` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `listPeriods` — lines 55–55

Parameters: `req`, `res`, `next`.
Persistent operations detected: AccountingPeriod.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 55:** `async function listPeriods(req, res, next) { try { return res.json({ success: true, data: await AccountingPeriod.find(mergeTenantFilter(req, {})).sort({ period: -1 }).lean() }); } catch (e) { next(e); } }` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `closePeriod` — lines 56–56

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: AccountingPeriod.findOne, JournalEntry.countDocuments; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 56:** `async function closePeriod(req, res, next) { try { const tenantId = requireTenantId(); const p = String(req.params.period); if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(p)) return res.status(400).json({ success: false, message: "` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `reopenPeriod` — lines 57–57

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: AccountingPeriod.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 57:** `async function reopenPeriod(req, res, next) { try { const data = await AccountingPeriod.findOne(mergeTenantFilter(req, { period: String(req.params.period) })); if (!data) return res.status(404).json({ success: false, mes` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `closeFinancialYear` — lines 59–70

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: AccountingPeriod.find, JournalEntry.findOne, JournalEntry.find, ChartOfAccount.find; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 9 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 60:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 61:** `const tenantId = requireTenantId(); const year = Number(req.params.year); if (!Number.isInteger(year) || year < 2000 || year > 2100) return res.status(400).json({ success: false, message: "A valid fiscal year is required` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 62:** `const periods = await AccountingPeriod.find({ tenantId, period: { $gte: \`${year}-01\`, $lte: \`${year}-12\` } }).lean(); if (periods.some((p) => p.status !== "closed")) return res.status(409).json({ success: false, mess` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 63:** `const already = await JournalEntry.findOne({ tenantId, sourceType: "year_end_close", sourceId: String(year) }).lean(); if (already) return res.status(409).json({ success: false, message: \`Financial year ${year} is alrea` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 64:** `const from = new Date(\`${year}-01-01T00:00:00.000Z\`); const to = new Date(\`${year + 1}-01-01T00:00:00.000Z\`); const entries = await JournalEntry.find({ tenantId, status: "posted", entryDate: { $gte: from, $lt: to } }` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 65:** `const net = money(revenue - expenses); if (Math.abs(net) < 0.01) return res.status(409).json({ success: false, message: "There is no current-year profit or loss to transfer." });` — Builds an HTTP response with an explicit status and JSON payload.
- **Line 66:** `const lines = net > 0 ? [{ code: "3010", debit: net, credit: 0, description: "Transfer prior-year profit to retained earnings" }, { code: "3020", debit: 0, credit: net, description: "Close current-year earnings" }] : [{ ` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 67:** `const entry = await postFinanceEntry({ tenantId, sourceType: "year_end_close", sourceId: String(year), description: \`Year-end close ${year}\`, reference: \`YE-${year}\`, date: to, lines });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 68:** `return res.json({ success: true, data: { year, revenue: money(revenue), expenses: money(expenses), netProfit: net, retainedEarningsEntry: entry } });` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 10: `const money = (n) => Math.round(Number(n || 0) * 100) / 100;`.
- Line 11: `const actor = (req) => req.user?._id || req.user?.id || null;`.
- Line 12: `const currentPeriod = () => new Date().toISOString().slice(0, 7);`.
- Line 18: `const tenantId = requireTenantId(); const b = req.body || {}; const cost = money(b.acquisitionCost); const residual = money(b.residualValue);`.
- Line 20: `const data = await FixedAsset.create({ ...b, tenantId, acquisitionCost: cost, residualValue: residual, usefulLifeMonths: Number(b.usefulLifeMonths), createdBy: actor(req) });`.
- Line 22: `const entry = await postFinanceEntry({ tenantId, sourceType: "fixed_asset_acquisition", sourceId: data._id, description: \`Fixed asset acquisition ${data.assetNumber}\`, reference:`.
- Line 30: `const tenantId = requireTenantId(); const asset = await FixedAsset.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!asset) return res.status(404).json({ success: false`.
- Line 31: `const proceeds = money(req.body?.proceeds); const date = req.body?.disposalDate || new Date(); const netBook = money(asset.acquisitionCost - asset.accumulatedDepreciation); const g`.
- Line 32: `const lines = [{ code: "1490", debit: money(asset.accumulatedDepreciation), credit: 0, description: "Remove accumulated depreciation" }, { code: "1010", debit: proceeds, credit: 0,`.
- Line 34: `const entry = await postFinanceEntry({ tenantId, sourceType: "fixed_asset_disposal", sourceId: asset._id, description: \`Fixed asset disposal ${asset.assetNumber}\`, reference: Str`.
- Line 41: `const tenantId = requireTenantId(); const asset = await FixedAsset.findOne(mergeTenantFilter(req, { _id: req.params.id })); if (!asset) return res.status(404).json({ success: false`.
- Line 42: `const months = Math.max(1, Number(req.body?.months || 1)); const p = String(req.body?.period || currentPeriod()); if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(p)) return res.status(400).jso`.
- Line 43: `const remaining = Math.max(0, money(asset.acquisitionCost - asset.residualValue - asset.accumulatedDepreciation)); const monthly = money((asset.acquisitionCost - asset.residualValu`.
- Line 45: `const sourceId = crypto.createHash("sha256").update(\`${asset._id}:${p}:${months}\`).digest("hex").slice(0, 24); const entry = await postFinanceEntry({ tenantId, sourceType: "fixed`.
- Line 61: `const tenantId = requireTenantId(); const year = Number(req.params.year); if (!Number.isInteger(year) || year < 2000 || year > 2100) return res.status(400).json({ success: false, m`.
- Line 62: `const periods = await AccountingPeriod.find({ tenantId, period: { $gte: \`${year}-01\`, $lte: \`${year}-12\` } }).lean(); if (periods.some((p) => p.status !== "closed")) return res`.
- Line 63: `const already = await JournalEntry.findOne({ tenantId, sourceType: "year_end_close", sourceId: String(year) }).lean(); if (already) return res.status(409).json({ success: false, me`.
- Line 64: `const from = new Date(\`${year}-01-01T00:00:00.000Z\`); const to = new Date(\`${year + 1}-01-01T00:00:00.000Z\`); const entries = await JournalEntry.find({ tenantId, status: "poste`.
- Line 65: `const net = money(revenue - expenses); if (Math.abs(net) < 0.01) return res.status(409).json({ success: false, message: "There is no current-year profit or loss to transfer." });`.
- Line 66: `const lines = net > 0 ? [{ code: "3010", debit: net, credit: 0, description: "Transfer prior-year profit to retained earnings" }, { code: "3020", debit: 0, credit: net, description`.
- Line 67: `const entry = await postFinanceEntry({ tenantId, sourceType: "year_end_close", sourceId: String(year), description: \`Year-end close ${year}\`, reference: \`YE-${year}\`, date: to,`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
