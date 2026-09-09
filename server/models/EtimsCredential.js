import mongoose from "mongoose";
import crypto from "crypto";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const ALGORITHM = "aes-256-gcm";
const key = () => crypto.createHash("sha256").update(process.env.ETIMS_CREDENTIAL_ENCRYPTION_KEY || process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY || process.env.JWT_SECRET || "").digest();
export const encryptEtimsSecret = (value) => { if (value === undefined || value === null || value === "") return ""; const iv = crypto.randomBytes(12); const cipher = crypto.createCipheriv(ALGORITHM, key(), iv); const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]); return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`; };
export const decryptEtimsSecret = (value) => { if (!value) return ""; const [iv, tag, data] = String(value).split("."); const decipher = crypto.createDecipheriv(ALGORITHM, key(), Buffer.from(iv, "base64url")); decipher.setAuthTag(Buffer.from(tag, "base64url")); return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8"); };

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
