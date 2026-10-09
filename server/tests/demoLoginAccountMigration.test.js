import test from "node:test";
import assert from "node:assert/strict";
import { ACCOUNT_SPECS, TENANTS, PLATFORM_NEW, emailFor } from "../scripts/reconcileDemoLoginAccounts.js";

test("canonical demo account migration has one global owner and 12 accounts per tenant", () => {
  assert.equal(PLATFORM_NEW, "superadmin1@husseinmboya.com");
  assert.equal(TENANTS.length, 3);
  assert.equal(ACCOUNT_SPECS.length, 12);
  assert.equal(new Set(ACCOUNT_SPECS.map(({ local }) => local)).size, 12);
  assert.equal(1 + TENANTS.length * ACCOUNT_SPECS.length, 37);
});

test("canonical demo tenant login domains and roles cover all required account types", () => {
  const expected = {
    "hussein-mboya": "husseinmboya.com",
    "amani-trails": "amanitrails.com",
    "demo-safari": "demosafari.com",
  };
  for (const tenant of TENANTS) assert.equal(tenant.domain, expected[tenant.slug]);
  for (const tenant of TENANTS) {
    const emails = ACCOUNT_SPECS.map(({ local }) => emailFor(local, tenant.domain));
    assert.equal(new Set(emails).size, 12);
    assert.ok(emails.includes(`admin1@${tenant.domain}`));
    assert.ok(emails.includes(`tourmanager1@${tenant.domain}`));
    assert.ok(emails.includes(`agent2@${tenant.domain}`));
    assert.ok(emails.includes(`guide2@${tenant.domain}`));
    assert.ok(emails.includes(`driver2@${tenant.domain}`));
    assert.ok(emails.includes(`customer4@${tenant.domain}`));
  }
});

test("migration role counts match the intended operational accounts", () => {
  const counts = ACCOUNT_SPECS.reduce((result, spec) => {
    result[spec.role] = (result[spec.role] || 0) + 1;
    return result;
  }, {});
  assert.deepEqual(counts, {
    admin: 1,
    tour_manager: 1,
    agent: 2,
    tour_guide: 2,
    driver: 2,
    customer: 4,
  });
});
