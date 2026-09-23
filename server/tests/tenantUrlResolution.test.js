import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { isTenantSubdomainHost } from "../utils/tenantHost.js";

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

test("tenant subdomain matching distinguishes tenant hosts from platform hosts", () => {
  assert.equal(isTenantSubdomainHost("safari.globaltours.com", "globaltours.com"), true);
  assert.equal(isTenantSubdomainHost("api.globaltours.com", "globaltours.com"), false);
  assert.equal(isTenantSubdomainHost("www.globaltours.com", "globaltours.com"), false);
  assert.equal(isTenantSubdomainHost("globaltours.com", "globaltours.com"), false);
  assert.equal(isTenantSubdomainHost("safari.preview.globaltours.com", "globaltours.com"), false);
  assert.equal(isTenantSubdomainHost("safari.other.test", "globaltours.com"), false);
});

test("unresolved explicit tenant selectors are rejected before default tenant fallback", () => {
  const source = read("middleware/tenantMiddleware.js");
  const environment = read("config/env.js");
  const rejectUnknownTenant = source.indexOf("explicitTenantRequested || tenantHostRequested || customOriginRequested");
  const defaultFallback = source.indexOf("const fallbackSlug =");
  assert.ok(rejectUnknownTenant >= 0, "unknown tenant signals must be detected");
  assert.ok(defaultFallback > rejectUnknownTenant, "unknown tenant requests cannot reach the default tenant fallback");
  assert.match(source, /res\.status\(404\)\.json\(\{ success: false, message: "Tenant not found\." \}\)/);
  assert.match(environment, /if \(isProduction\) \{[\s\S]*?for \(const key of \["ALLOW_SINGLE_TENANT_DEV_FALLBACK"/);
  assert.match(environment, /if \(truthy\(process\.env\[key\]\)\) throw new Error/);
});

test("tenant websites and registered website integrations are considered by CORS", () => {
  const source = read("app.js");
  assert.match(source, /Organization\.findOne\(\{ slug:/);
  assert.match(source, /Organization\.findOne\(\{ domain:/);
  assert.match(source, /WebsiteIntegrationKey\.findOne\([\s\S]*?allowedOrigins: normalizedOrigin/);
  assert.match(source, /NODE_ENV === "production" && parsedOrigin\.protocol !== "https:"/);
});

test("raw collection reads in tenant booking administration are tenant-scoped", () => {
  const source = read("controllers/tenantBookingAdminController.js");
  assert.equal((source.match(/\.collection\.find\(/g) || []).length, 3);
  assert.match(source, /\{ _id: \{ \$in: validIds \}, tenantId: new mongoose\.Types\.ObjectId\(tenantId\) \}/);
  assert.equal((source.match(/email: \{ \$in: normalized \}, tenantId: new mongoose\.Types\.ObjectId\(tenantId\)/g) || []).length, 2);
});
