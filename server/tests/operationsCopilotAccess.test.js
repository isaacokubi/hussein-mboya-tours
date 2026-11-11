/**
 * Purpose: operations Copilot Access.test automated test. Main declarations: read.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";

// Declare read for use by the surrounding module or function.
const read = (file) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

// Perform the side effect or state update expressed on the following line.
test("Operations Copilot routes are behind authentication, tenant resolution and manager authorization", () => {
  // Declare routes for use by the surrounding module or function.
  const routes = read("routes/tourManagerRoutes.js");
  // Declare protect for use by the surrounding module or function.
  const protect = routes.indexOf("router.use(protect);");
  // Declare tenantResolution for use by the surrounding module or function.
  const tenantResolution = routes.indexOf("router.use(resolveTenant);");
  // Declare managerAuthorization for use by the surrounding module or function.
  const managerAuthorization = routes.indexOf("router.use(managerOnly);");
  // Declare summaryRoute for use by the surrounding module or function.
  const summaryRoute = routes.indexOf('router.get("/copilot/summary", getOperationsCopilotSummary);');
  // Declare quoteRoute for use by the surrounding module or function.
  const quoteRoute = routes.indexOf('router.post("/copilot/quote-draft", createOperationsQuoteDraft);');

  // Perform the side effect or state update expressed on the following line.
  assert.ok(protect >= 0 && protect < tenantResolution);
  // Perform the side effect or state update expressed on the following line.
  assert.ok(tenantResolution < managerAuthorization);
  // Perform the side effect or state update expressed on the following line.
  assert.ok(managerAuthorization < summaryRoute);
  // Perform the side effect or state update expressed on the following line.
  assert.ok(managerAuthorization < quoteRoute);
});

// Perform the side effect or state update expressed on the following line.
test("Operations Copilot database reads are tenant-scoped and quote drafts do not persist records", () => {
  // Declare controller for use by the surrounding module or function.
  const controller = read("controllers/operationsCopilotController.js");

  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /const tenantId = requireTenantId\(\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /const tourFilter = mergeTenantFilter\(/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /tenantId: tenantObjectId,[\s\S]*?status: \{ \$nin:/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /TourCost\.aggregate\(\[[\s\S]*?tenantId: tenantObjectId/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /OperationalAsset\.find\(\{[\s\S]*?tenantId: tenantObjectId/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /Tour\.findOne\(mergeTenantFilter\(\{[\s\S]*?_id: tourId/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(controller, /\.(?:create|insertOne|save|updateOne|findOneAndUpdate)\(/);
});
