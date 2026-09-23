import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "..");
const client = path.join(root, "client");
const workflow = path.join(root, ".github", "workflows", "browser-acceptance.yml");
const spec = path.join(client, "e2e", "authenticatedRoleAcceptance.spec.js");

test("authenticated browser acceptance harness exists", () => {
  assert.equal(fs.existsSync(spec), true);
  assert.equal(fs.existsSync(workflow), true);
});

test("authenticated acceptance requires all approved personas without embedding credentials", () => {
  const source = fs.readFileSync(spec, "utf8");
  for (const persona of ["customer", "admin", "finance", "tour_manager", "guide", "driver", "super_admin"]) {
    assert.match(source, new RegExp(`["']${persona}["']`), persona);
  }
  assert.match(source, /BROWSER_ACCEPTANCE_ROLE_USERS_JSON/);
  assert.doesNotMatch(source, /password\s*[:=]\s*["'][^$]/i);
  assert.doesNotMatch(source, /@example\.com/i);
});

test("workflow gates authenticated tests on an explicit secret", () => {
  const source = fs.readFileSync(workflow, "utf8");
  assert.match(source, /BROWSER_ACCEPTANCE_ROLE_USERS_JSON/);
  assert.match(source, /authenticated/);
  assert.match(source, /steps\.target\.outputs\.configured == 'true'/);
  assert.match(source, /playwright test/);
});

test("production documentation keeps authenticated acceptance as external evidence", () => {
  const checklist = fs.readFileSync(path.join(root, "docs", "PRODUCTION_GO_LIVE_CHECKLIST.md"), "utf8");
  assert.match(checklist, /authenticated role/i);
  assert.match(checklist, /test accounts/i);
});
