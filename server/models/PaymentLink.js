import * as firestore from "../config/firestore.js";
import crypto from "crypto";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const paymentLinkSchema = new firestore.Schema({
  tenantId: { type: firestore.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  token: { type: String, required: true, unique: true, index: true },
  booking: { type: firestore.Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
  invoice: { type: firestore.Schema.Types.ObjectId, ref: "Invoice", default: null },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "KES", uppercase: true, trim: true },
  status: { type: String, enum: ["active", "paid", "expired", "cancelled"], default: "active", index: true },
  expiresAt: { type: Date, default: null, index: true },
  usedAt: { type: Date, default: null },
  createdBy: { type: firestore.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });
paymentLinkSchema.statics.generateToken = () => crypto.randomBytes(24).toString("base64url");
paymentLinkSchema.plugin(tenantPlugin);
export default firestore.models.PaymentLink || firestore.model("PaymentLink", paymentLinkSchema);
