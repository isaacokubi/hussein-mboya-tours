/**
 * Purpose: tenant Url Resolution.test automated test. Main declarations: read.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../utils/tenantHost.js so this module can use its exported dependencies.
import { isTenantSubdomainHost } from "../utils/tenantHost.js";

// Declare read for use by the surrounding module or function.
const read = (file) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

// Perform the side effect or state update expressed on the following line.
test("tenant subdomain matching distinguishes tenant hosts from platform hosts", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantSubdomainHost("safari.globaltours.com", "globaltours.com"), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantSubdomainHost("api.globaltours.com", "globaltours.com"), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantSubdomainHost("www.globaltours.com", "globaltours.com"), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantSubdomainHost("globaltours.com", "globaltours.com"), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantSubdomainHost("safari.preview.globaltours.com", "globaltours.com"), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isTenantSubdomainHost("safari.other.test", "globaltours.com"), false);
});

// Perform the side effect or state update expressed on the following line.
test("unresolved explicit tenant selectors are rejected before default tenant fallback", () => {
  // Declare source for use by the surrounding module or function.
  const source = read("middleware/tenantMiddleware.js");
  // Declare environment for use by the surrounding module or function.
  const environment = read("config/env.js");
  // Declare rejectUnknownTenant for use by the surrounding module or function.
  const rejectUnknownTenant = source.indexOf("explicitTenantRequested || tenantHostRequested || customOriginRequested");
  // Declare defaultFallback for use by the surrounding module or function.
  const defaultFallback = source.indexOf("const fallbackSlug =");
  // Perform the side effect or state update expressed on the following line.
  assert.ok(rejectUnknownTenant >= 0, "unknown tenant signals must be detected");
  // Perform the side effect or state update expressed on the following line.
  assert.ok(defaultFallback > rejectUnknownTenant, "unknown tenant requests cannot reach the default tenant fallback");
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /!isLoginRequest\(req\) && fallbackSlug/, "default public tenant cannot set login context");
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /res\.status\(404\)\.json\(\{ success: false, message: "Tenant not found\." \}\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(environment, /if \(isProduction\) \{[\s\S]*?for \(const key of \["ALLOW_SINGLE_TENANT_DEV_FALLBACK"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(environment, /if \(truthy\(process\.env\[key\]\)\) throw new Error/);
});

// Perform the side effect or state update expressed on the following line.
test("tenant websites and registered website integrations are considered by CORS", () => {
  // Declare source for use by the surrounding module or function.
  const source = read("app.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /Organization\.findOne\(\{ slug:/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /Organization\.findOne\(\{ domain:/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /WebsiteIntegrationKey\.findOne\([\s\S]*?allowedOrigins: normalizedOrigin/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /NODE_ENV === "production" && parsedOrigin\.protocol !== "https:"/);
});

// Perform the side effect or state update expressed on the following line.
test("raw collection reads in tenant booking administration are tenant-scoped", () => {
  // Declare source for use by the surrounding module or function.
  const source = read("controllers/tenantBookingAdminController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.equal((source.match(/\.collection\.find\(/g) || []).length, 3);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /\{ _id: \{ \$in: validIds \}, tenantId: new mongoose\.Types\.ObjectId\(tenantId\) \}/);
  // Perform the side effect or state update expressed on the following line.
  assert.equal((source.match(/email: \{ \$in: normalized \}, tenantId: new mongoose\.Types\.ObjectId\(tenantId\)/g) || []).length, 2);
});
