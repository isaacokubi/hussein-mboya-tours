/**
 * Purpose: stripe Webhook Security business-logic service. Main declarations: verifyStripeWebhookSignature.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import crypto from "node:crypto";

// Declare verifyStripeWebhookSignature for use by the surrounding module or function.
export const verifyStripeWebhookSignature = ({ payload, signature, secret, now = Date.now(), toleranceSeconds = 300 }) => {
  // Check the condition (!Buffer.isBuffer(payload) || !signature || !secret) and run the matching branch.
  if (!Buffer.isBuffer(payload) || !signature || !secret) return false;
  // Declare parts for use by the surrounding module or function.
  const parts = String(signature).split(",").map((part) => part.split("=", 2));
  // Declare timestamp for use by the surrounding module or function.
  const timestamp = Number(parts.find(([key]) => key === "t")?.[1]);
  // Declare signatures for use by the surrounding module or function.
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  // Check the condition (!Number.isFinite(timestamp) || Math.abs(Math.floor(now / 1000) - times) and run the matching branch.
  if (!Number.isFinite(timestamp) || Math.abs(Math.floor(now / 1000) - timestamp) > toleranceSeconds || !signatures.length) return false;
  // Declare expected for use by the surrounding module or function.
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.`).update(payload).digest();
  // Return the result of signatures.some() to the caller.
  return signatures.some((value) => {
    // Check the condition (!/^[a-f\d]{64}$/i.test(value)) and run the matching branch.
    if (!/^[a-f\d]{64}$/i.test(value)) return false;
    // Declare candidate for use by the surrounding module or function.
    const candidate = Buffer.from(value, "hex");
    // Return the expression shown below to the caller.
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
  });
};
