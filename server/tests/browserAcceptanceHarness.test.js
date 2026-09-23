import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "..");
const client = path.join(root, "client");
const workflow = path.join(root, ".github", "workflows", "browser-acceptance.yml");

test("browser acceptance harness exists", () => {
  assert.equal(fs.existsSync(path.join(client, "playwright.config.js")), true);
  assert.equal(fs.existsSync(path.join(client, "e2e", "publicAcceptance.spec.js")), true);
});

test("browser acceptance covers desktop and mobile projects", () => {
  const source = fs.readFileSync(path.join(client, "playwright.config.js"), "utf8");
  assert.match(source, /Desktop Chrome/);
  assert.match(source, /Pixel 5/);
  assert.match(source, /BROWSER_ACCEPTANCE_BASE_URL/);
});

test("browser acceptance covers public, protected and form flows", () => {
  const source = fs.readFileSync(path.join(client, "e2e", "publicAcceptance.spec.js"), "utf8");
  for (const marker of [
    '"/tours"',
    '"/destinations"',
    '"/airport-transfers"',
    '"/hotels"',
    '"/login"',
    '"/register"',
    '"/forgot-password"',
    '"/dashboard"',
    '"/my-bookings"',
    "empty submission",
  ]) assert.ok(source.includes(marker), marker);
});

test("browser acceptance workflow is environment-gated and does not embed credentials", () => {
  assert.equal(fs.existsSync(workflow), true);
  const source = fs.readFileSync(workflow, "utf8");
  assert.match(source, /BROWSER_ACCEPTANCE_BASE_URL/);
  assert.match(source, /if: steps\.target\.outputs\.configured == 'true'/);
  assert.match(source, /playwright/);
  assert.match(source, /install --with-deps/);
  assert.doesNotMatch(source, /password:\s*[^$]/i);
  assert.doesNotMatch(source, /secret:\s*[^$]/i);
});

test("browser acceptance does not falsely certify production evidence", () => {
  const checklist = fs.readFileSync(path.join(root, "docs", "PRODUCTION_GO_LIVE_CHECKLIST.md"), "utf8");
  assert.match(checklist, /browser acceptance/i);
  assert.match(checklist, /Do not mark an evidence flag true unless the corresponding external test was actually completed/);
});
