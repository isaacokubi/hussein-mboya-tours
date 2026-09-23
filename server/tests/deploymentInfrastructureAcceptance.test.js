import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("production smoke workflow exists and is fail-closed when secrets are absent", () => {
  const workflow = read(".github/workflows/production-smoke.yml");
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /PRODUCTION_API_URL/);
  assert.match(workflow, /PRODUCTION_WEB_URL/);
  assert.match(workflow, /if \[ -z "${PRODUCTION_API_URL:-}" \]/);
  assert.match(workflow, /if \[ -z "${PRODUCTION_WEB_URL:-}" \]/);
});

test("production smoke validates API health and public HTML", () => {
  const workflow = read(".github/workflows/production-smoke.yml");
  assert.match(workflow, /\/api\/health/);
  assert.match(workflow, /success\") is not True/);
  assert.match(workflow, /status\") != "healthy"/);
  assert.match(workflow, /database\") != "connected"/);
  assert.match(workflow, /grep -Fq 'Travel API running successfully'/);
  assert.match(workflow, /HTTP\/\[0-9.\]+ 2\[0-9\]\[0-9\]/);
  assert.match(workflow, /grep -Eiq '<html|<!doctype html'/);
});

test("deployment controls keep development fallbacks disabled", () => {
  const env = read("server/.env.example");
  assert.match(env, /^ALLOW_SINGLE_TENANT_DEV_FALLBACK=false$/m);
  assert.match(env, /^ALLOW_GLOBAL_MPESA_FALLBACK=false$/m);
  assert.match(env, /^MFA_DEV_MODE=false$/m);
});

test("production smoke contract requires the six external evidence controls", () => {
  const checklist = read("docs/PRODUCTION_GO_LIVE_CHECKLIST.md");
  for (const flag of [
    "PRODUCTION_BACKUP_VERIFIED",
    "PRODUCTION_MONITORING_VERIFIED",
    "PRODUCTION_PAYMENT_VERIFIED",
    "PRODUCTION_ETIMS_VERIFIED",
    "PRODUCTION_RESTORE_TESTED",
    "PRODUCTION_WEBHOOKS_VERIFIED",
  ]) {
    assert.match(checklist, new RegExp(flag));
  }
  assert.match(checklist, /Do not mark an evidence flag true unless the corresponding external test was actually completed/);
});
