import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { verifyStripeWebhookSignature } from "../services/stripeWebhookSecurity.js";

test("Stripe signatures bind the exact raw body and a recent timestamp", () => {
  const payload = Buffer.from('{"id":"evt_test","type":"checkout.session.completed"}');
  const secret = "whsec-test-only";
  const now = 1_800_000_000_000;
  const timestamp = Math.floor(now / 1000);
  const digest = crypto.createHmac("sha256", secret).update(`${timestamp}.`).update(payload).digest("hex");
  const signature = `t=${timestamp},v1=${digest}`;
  assert.equal(verifyStripeWebhookSignature({ payload, signature, secret, now }), true);
  assert.equal(verifyStripeWebhookSignature({ payload: Buffer.from(`${payload.toString()} `), signature, secret, now }), false);
  assert.equal(verifyStripeWebhookSignature({ payload, signature, secret, now: now + 301_000 }), false);
  assert.equal(verifyStripeWebhookSignature({ payload, signature, secret: "wrong-secret", now }), false);
});
