import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

test("accounting revenue aggregation is restricted to the active tenant", () => {
  const reporting = read("services/financeReportingService.js");
  assert.match(reporting, /requireTenantId\(\)/);
  assert.match(reporting, /new mongoose\.Types\.ObjectId/);
  assert.match(reporting, /\$match: revenueMatch\(\{ from, to \}, tenantId\)/);
  assert.match(reporting, /"account\.tenantId": tenantId/);
});

test("historical customer aggregation is restricted to the active tenant", () => {
  const metrics = read("services/historicalCustomerMetrics.js");
  assert.match(metrics, /requireTenantId\(\)/);
  assert.match(metrics, /new mongoose\.Types\.ObjectId/);
  assert.match(metrics, /tenantId,/);
  assert.match(metrics, /\$match: match/);
});
