/**
 * Purpose: Payment Gateway Config database model. Main declarations: getEncryptionKey, encryptSecret, decryptSecret.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load crypto so this module can use its exported dependencies.
import crypto from "crypto";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare ENCRYPTION_ALGORITHM for use by the surrounding module or function.
const ENCRYPTION_ALGORITHM = "aes-256-gcm";

// Define getEncryptionKey; its parameters and body implement this operation.
function getEncryptionKey() {
  // Declare secret for use by the surrounding module or function.
  const secret = process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY || process.env.JWT_SECRET;
  // Check the condition (!secret) and run the matching branch.
  if (!secret) throw new Error("PAYMENT_CREDENTIAL_ENCRYPTION_KEY or JWT_SECRET is required.");
  // Return the result of crypto.createHash("sha256").update(secret).digest() to the caller.
  return crypto.createHash("sha256").update(secret).digest();
}

// Define encryptSecret; its parameters and body implement this operation.
export function encryptSecret(value) {
  // Check the condition (value === undefined || value === null || value === "") and run the matching branch.
  if (value === undefined || value === null || value === "") return "";
  // Declare iv for use by the surrounding module or function.
  const iv = crypto.randomBytes(12);
  // Declare cipher for use by the surrounding module or function.
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), iv);
  // Declare encrypted for use by the surrounding module or function.
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  // Declare tag for use by the surrounding module or function.
  const tag = cipher.getAuthTag();
  // Return the expression shown below to the caller.
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

// Define decryptSecret; its parameters and body implement this operation.
export function decryptSecret(value) {
  // Check the condition (!value) and run the matching branch.
  if (!value) return "";
  // Declare [ivEncoded, tagEncoded, encryptedEncoded] for use by the surrounding module or function.
  const [ivEncoded, tagEncoded, encryptedEncoded] = String(value).split(".");
  // Check the condition (!ivEncoded || !tagEncoded || !encryptedEncoded) and run the matching branch.
  if (!ivEncoded || !tagEncoded || !encryptedEncoded) throw new Error("Invalid encrypted payment credential.");
  // Declare decipher for use by the surrounding module or function.
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), Buffer.from(ivEncoded, "base64url"));
  // Perform the side effect or state update expressed on the following line.
  decipher.setAuthTag(Buffer.from(tagEncoded, "base64url"));
  // Return the result of Buffer.concat([decipher.update(Buffer.from(encryptedEncoded, "base64url")), decipher.final()]).toString() to the caller.
  return Buffer.concat([decipher.update(Buffer.from(encryptedEncoded, "base64url")), decipher.final()]).toString("utf8");
}

// Declare paymentGatewayConfigSchema for use by the surrounding module or function.
const paymentGatewayConfigSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  provider: { type: String, enum: ["MPESA", "STRIPE", "PAYPAL", "PESAPAL", "BANK"], required: true },
  environment: { type: String, enum: ["sandbox", "production"], default: "sandbox" },
  enabled: { type: Boolean, default: false },
  accountName: { type: String, trim: true, default: "" },
  shortcode: { type: String, trim: true, default: "" },
  publicKey: { type: String, trim: true, default: "" },
  merchantId: { type: String, trim: true, default: "" },
  callbackUrl: { type: String, trim: true, default: "" },
  consumerKeyEncrypted: { type: String, default: "" },
  consumerSecretEncrypted: { type: String, default: "" },
  passkeyEncrypted: { type: String, default: "" },
  secretKeyEncrypted: { type: String, default: "" },
  webhookSecretEncrypted: { type: String, default: "" },
  initiatorNameEncrypted: { type: String, default: "" },
  securityCredentialEncrypted: { type: String, default: "" },
  sandboxConsumerKeyEncrypted: { type: String, default: "" },
  sandboxConsumerSecretEncrypted: { type: String, default: "" },
  sandboxPasskeyEncrypted: { type: String, default: "" },
  productionConsumerKeyEncrypted: { type: String, default: "" },
  productionConsumerSecretEncrypted: { type: String, default: "" },
  productionPasskeyEncrypted: { type: String, default: "" },
  sandboxShortcode: { type: String, trim: true, default: "" },
  productionShortcode: { type: String, trim: true, default: "" },
  sandboxCallbackUrl: { type: String, trim: true, default: "" },
  productionCallbackUrl: { type: String, trim: true, default: "" },
  // PayPal credentials are kept per environment so switching modes can never
  // reuse a credential from the other PayPal app. Webhook IDs are identifiers,
  // not secrets, but are still scoped to the environment and tenant.
  sandboxPaypalClientIdEncrypted: { type: String, default: "" },
  sandboxPaypalClientSecretEncrypted: { type: String, default: "" },
  sandboxPaypalWebhookId: { type: String, trim: true, default: "" },
  sandboxPaypalMerchantId: { type: String, trim: true, default: "" },
  sandboxPaypalValidatedAt: { type: Date, default: null },
  productionPaypalClientIdEncrypted: { type: String, default: "" },
  productionPaypalClientSecretEncrypted: { type: String, default: "" },
  productionPaypalWebhookId: { type: String, trim: true, default: "" },
  productionPaypalMerchantId: { type: String, trim: true, default: "" },
  productionPaypalValidatedAt: { type: Date, default: null },
  sandboxLifecycleVerifiedAt: { type: Date, default: null },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

// Perform the side effect or state update expressed on the following line.
paymentGatewayConfigSchema.index({ tenantId: 1, provider: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
paymentGatewayConfigSchema.plugin(tenantPlugin);

export default mongoose.models.PaymentGatewayConfig || mongoose.model("PaymentGatewayConfig", paymentGatewayConfigSchema);
