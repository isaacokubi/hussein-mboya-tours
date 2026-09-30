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
  for (const slug of ["hussein-mboya", "amani-trails", "demo-safari"]) {
    assert.ok(source.includes(`tenant: "${slug}"`), `missing fixture for ${slug}`);
  }
  for (const key of ["tenantAdminA", "tenantAdminB", "tenantAdminC", "customerA", "customerB", "customerC"]) {
    assert.ok(source.includes(`key: "${key}"`), `missing account ${key}`);
  }
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

test("demo API login batches respect the real limiter window", () => {
  assert.equal(LOGIN_LIMIT, 10);
  assert.equal(LOGIN_WINDOW_MS, 15 * 60 * 1000);
  assert.equal(needsLoginWindowWait(9, 19), false);
  assert.equal(needsLoginWindowWait(10, 19), true);
  assert.equal(needsLoginWindowWait(19, 19), false);
  assert.doesNotMatch(source, /x-forwarded-for/i);
});

test("demo API validation requires a credential-free HTTPS origin and never deletes audit data", () => {
  assert.equal(getSafeDemoApiOrigin(), "https://hussein-mboya-tours.onrender.com");
  assert.equal(getSafeDemoApiOrigin("https://api.example.com/"), "https://api.example.com");
  for (const value of ["http://api.example.com", "https://api.example.com/path", "https://user:pass@api.example.com"]) {
    assert.throws(() => getSafeDemoApiOrigin(value));
  }
  assert.match(source, /DEMO_TEST_PASSWORD/);
  assert.doesNotMatch(source, /x-forwarded-for/i);
  assert.doesNotMatch(source, /\.deleteMany\(/);
  assert.doesNotMatch(source, /testArtifactsRemoved/);
});
