/**
 * Purpose: demo Api Validation Contract.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:url so this module can use its exported dependencies.
import { fileURLToPath } from "node:url";
// Load ../scripts/demoApiValidationSafety.js so this module can use its exported dependencies.
import { getSafeDemoApiOrigin, LOGIN_LIMIT, LOGIN_WINDOW_MS, needsLoginWindowWait } from "../scripts/demoApiValidationSafety.js";

// Declare source for use by the surrounding module or function.
const source = fs.readFileSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../scripts/verifyDemoApi.js"),
  "utf8",
);

// Perform the side effect or state update expressed on the following line.
test("production demo API validation uses login response roles and fixtures for all tenants", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /TEST_LOGIN_EMAILS/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /const customerAccounts = logins\.filter/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /local\.startsWith\("guide"\)\) return "tour_guide"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /assert\.equal\(logins\.length, 37/);
  // Repeat the enclosed work for each required iteration.
  for (const slug of ["hussein-mboya", "amani-trails", "demo-safari"]) {
    // Perform the side effect or state update expressed on the following line.
    assert.ok(source.includes(`"${slug}"`), `missing tenant mapping for ${slug}`);
  }
  // Repeat the enclosed work for each required iteration.
  for (const key of ["tenantAdminA", "tenantAdminB", "tenantAdminC"]) {
    // Perform the side effect or state update expressed on the following line.
    assert.ok(source.includes(`"${key}"`), `missing account ${key}`);
  }
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /all 12 tenant customers have seeded bookings/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /foreignBookings/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /candidate\.tenant\)\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /candidate\.role !== "super_admin" && candidate\.role !== "admin"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /platformTenantManagementStatus/);
});

// Perform the side effect or state update expressed on the following line.
test("demo API request headers use a defined static validator user agent", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /const userAgent = "HusseinMboyaDemoApiValidator\/1\.0";/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /"user-agent": userAgent/);
});

// Perform the side effect or state update expressed on the following line.
test("production demo API validation checks public catalog isolation and cross-tenant bookings", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /X-Tenant-Slug/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /\/api\/tours/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /\/api\/destinations/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /foreignBooking/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /new Set\(tenantIds\)/);
});

// Perform the side effect or state update expressed on the following line.
test("demo API dashboard expectations follow each tenant's server-reported plan entitlements", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /request\("\/api\/subscription"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /features\.includes\("finance"\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /dashboardFeatureFor/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /expectedStatus = planFeatureLocked \? 403 : 200/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /return "operations"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /return "agents"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /return "fleet"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /PLAN_FEATURE_LOCKED/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /finance feature is not included in the tenant plan/);
});

// Perform the side effect or state update expressed on the following line.
test("demo API login batches respect the real limiter window", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(LOGIN_LIMIT, 10);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(LOGIN_WINDOW_MS, 15 * 60 * 1000);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(needsLoginWindowWait(9, 37), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(needsLoginWindowWait(10, 37), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(needsLoginWindowWait(20, 37), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(needsLoginWindowWait(36, 37), false);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(source, /x-forwarded-for/i);
});

// Perform the side effect or state update expressed on the following line.
test("demo API validation requires a credential-free HTTPS origin and never deletes audit data", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getSafeDemoApiOrigin(), "https://hussein-mboya-tours.onrender.com");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(getSafeDemoApiOrigin("https://api.example.com/"), "https://api.example.com");
  // Repeat the enclosed work for each required iteration.
  for (const value of ["http://api.example.com", "https://api.example.com/path", "https://user:pass@api.example.com"]) {
    // Perform the side effect or state update expressed on the following line.
    assert.throws(() => getSafeDemoApiOrigin(value));
  }
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /DEMO_TEST_PASSWORD/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /DEMO_SMOKE_PASSWORD/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(source, /x-forwarded-for/i);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(source, /\.deleteMany\(/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(source, /testArtifactsRemoved/);
});
