import assert from "node:assert/strict";
import test from "node:test";
import { isLegacyMpesaFallbackAllowed } from "../services/paymentGatewayService.js";

test("legacy global M-Pesa fallback requires explicit non-production opt-in", () => {
  assert.equal(isLegacyMpesaFallbackAllowed("development", "true"), true);
  assert.equal(isLegacyMpesaFallbackAllowed("test", "true"), true);
  assert.equal(isLegacyMpesaFallbackAllowed("development", undefined), false);
  assert.equal(isLegacyMpesaFallbackAllowed("development", "false"), false);
  assert.equal(isLegacyMpesaFallbackAllowed("production", "true"), false);
});
