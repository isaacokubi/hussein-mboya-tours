import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("production monitoring workflow enforces HTTPS endpoints and latency budgets", () => {
  const workflow = read(".github/workflows/production-monitoring.yml");

  assert.match(workflow, /schedule:\s*\n\s*- cron: "\*\/15 \* \* \* \*"/);
  assert.match(workflow, /PRODUCTION_API_URL: \$\{\{ secrets\.PRODUCTION_API_URL \}\}/);
  assert.match(workflow, /PRODUCTION_WEB_URL: \$\{\{ secrets\.PRODUCTION_WEB_URL \}\}/);
  assert.match(workflow, /PRODUCTION_API_MAX_LATENCY_MS/);
  assert.match(workflow, /PRODUCTION_WEB_MAX_LATENCY_MS/);
  assert.match(workflow, /PRODUCTION_API_URL must use HTTPS/);
  assert.match(workflow, /PRODUCTION_WEB_URL must use HTTPS/);
  assert.match(workflow, /Production API latency .* exceeded/);
  assert.match(workflow, /Production website latency .* exceeded/);
});

test("production monitoring has an explicit alert-delivery drill", () => {
  const workflow = read(".github/workflows/production-monitoring.yml");

  assert.match(workflow, /simulate_failure:/);
  assert.match(workflow, /Verify alert path/);
  assert.match(workflow, /actions\/github-script@v7/);
  assert.match(workflow, /issues\.write/);
  assert.match(workflow, /Production monitoring alert/);
  assert.match(workflow, /if: \$\{\{ failure\(\) \}\}/);
});

test("production monitoring docs keep external evidence separate from source contracts", () => {
  const checklist = read("docs/PRODUCTION_GO_LIVE_CHECKLIST.md");
  const queue = read("docs/STORED_TEST_EXECUTION_QUEUE.md");

  assert.match(checklist, /PRODUCTION_MONITORING_VERIFIED=true/);
  assert.match(checklist, /Do not mark an evidence flag true unless the corresponding external test was actually completed/);
  assert.match(queue, /Phase 13/);
  assert.match(queue, /tests\/productionMonitoringAcceptance\.test\.js/);
  assert.match(queue, /simulate_failure/);
});
