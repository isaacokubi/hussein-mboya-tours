/**
 * Purpose: Etims Credential database model. Main declarations: getEncryptionSecret, key, encryptEtimsSecret, decryptEtimsSecret.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load crypto so this module can use its exported dependencies.
import crypto from "crypto";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare ALGORITHM for use by the surrounding module or function.
const ALGORITHM = "aes-256-gcm";
// Declare getEncryptionSecret for use by the surrounding module or function.
const getEncryptionSecret = () => {
  // Declare dedicated for use by the surrounding module or function.
  const dedicated = String(process.env.ETIMS_CREDENTIAL_ENCRYPTION_KEY || "").trim();
  // Check the condition (process.env.NODE_ENV === "production" && dedicated.length < 32) and run the matching branch.
  if (process.env.NODE_ENV === "production" && dedicated.length < 32) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("ETIMS_CREDENTIAL_ENCRYPTION_KEY must be configured with at least 32 characters in production.");
  }
  // Declare secret for use by the surrounding module or function.
  const secret = dedicated || process.env.PAYMENT_CREDENTIAL_ENCRYPTION_KEY || process.env.JWT_SECRET || "";
  // Check the condition (!secret) and run the matching branch.
  if (!secret) throw new Error("No eTIMS credential encryption secret is configured.");
  // Return the value of secret to the caller.
  return secret;
};
// Declare key for use by the surrounding module or function.
const key = () => crypto.createHash("sha256").update(getEncryptionSecret()).digest();

// Declare encryptEtimsSecret for use by the surrounding module or function.
export const encryptEtimsSecret = (value) => {
  // Check the condition (value === undefined || value === null || value === "") and run the matching branch.
  if (value === undefined || value === null || value === "") return "";
  // Declare iv for use by the surrounding module or function.
  const iv = crypto.randomBytes(12);
  // Declare cipher for use by the surrounding module or function.
  const cipher = crypto.createCipheriv(ALGORITHM, key(), iv);
  // Declare encrypted for use by the surrounding module or function.
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  // Return the expression shown below to the caller.
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
};

// Declare decryptEtimsSecret for use by the surrounding module or function.
export const decryptEtimsSecret = (value) => {
  // Check the condition (!value) and run the matching branch.
  if (!value) return "";
  // Declare [iv, tag, data] for use by the surrounding module or function.
  const [iv, tag, data] = String(value).split(".");
  // Check the condition (!iv || !tag || !data) and run the matching branch.
  if (!iv || !tag || !data) throw new Error("Invalid encrypted eTIMS credential format.");
  // Declare decipher for use by the surrounding module or function.
  const decipher = crypto.createDecipheriv(ALGORITHM, key(), Buffer.from(iv, "base64url"));
  // Perform the side effect or state update expressed on the following line.
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  // Return the result of Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString() to the caller.
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
};

// Declare schema for use by the surrounding module or function.
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

// Perform the side effect or state update expressed on the following line.
schema.index({ tenantId: 1, environment: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
schema.plugin(tenantPlugin);
export default mongoose.models.EtimsCredential || mongoose.model("EtimsCredential", schema);
