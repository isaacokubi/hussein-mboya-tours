import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../scripts/auditTenantDashboardData.js", import.meta.url), "utf8");

test("tenant dashboard audit is restricted to the intended Atlas database", () => {
  assert.match(source, /EXPECTED_HOST = "cluster0\.cdtxzts\.mongodb\.net"/);
  assert.match(source, /EXPECTED_DATABASE = "husseindb"/);
  assert.match(source, /database !== EXPECTED_DATABASE/);
  assert.match(source, /TENANT_SLUGS = \["hussein-mboya", "amani-trails", "demo-safari"\]/);
});

test("tenant dashboard audit applies tenantId to each operational metric query", () => {
  assert.match(source, /countDocuments\(\{ tenantId, \.\.\.active, \.\.\.extra \}\)/);
  assert.match(source, /\$match: \{ tenantId, \.\.\.active \}/);
  assert.match(source, /\$match: \{ tenantId, status: "posted" \}/);
  assert.match(source, /"account\.tenantId": tenantId/);
});

test("tenant dashboard audit contains no database mutation calls", () => {
  assert.doesNotMatch(source, /\.(?:deleteMany|deleteOne|updateMany|updateOne|findOneAndUpdate|insertMany|bulkWrite)\s*\(/);
  assert.match(source, /No records were inserted, updated, or deleted/);
});
