import test from "node:test";
import assert from "node:assert/strict";
import { validateKenyaFinanceProductionReadiness } from "../services/kenyaFinanceReadinessGuard.js";

test("Kenya finance production readiness requires KRA PIN", () => {
  const result = validateKenyaFinanceProductionReadiness({ etimsEnabled: false });
  assert.equal(result.ready, false);
  assert.match(result.failures.join(" "), /KRA PIN/);
});

test("Kenya finance production readiness validates production eTIMS configuration", () => {
  const result = validateKenyaFinanceProductionReadiness({
    kraPin: "P051234567X",
    etimsEnabled: true,
    etimsEnvironment: "production",
    etimsSolution: "VSCU",
    etimsDeviceId: "DEVICE-01",
    etimsBranchId: "001",
    etimsAdapterUrl: "https://etims.example.test",
  });
  assert.equal(result.ready, true);
});

test("VAT registration requires a VAT number", () => {
  const result = validateKenyaFinanceProductionReadiness({
    kraPin: "P051234567X",
    vatRegistered: true,
  });
  assert.equal(result.ready, false);
  assert.match(result.failures.join(" "), /VAT number/);
});
