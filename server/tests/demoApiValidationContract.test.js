import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

test("production demo API validation checks public catalog isolation and cross-tenant bookings", () => {
  assert.match(source, /X-Tenant-Slug/);
  assert.match(source, /\/api\/tours/);
  assert.match(source, /\/api\/destinations/);
  assert.match(source, /foreignBooking/);
  assert.match(source, /new Set\(tenantIds\)/);
});
