/**
 * Purpose: finance Revenue Basis Contract.test automated test. Main declarations: read.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";

// Declare read for use by the surrounding module or function.
const read = (file) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

// Perform the side effect or state update expressed on the following line.
test("finance dashboards use posted accounting revenue rather than completed payments", () => {
  // Declare dashboard for use by the surrounding module or function.
  const dashboard = read("controllers/adminDashboardTenantController.js");
  // Declare finance for use by the surrounding module or function.
  const finance = read("controllers/financeController.js");
  // Declare reporting for use by the surrounding module or function.
  const reporting = read("services/financeReportingService.js");

  // Perform the side effect or state update expressed on the following line.
  assert.match(dashboard, /getPostedRevenueReport/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(dashboard, /revenueBasis: "posted_journals"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(finance, /getPostedRevenueReport/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(finance, /revenueBasis: "posted_journals"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(finance, /collectionBasis: "completed_payments"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(reporting, /status: "posted"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(reporting, /"account\.type": "revenue"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(reporting, /ChartOfAccount\.collection\.name/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(dashboard, /Payment\.aggregate\(\[\{ \$match: paymentsFilter/);
});

// Perform the side effect or state update expressed on the following line.
test("revenue and collections remain separate reporting concepts", () => {
  // Declare finance for use by the surrounding module or function.
  const finance = read("controllers/financeController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(finance, /collections/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(finance, /netCollections/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(finance, /netRevenue: revenue/);
});
