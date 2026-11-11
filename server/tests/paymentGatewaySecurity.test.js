/**
 * Purpose: payment Gateway Security.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../services/paymentGatewayService.js so this module can use its exported dependencies.
import { isLegacyMpesaFallbackAllowed } from "../services/paymentGatewayService.js";

// Perform the side effect or state update expressed on the following line.
test("legacy global M-Pesa fallback requires explicit non-production opt-in", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isLegacyMpesaFallbackAllowed("development", "true"), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isLegacyMpesaFallbackAllowed("test", "true"), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isLegacyMpesaFallbackAllowed("development", undefined), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isLegacyMpesaFallbackAllowed("development", "false"), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(isLegacyMpesaFallbackAllowed("production", "true"), false);
});
