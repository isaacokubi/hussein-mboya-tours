# Agent quotation API contracts

## Mounts and authorization precedence

Quotation routes are mounted at `/api/agents/quotes` and `/api/agent/quotes`; `agentRoutes.js` is mounted at both broad prefixes before `quotationRoutes.js`. The broad router registers only `GET /quotes`, so GET collection requests are intercepted first by `agentController.getAgentQuotations` (which delegates to the same imported `quotationController.getAgentQuotations` handler) and requires `requireApprovedAgent`. The later quotation router's GET collection declaration is shadowed for the exact same URLs. The broad router has no POST or quote `/:id` routes, so those continue to `quotationRoutes.js`, whose shared chain is `resolveTenant` → `protect` and does not require Agent approval. Controllers find a tenant-scoped Agent by authenticated User ID; no branch authorization. These paths are plural/singular aliases.

## POST `/api/agents/quotes` and `/api/agent/quotes` (entries 367–368)

JSON body: required truthy `customer`, `tourPackage`, and nonempty `items` array; optional `discount` (default 0), `taxRate` (default 0), `notes` (default empty string), `validUntil` (required by schema despite no controller precheck). The controller calculates totals from each item's `quantity` and `unitPrice`, then creates a draft Quotation associated with current Agent/customer/package. Calculator rejects non-array items and non-finite/negative quantity or unit price, but permits zero quantity; schema requires item quantity >=1, required name and total, so malformed/missing item fields fail at Mongoose validation. It does not verify that customer or package belongs to the same Agent or is active before create; Mongoose refs alone do not ensure ownership. It does not assign computed `total` on each item, so client must provide required item `total` consistent with values or schema validation can reject it. Negative tax rate can yield negative tax and fail schema min validation. There is no explicit discount cap, tax bounds, validity date check, or idempotency key.

Success 201 `{success:true,message:"Quotation created successfully.",quotation}` with customer/tourPackage populated summary fields. Missing Agent returns 404; missing required top-level inputs 400; calculator/Mongoose/database errors go to centralized error handling after console logging. No payment or booking is created. Client `createQuotation` in `client/src/api/quotationApi.js`; quote creation is invoked from AgentQuotes UI. Pending Agent status is not blocked by this direct route chain.

## GET `/api/agents/quotes` and `/api/agent/quotes` (entries 145–146, 369–370)

No query/body fields. Effective broad-router chain requires approved and active Agent, then handler resolves Agent by User and tenant. Missing profile returns 404. Finds all tenant-visible quotations for Agent, populates customer name/email/phone and package title/destination/price, sorts newest first (no pagination), returns 200 `{success:true,count,quotations}`. Read-only. Errors are logged and forwarded. Frontend `getAgentQuotations` calls singular alias.

## GET `/api/agents/quotes/:id` and singular alias (entries 371–372)

No ObjectId validation is explicit. Finds a quotation by `id` and current Agent with tenant filter; populates full customer and tour package. Missing Agent or quotation returns 404. Success 200 `{success:true,quotation}`. Invalid cast/database errors are forwarded, typically through Mongoose error handling. No branch restriction or mutation.

## PATCH `/api/agents/quotes/:id/status` and singular alias (entries 373–374)

JSON body requires `status` in `draft`, `sent`, `approved`, `rejected`, or `expired`; invalid/missing value returns 400. The schema also permits `converted`, but this endpoint rejects it. It tenant/Agent-scopes `findOneAndUpdate`, uses `new:true, runValidators:true`, populates customer and package summary, and returns 200 `{success:true,message,quotation}`. Missing Agent or owned quotation returns 404. It directly sets status without transition constraints and does not update `sentAt`/`approvedAt`, send communications, expire quotations, or create a booking. Errors are logged and forwarded.

## Pricing and schema caveats

`calculateQuotation` rounds subtotal, discount, tax, and grandTotal to two decimals. Subtotal is sum(quantity × unitPrice); taxable base is `max(subtotal-discount,0)`; tax is taxable base × taxRate/100; grand total is taxable base + tax. The output also includes totalItems. Because item totals are not recomputed, persisted line totals may disagree with computed quotation totals. Quotation schema has unique indexed `quotationNumber` generated on save from current time plus random suffix; collision remains possible. Mongoose references do not enforce foreign-key ownership or existence.

Source/test references: `server/routes/index.js`, `server/routes/agentRoutes.js`, `server/routes/quotationRoutes.js`, `server/controllers/quotationController.js`, `server/controllers/agentController.js`, `server/services/quotationCalculator.js`, `server/models/Quotation.js`, `client/src/api/quotationApi.js`, `client/src/pages/agent/AgentQuotes.jsx`. No focused quotation controller test was found in `server/tests`; the contract is source-reviewed, not live executed.
