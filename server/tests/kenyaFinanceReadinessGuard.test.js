import test from "node:test";
import assert from "node:assert/strict";
import { validateKenyaFinanceProductionReadiness, assertKenyaFinanceProductionReadiness } from "../services/kenyaFinanceReadinessGuard.js";

const verifiedProfile = {
  kraPin: "P051234567X",
  kraPinStatus: "verified",
  vatRegistered: false,
};

test("Kenya finance production readiness requires KRA PIN", () => {
  const result = validateKenyaFinanceProductionReadiness({ etimsEnabled: false });
  assert.equal(result.ready, false);
  assert.match(result.failures.join(" "), /KRA PIN/);
});

test("KRA PIN must be verified, not merely entered or pending", () => {
  const result = validateKenyaFinanceProductionReadiness({ kraPin: "P051234567X", kraPinStatus: "pending" });
  assert.equal(result.ready, false);
  assert.match(result.failures.join(" "), /KRA PIN must be verified/);
});

test("VAT registration requires a number and verified status", () => {
  const missingNumber = validateKenyaFinanceProductionReadiness({ ...verifiedProfile, vatRegistered: true });
  assert.match(missingNumber.failures.join(" "), /VAT number/);
  const pending = validateKenyaFinanceProductionReadiness({ ...verifiedProfile, vatRegistered: true, vatNumber: "P051234567X", vatValidationStatus: "pending" });
  assert.match(pending.failures.join(" "), /VAT registration must be verified/);
});

test("valid production eTIMS configuration passes the application-side guard", () => {
  const result = validateKenyaFinanceProductionReadiness({
    ...verifiedProfile,
    etimsEnabled: true,
    etimsEnvironment: "production",
    etimsSolution: "VSCU",
    etimsDeviceId: "DEVICE-01",
    etimsBranchId: "001",
    etimsAdapterUrl: "https://adapter.example.test",
  });
  assert.equal(result.ready, true);
});

test("production eTIMS adapter must use HTTPS and cannot embed credentials or query strings", () => {
  for (const etimsAdapterUrl of [
    "http://adapter.example.test",
    "https://user:secret@adapter.example.test",
    "https://adapter.example.test?token=secret",
    "not-a-url",
  ]) {
    const result = validateKenyaFinanceProductionReadiness({
      ...verifiedProfile,
      etimsEnabled: true,
      etimsEnvironment: "production",
      etimsSolution: "VSCU",
      etimsDeviceId: "DEVICE-01",
      etimsBranchId: "001",
      etimsAdapterUrl,
    });
    assert.equal(result.ready, false, etimsAdapterUrl);
  }
});

test("assertion returns a typed readiness error for incomplete production configuration", () => {
  assert.throws(
    () => assertKenyaFinanceProductionReadiness({ kraPin: "P051234567X", kraPinStatus: "pending" }),
    (error) => error.statusCode === 422 && error.code === "KENYA_FINANCE_NOT_READY" && error.details.length > 0,
  );
});
