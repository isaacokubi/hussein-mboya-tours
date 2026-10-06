import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getSafeDemoApiOrigin, LOGIN_LIMIT, LOGIN_WINDOW_MS, needsLoginWindowWait } from "../scripts/demoApiValidationSafety.js";

const source = fs.readFileSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../scripts/verifyDemoApi.js"),
  "utf8",
);

test("production demo API validation uses login response roles and fixtures for all tenants", () => {
  assert.match(source, /guideA[^\n]+role: "guide"/);
  assert.match(source, /const customerAccounts = \[/);
  assert.match(source, /Array\.from\(\{ length: 4 \}/);
  assert.match(source, /\.\.\.customerAccounts/);
  assert.match(source, /assert\.equal\(logins\.length, 28/);
  for (const slug of ["hussein-mboya", "amani-trails", "demo-safari"]) {
    assert.ok(source.includes(`tenant: "${slug}"`), `missing fixture for ${slug}`);
  }
  for (const key of ["tenantAdminA", "tenantAdminB", "tenantAdminC"]) {
    assert.ok(source.includes(`key: "${key}"`), `missing account ${key}`);
  }
  assert.match(source, /all 12 tenant customers have seeded bookings/);
  assert.match(source, /foreignBookings/);
  assert.match(source, /candidate\.tenant\)\)/);
  assert.match(source, /candidate\.role !== "super_admin" && candidate\.role !== "admin"/);
  assert.match(source, /platformTenantManagementStatus/);
});

test("demo API request headers use a defined static validator user agent", () => {
  assert.match(source, /const userAgent = "HusseinMboyaDemoApiValidator\/1\.0";/);
  assert.match(source, /"user-agent": userAgent/);
});

test("production demo API validation checks public catalog isolation and cross-tenant bookings", () => {
  assert.match(source, /X-Tenant-Slug/);
  assert.match(source, /\/api\/tours/);
  assert.match(source, /\/api\/destinations/);
  assert.match(source, /foreignBooking/);
  assert.match(source, /new Set\(tenantIds\)/);
});

test("demo API finance dashboard expectations follow each tenant's server-reported plan entitlements", () => {
  assert.match(source, /request\("\/api\/subscription"/);
  assert.match(source, /features\.includes\("finance"\)/);
  assert.match(source, /expectedStatus = financeFeatureLocked \? 403 : 200/);
  assert.match(source, /PLAN_FEATURE_LOCKED/);
  assert.match(source, /finance feature is not included in the tenant plan/);
});

test("demo API login batches respect the real limiter window", () => {
  assert.equal(LOGIN_LIMIT, 10);
  assert.equal(LOGIN_WINDOW_MS, 15 * 60 * 1000);
  assert.equal(needsLoginWindowWait(9, 28), false);
  assert.equal(needsLoginWindowWait(10, 28), true);
  assert.equal(needsLoginWindowWait(20, 28), true);
  assert.equal(needsLoginWindowWait(27, 28), false);
  assert.doesNotMatch(source, /x-forwarded-for/i);
});

test("demo API validation requires a credential-free HTTPS origin and never deletes audit data", () => {
  assert.equal(getSafeDemoApiOrigin(), "https://hussein-mboya-tours.onrender.com");
  assert.equal(getSafeDemoApiOrigin("https://api.example.com/"), "https://api.example.com");
  for (const value of ["http://api.example.com", "https://api.example.com/path", "https://user:pass@api.example.com"]) {
    assert.throws(() => getSafeDemoApiOrigin(value));
  }
  assert.match(source, /DEMO_TEST_PASSWORD/);
  assert.match(source, /DEMO_SMOKE_PASSWORD/);
  assert.doesNotMatch(source, /x-forwarded-for/i);
  assert.doesNotMatch(source, /\.deleteMany\(/);
  assert.doesNotMatch(source, /testArtifactsRemoved/);
});
