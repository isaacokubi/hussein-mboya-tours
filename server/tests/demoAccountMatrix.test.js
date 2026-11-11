/**
 * Purpose: demo Account Matrix.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../scripts/demoAccountMatrix.js so this module can use its exported dependencies.
import { buildDemoAccountMatrix } from "../scripts/demoAccountMatrix.js";

// Perform the side effect or state update expressed on the following line.
test("staging matrix selects 28 canonical accounts from the authoritative seed", () => {
  // Declare accounts for use by the surrounding module or function.
  const accounts = buildDemoAccountMatrix();
  // Perform the side effect or state update expressed on the following line.
  assert.equal(accounts.length, 28);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(accounts[0].email, "superadmin1@husseinmboya.com");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(accounts[0].role, "super_admin");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(accounts[0].tenant, null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(accounts.filter((account) => account.role === "customer").length, 12);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(accounts.filter((account) => account.role === "admin").length, 3);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(accounts.filter((account) => account.role === "tour_guide").length, 3);
});

// Perform the side effect or state update expressed on the following line.
test("staging matrix uses canonical domains, role names, and dashboard routes", () => {
  // Declare expected for use by the surrounding module or function.
  const expected = {
    "hussein-mboya": "husseinmboya.com",
    "amani-trails": "amanitrails.com",
    "demo-safari": "demosafari.com",
  };
  // Declare accounts for use by the surrounding module or function.
  const accounts = buildDemoAccountMatrix();
  // Repeat the enclosed work for each required iteration.
  for (const [tenant, domain] of Object.entries(expected)) {
    // Declare tenantAccounts for use by the surrounding module or function.
    const tenantAccounts = accounts.filter((account) => account.tenant === tenant);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(tenantAccounts.length, 9);
    // Perform the side effect or state update expressed on the following line.
    assert.ok(tenantAccounts.every((account) => account.email.endsWith(`@${domain}`)));
    // Perform the side effect or state update expressed on the following line.
    assert.ok(tenantAccounts.some((account) => account.role === "tour_manager" && account.dashboard === "/api/tourmanager/dashboard"));
    // Perform the side effect or state update expressed on the following line.
    assert.ok(tenantAccounts.some((account) => account.role === "tour_guide" && account.dashboard === "/api/guide/dashboard"));
  }
});
