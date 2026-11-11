import test from "node:test";
import assert from "node:assert/strict";
import { buildDemoAccountMatrix } from "../scripts/demoAccountMatrix.js";

test("staging matrix selects 28 canonical accounts from the authoritative seed", () => {
  const accounts = buildDemoAccountMatrix();
  assert.equal(accounts.length, 28);
  assert.equal(accounts[0].email, "superadmin1@husseinmboya.com");
  assert.equal(accounts[0].role, "super_admin");
  assert.equal(accounts[0].tenant, null);
  assert.equal(accounts.filter((account) => account.role === "customer").length, 12);
  assert.equal(accounts.filter((account) => account.role === "admin").length, 3);
  assert.equal(accounts.filter((account) => account.role === "tour_guide").length, 3);
});

test("staging matrix uses canonical domains, role names, and dashboard routes", () => {
  const expected = {
    "hussein-mboya": "husseinmboya.com",
    "amani-trails": "amanitrails.com",
    "demo-safari": "demosafari.com",
  };
  const accounts = buildDemoAccountMatrix();
  for (const [tenant, domain] of Object.entries(expected)) {
    const tenantAccounts = accounts.filter((account) => account.tenant === tenant);
    assert.equal(tenantAccounts.length, 9);
    assert.ok(tenantAccounts.every((account) => account.email.endsWith(`@${domain}`)));
    assert.ok(tenantAccounts.some((account) => account.role === "tour_manager" && account.dashboard === "/api/tourmanager/dashboard"));
    assert.ok(tenantAccounts.some((account) => account.role === "tour_guide" && account.dashboard === "/api/guide/dashboard"));
  }
});
