import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

test("finance dashboards use posted accounting revenue rather than completed payments", () => {
  const dashboard = read("controllers/adminDashboardTenantController.js");
  const finance = read("controllers/financeController.js");
  const reporting = read("services/financeReportingService.js");

  assert.match(dashboard, /getPostedRevenueReport/);
  assert.match(dashboard, /revenueBasis: "posted_journals"/);
  assert.match(finance, /getPostedRevenueReport/);
  assert.match(finance, /revenueBasis: "posted_journals"/);
  assert.match(finance, /collectionBasis: "completed_payments"/);
  assert.match(reporting, /status: "posted"/);
  assert.match(reporting, /"account\.type": "revenue"/);
  assert.match(reporting, /ChartOfAccount\.collection\.name/);
  assert.doesNotMatch(dashboard, /Payment\.aggregate\(\[\{ \$match: paymentsFilter/);
});

test("revenue and collections remain separate reporting concepts", () => {
  const finance = read("controllers/financeController.js");
  assert.match(finance, /collections/);
  assert.match(finance, /netCollections/);
  assert.match(finance, /netRevenue: revenue/);
});
