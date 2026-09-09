import mongoose from "mongoose";
import crypto from "crypto";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const ALGORITHM = "aes-256-gcm";
const getEncryptionSecret = () => {
  const dedicated = String(process.env.ETIMS_CREDENTIAL_ENCRYPTION_KEY || "").trim();
  if (process.env.NODE_ENV === "production" && dedicated.length < 32) {
    throw new Error("ETIMS_CREDENTIAL_ENCRYPTION_KEY must be configured with at least 32 characters in production.");
  }
  const secret = dedicated || process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY || process.env.JWT_SECRET || "";
  if (!secret) throw new Error("No eTIMS credential encryption secret is configured.");
  return secret;
};
const key = () => crypto.createHash("sha256").update(getEncryptionSecret()).digest();

export const encryptEtimsSecret = (value) => {
  if (value === undefined || value === null || value === "") return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
};

export const decryptEtimsSecret = (value) => {
  if (!value) return "";
  const [iv, tag, data] = String(value).split(".");
  if (!iv || !tag || !data) throw new Error("Invalid encrypted eTIMS credential format.");
  const decipher = crypto.createDecipheriv(ALGORITHM, key(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
};

const schema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  environment: { type: String, enum: ["sandbox", "production"], default: "sandbox" },
  credentialRef: { type: String, trim: true, default: "" },
  adapterTokenEncrypted: { type: String, select: false, default: "" },
  clientIdEncrypted: { type: String, select: false, default: "" },
  clientSecretEncrypted: { type: String, select: false, default: "" },
  certificateRef: { type: String, trim: true, default: "" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

schema.index({ tenantId: 1, environment: 1 }, { unique: true });
schema.plugin(tenantPlugin);
export default mongoose.models.EtimsCredential || mongoose.model("EtimsCredential", schema);
