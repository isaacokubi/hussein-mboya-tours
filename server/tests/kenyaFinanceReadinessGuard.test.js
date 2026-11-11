/**
 * Purpose: kenya Finance Readiness Guard.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load ../services/kenyaFinanceReadinessGuard.js so this module can use its exported dependencies.
import { validateKenyaFinanceProductionReadiness } from "../services/kenyaFinanceReadinessGuard.js";

// Perform the side effect or state update expressed on the following line.
test("Kenya finance production readiness requires KRA PIN", () => {
  // Declare result for use by the surrounding module or function.
  const result = validateKenyaFinanceProductionReadiness({ etimsEnabled: false });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.ready, false);
  // Perform the side effect or state update expressed on the following line.
  assert.match(result.failures.join(" "), /KRA PIN/);
});

// Perform the side effect or state update expressed on the following line.
test("Kenya finance production readiness validates production eTIMS configuration", () => {
  // Declare result for use by the surrounding module or function.
  const result = validateKenyaFinanceProductionReadiness({
    kraPin: "P051234567X",
    etimsEnabled: true,
    etimsEnvironment: "production",
    etimsSolution: "VSCU",
    etimsDeviceId: "DEVICE-01",
    etimsBranchId: "001",
    etimsAdapterUrl: "https://etims.example.test",
  });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.ready, true);
});

// Perform the side effect or state update expressed on the following line.
test("VAT registration requires a VAT number", () => {
  // Declare result for use by the surrounding module or function.
  const result = validateKenyaFinanceProductionReadiness({
    kraPin: "P051234567X",
    vatRegistered: true,
  });
  // Perform the side effect or state update expressed on the following line.
  assert.equal(result.ready, false);
  // Perform the side effect or state update expressed on the following line.
  assert.match(result.failures.join(" "), /VAT number/);
});
