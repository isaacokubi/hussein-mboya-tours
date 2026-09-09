import mongoose from "mongoose";
import crypto from "crypto";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  const secret = process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret) throw new Error("PAYMENT_CREDENTIAL_ENCRYPTION_KEY or JWT_SECRET is required.");
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSecret(value) {
  if (value === undefined || value === null || value === "") return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptSecret(value) {
  if (!value) return "";
  const [ivEncoded, tagEncoded, encryptedEncoded] = String(value).split(".");
  if (!ivEncoded || !tagEncoded || !encryptedEncoded) throw new Error("Invalid encrypted payment credential.");
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), Buffer.from(ivEncoded, "base64url"));
  decipher.setAuthTag(Buffer.from(tagEncoded, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedEncoded, "base64url")), decipher.final()]).toString("utf8");
}

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
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

paymentGatewayConfigSchema.index({ tenantId: 1, provider: 1 }, { unique: true });
paymentGatewayConfigSchema.plugin(tenantPlugin);

export default mongoose.models.PaymentGatewayConfig || mongoose.model("PaymentGatewayConfig", paymentGatewayConfigSchema);
