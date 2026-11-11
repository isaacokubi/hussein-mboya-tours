/**
 * Purpose: tenant Dashboard Data Isolation.test automated test. Main declarations: read.
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
test("accounting revenue aggregation is restricted to the active tenant", () => {
  // Declare reporting for use by the surrounding module or function.
  const reporting = read("services/financeReportingService.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(reporting, /requireTenantId\(\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(reporting, /new mongoose\.Types\.ObjectId/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(reporting, /\$match: revenueMatch\(\{ from, to \}, tenantId\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(reporting, /"account\.tenantId": tenantId/);
});

// Perform the side effect or state update expressed on the following line.
test("historical customer aggregation is restricted to the active tenant", () => {
  // Declare metrics for use by the surrounding module or function.
  const metrics = read("services/historicalCustomerMetrics.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(metrics, /requireTenantId\(\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(metrics, /new mongoose\.Types\.ObjectId/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(metrics, /tenantId,/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(metrics, /\$match: match/);
});
