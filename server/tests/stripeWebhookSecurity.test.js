/**
 * Purpose: stripe Webhook Security.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:crypto so this module can use its exported dependencies.
import crypto from "node:crypto";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../services/stripeWebhookSecurity.js so this module can use its exported dependencies.
import { verifyStripeWebhookSignature } from "../services/stripeWebhookSecurity.js";

// Perform the side effect or state update expressed on the following line.
test("Stripe signatures bind the exact raw body and a recent timestamp", () => {
  // Declare payload for use by the surrounding module or function.
  const payload = Buffer.from('{"id":"evt_test","type":"checkout.session.completed"}');
  // Declare secret for use by the surrounding module or function.
  const secret = "whsec-test-only";
  // Declare now for use by the surrounding module or function.
  const now = 1_800_000_000_000;
  // Declare timestamp for use by the surrounding module or function.
  const timestamp = Math.floor(now / 1000);
  // Declare digest for use by the surrounding module or function.
  const digest = crypto.createHmac("sha256", secret).update(`${timestamp}.`).update(payload).digest("hex");
  // Declare signature for use by the surrounding module or function.
  const signature = `t=${timestamp},v1=${digest}`;
  // Perform the side effect or state update expressed on the following line.
  assert.equal(verifyStripeWebhookSignature({ payload, signature, secret, now }), true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(verifyStripeWebhookSignature({ payload: Buffer.from(`${payload.toString()} `), signature, secret, now }), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(verifyStripeWebhookSignature({ payload, signature, secret, now: now + 301_000 }), false);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(verifyStripeWebhookSignature({ payload, signature, secret: "wrong-secret", now }), false);
});
