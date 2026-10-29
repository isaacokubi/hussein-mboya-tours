import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const read = (file) => fs.readFileSync(path.resolve(process.cwd(), file), "utf8");

test("Operations Copilot routes are behind authentication, tenant resolution and manager authorization", () => {
  const routes = read("routes/tourManagerRoutes.js");
  const protect = routes.indexOf("router.use(protect);");
  const tenantResolution = routes.indexOf("router.use(resolveTenant);");
  const managerAuthorization = routes.indexOf("router.use(managerOnly);");
  const summaryRoute = routes.indexOf('router.get("/copilot/summary", getOperationsCopilotSummary);');
  const quoteRoute = routes.indexOf('router.post("/copilot/quote-draft", createOperationsQuoteDraft);');

  assert.ok(protect >= 0 && protect < tenantResolution);
  assert.ok(tenantResolution < managerAuthorization);
  assert.ok(managerAuthorization < summaryRoute);
  assert.ok(managerAuthorization < quoteRoute);
});

test("Operations Copilot database reads are tenant-scoped and quote drafts do not persist records", () => {
  const controller = read("controllers/operationsCopilotController.js");

  assert.match(controller, /const tenantId = requireTenantId\(\)/);
  assert.match(controller, /const tourFilter = mergeTenantFilter\(/);
  assert.match(controller, /tenantId: tenantObjectId,[\s\S]*?status: \{ \$nin:/);
  assert.match(controller, /TourCost\.aggregate\(\[[\s\S]*?tenantId: tenantObjectId/);
  assert.match(controller, /OperationalAsset\.find\(\{[\s\S]*?tenantId: tenantObjectId/);
  assert.match(controller, /Tour\.findOne\(mergeTenantFilter\(\{[\s\S]*?_id: tourId/);
  assert.doesNotMatch(controller, /\.(?:create|insertOne|save|updateOne|findOneAndUpdate)\(/);
});
