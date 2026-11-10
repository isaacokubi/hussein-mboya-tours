# Source explanation: server/controllers/agentCustomerController.js

**Source:** [server/controllers/agentCustomerController.js](../../../server/controllers/agentCustomerController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)

## Runtime declarations and data flow

### `isValidId` — lines 7–7

Parameters: `id`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `getAgentProfile` — lines 29–32

Parameters: `req`.
Reads request/component inputs: req.user. Persistent operations detected: Agent.findOne; verify tenant/ownership filters in the exact query.

Key statements:
- **Line 30:** `Agent.findOne({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.

### `normalizeCustomerInput` — lines 34–60

Parameters: `body (defaulted)`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 35:** `const data = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 37:** `for (const field of allowedCustomerFields) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 38:** `if (body[field] !== undefined) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 45:** `if (body.name && (!data.firstName || !data.lastName)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 46:** `const parts = String(body.name).trim().split(/\s+/);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `if (data.email) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 55:** `if (data.phone) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 59:** `return data;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `createCustomer` — lines 68–128

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user. Persistent operations detected: Customer.findOne, Customer.create; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 70:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 71:** `const agent = await getAgentProfile(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 73:** `if (!agent) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 74:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 80:** `const customerData = normalizeCustomerInput(req.body);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 82:** `if (!customerData.firstName || !customerData.lastName) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 83:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 89:** `if (!customerData.phone) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 90:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 96:** `if (customerData.email) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 97:** `const existing = await Customer.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 105:** `if (existing) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 106:** `return res.status(409).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 113:** `const customer = await Customer.create({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 120:** `return res.status(201).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getCustomers` — lines 136–195

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Customer.find, Customer.countDocuments; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 138:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 139:** `const agent = await getAgentProfile(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 141:** `if (!agent) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 142:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 148:** `const page = Math.max(Number(req.query.page) || 1, 1);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 149:** `const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 150:** `const skip = (page - 1) * limit;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 152:** `const filter = mergeTenantFilter({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 157:** `if (req.query.status) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 161:** `if (req.query.search) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 162:** `const search = String(req.query.search).trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 164:** `if (search) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 174:** `const [customers, total] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 175:** `Customer.find(filter)` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 180:** `Customer.countDocuments(filter),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 183:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getCustomer` — lines 203–244

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params. Persistent operations detected: Customer.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 205:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 206:** `if (!isValidId(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 207:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 213:** `const agent = await getAgentProfile(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 215:** `if (!agent) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 216:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 222:** `const customer = await Customer.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 230:** `if (!customer) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 231:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 237:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `updateCustomer` — lines 252–301

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body, req.user. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 253:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 254:** `if (!isValidId(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 255:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 261:** `const agent = await getAgentProfile(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 263:** `if (!agent) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 264:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 270:** `const update = normalizeCustomerInput(req.body);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 273:** `const customer = await Customer.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 286:** `if (!customer) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 287:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 293:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `deleteCustomer` — lines 309–357

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 310:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 311:** `if (!isValidId(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 312:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 318:** `const agent = await getAgentProfile(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 320:** `if (!agent) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 321:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 327:** `const customer = await Customer.findOneAndUpdate(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 343:** `if (!customer) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 344:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 350:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getCustomerStats` — lines 365–403

Parameters: `req`, `res`, `next`.
Persistent operations detected: Customer.countDocuments; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 366:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 367:** `const agent = await getAgentProfile(req);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 369:** `if (!agent) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 370:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 376:** `const [total, active, vip, deleted] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 377:** `Customer.countDocuments({ agent: agent._id, isDeleted: false }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 378:** `Customer.countDocuments({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 383:** `Customer.countDocuments({` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 388:** `Customer.countDocuments({ agent: agent._id, isDeleted: true }),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 391:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 7: `const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);`.
- Line 9: `const allowedCustomerFields = [`.
- Line 29: `const getAgentProfile = async (req) =>`.
- Line 34: `const normalizeCustomerInput = (body = {}) => {`.
- Line 35: `const data = {};`.
- Line 46: `const parts = String(body.name).trim().split(/\s+/);`.
- Line 68: `export const createCustomer = async (req, res, next) => {`.
- Line 71: `const agent = await getAgentProfile(req);`.
- Line 80: `const customerData = normalizeCustomerInput(req.body);`.
- Line 97: `const existing = await Customer.findOne(`.
- Line 113: `const customer = await Customer.create({`.
- Line 136: `export const getCustomers = async (req, res, next) => {`.
- Line 139: `const agent = await getAgentProfile(req);`.
- Line 148: `const page = Math.max(Number(req.query.page) || 1, 1);`.
- Line 149: `const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);`.
- Line 150: `const skip = (page - 1) * limit;`.
- Line 152: `const filter = mergeTenantFilter({`.
- Line 162: `const search = String(req.query.search).trim();`.
- Line 174: `const [customers, total] = await Promise.all([`.
- Line 203: `export const getCustomer = async (req, res, next) => {`.
- Line 213: `const agent = await getAgentProfile(req);`.
- Line 222: `const customer = await Customer.findOne(`.
- Line 252: `export const updateCustomer = async (req, res, next) => {`.
- Line 261: `const agent = await getAgentProfile(req);`.
- Line 270: `const update = normalizeCustomerInput(req.body);`.
- Line 273: `const customer = await Customer.findOneAndUpdate(`.
- Line 309: `export const deleteCustomer = async (req, res, next) => {`.
- Line 318: `const agent = await getAgentProfile(req);`.
- Line 327: `const customer = await Customer.findOneAndUpdate(`.
- Line 365: `export const getCustomerStats = async (req, res, next) => {`.
- Line 367: `const agent = await getAgentProfile(req);`.
- Line 376: `const [total, active, vip, deleted] = await Promise.all([`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
