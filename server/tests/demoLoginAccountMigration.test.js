/**
 * Purpose: demo Login Account Migration.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../scripts/reconcileDemoLoginAccounts.js so this module can use its exported dependencies.
import { ACCOUNT_SPECS, TENANTS, PLATFORM_NEW, emailFor } from "../scripts/reconcileDemoLoginAccounts.js";

// Perform the side effect or state update expressed on the following line.
test("canonical demo account migration has one global owner and 12 accounts per tenant", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(PLATFORM_NEW, "superadmin1@husseinmboya.com");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(TENANTS.length, 3);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(ACCOUNT_SPECS.length, 12);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(new Set(ACCOUNT_SPECS.map(({ local }) => local)).size, 12);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(1 + TENANTS.length * ACCOUNT_SPECS.length, 37);
});

// Perform the side effect or state update expressed on the following line.
test("canonical demo tenant login domains and roles cover all required account types", () => {
  // Declare expected for use by the surrounding module or function.
  const expected = {
    "hussein-mboya": "husseinmboya.com",
    "amani-trails": "amanitrails.com",
    "demo-safari": "demosafari.com",
  };
  // Repeat the enclosed work for each required iteration.
  for (const tenant of TENANTS) assert.equal(tenant.domain, expected[tenant.slug]);
  // Repeat the enclosed work for each required iteration.
  for (const tenant of TENANTS) {
    // Declare emails for use by the surrounding module or function.
    const emails = ACCOUNT_SPECS.map(({ local }) => emailFor(local, tenant.domain));
    // Perform the side effect or state update expressed on the following line.
    assert.equal(new Set(emails).size, 12);
    // Perform the side effect or state update expressed on the following line.
    assert.ok(emails.includes(`admin1@${tenant.domain}`));
    // Perform the side effect or state update expressed on the following line.
    assert.ok(emails.includes(`tourmanager1@${tenant.domain}`));
    // Perform the side effect or state update expressed on the following line.
    assert.ok(emails.includes(`agent2@${tenant.domain}`));
    // Perform the side effect or state update expressed on the following line.
    assert.ok(emails.includes(`guide2@${tenant.domain}`));
    // Perform the side effect or state update expressed on the following line.
    assert.ok(emails.includes(`driver2@${tenant.domain}`));
    // Perform the side effect or state update expressed on the following line.
    assert.ok(emails.includes(`customer4@${tenant.domain}`));
  }
});

// Perform the side effect or state update expressed on the following line.
test("migration role counts match the intended operational accounts", () => {
  // Declare counts for use by the surrounding module or function.
  const counts = ACCOUNT_SPECS.reduce((result, spec) => {
    // Perform the side effect or state update expressed on the following line.
    result[spec.role] = (result[spec.role] || 0) + 1;
    // Return the value of result to the caller.
    return result;
  }, {});
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(counts, {
    admin: 1,
    tour_manager: 1,
    agent: 2,
    tour_guide: 2,
    driver: 2,
    customer: 4,
  });
});
