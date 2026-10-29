import crypto from "node:crypto";

export const verifyStripeWebhookSignature = ({ payload, signature, secret, now = Date.now(), toleranceSeconds = 300 }) => {
  if (!Buffer.isBuffer(payload) || !signature || !secret) return false;
  const parts = String(signature).split(",").map((part) => part.split("=", 2));
  const timestamp = Number(parts.find(([key]) => key === "t")?.[1]);
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!Number.isFinite(timestamp) || Math.abs(Math.floor(now / 1000) - timestamp) > toleranceSeconds || !signatures.length) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.`).update(payload).digest();
  return signatures.some((value) => {
    if (!/^[a-f\d]{64}$/i.test(value)) return false;
    const candidate = Buffer.from(value, "hex");
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
  });
};
