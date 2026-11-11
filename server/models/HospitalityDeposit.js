/**
 * Purpose: Hospitality Deposit database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ./HotelBooking.js so this module can use its exported dependencies.
import HotelBooking from "./HotelBooking.js";
// Load ./AirportTransferBooking.js so this module can use its exported dependencies.
import AirportTransferBooking from "./AirportTransferBooking.js";

// Declare { Schema } for use by the surrounding module or function.
const { Schema } = mongoose;

// Declare schema for use by the surrounding module or function.
const schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  hospitalityType: { type: String, enum: ["hotel", "airport_transfer"], required: true, index: true },
  hospitalityBooking: { type: Schema.Types.ObjectId, required: true, index: true },
  bookingReference: { type: String, trim: true, uppercase: true, index: true },
  amount: { type: Number, min: 0, required: true },
  currency: { type: String, uppercase: true, default: "KES" },
  dueDate: { type: Date, default: null },
  paidAmount: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ["pending", "partial", "paid", "refunded", "forfeited", "waived"], default: "pending", index: true },
  payment: { type: Schema.Types.ObjectId, ref: "Payment", default: null },
  notes: { type: String, trim: true, maxlength: 3000, default: "" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

// Perform the side effect or state update expressed on the following line.
schema.index({ tenantId: 1, hospitalityType: 1, hospitalityBooking: 1 });

// Perform the side effect or state update expressed on the following line.
schema.pre("validate", async function(next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare Model for use by the surrounding module or function.
    const Model = this.hospitalityType === "hotel" ? HotelBooking : this.hospitalityType === "airport_transfer" ? AirportTransferBooking : null;
    // Check the condition (!Model) and run the matching branch.
    if (!Model) return next(new Error("Invalid hospitality deposit type."));

    // Declare booking for use by the surrounding module or function.
    const booking = await Model.findOne({ _id: this.hospitalityBooking, tenantId: this.tenantId }).select("reference totalAmount currency status").lean();
    // Check the condition (!booking) and run the matching branch.
    if (!booking) return next(new Error("Hospitality reservation does not belong to this tenant or no longer exists."));

    // Perform the side effect or state update expressed on the following line.
    this.bookingReference = booking.reference;
    // Perform the side effect or state update expressed on the following line.
    this.currency = String(this.currency || booking.currency || "KES").toUpperCase();

    // Check the condition (!Number.isFinite(Number(this.amount)) || Number(this.amount) <= 0) and run the matching branch.
    if (!Number.isFinite(Number(this.amount)) || Number(this.amount) <= 0) return next(new Error("Deposit amount must be greater than zero."));
    // Check the condition (Number(this.paidAmount || 0) > Number(this.amount)) and run the matching branch.
    if (Number(this.paidAmount || 0) > Number(this.amount)) return next(new Error("Deposit paid amount cannot exceed the deposit amount."));
    // Check the condition (this.dueDate && Number.isNaN(new Date(this.dueDate).getTime())) and run the matching branch.
    if (this.dueDate && Number.isNaN(new Date(this.dueDate).getTime())) return next(new Error("Deposit due date is invalid."));

    // Check the condition (this.status !== "forfeited" && this.status !== "waived") and run the matching branch.
    if (this.status !== "forfeited" && this.status !== "waived") {
      // Perform the side effect or state update expressed on the following line.
      this.status = Number(this.paidAmount || 0) <= 0 ? "pending" : Number(this.paidAmount || 0) >= Number(this.amount) ? "paid" : "partial";
    }
    // Return the result of next() to the caller.
    return next();
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
});

// Perform the side effect or state update expressed on the following line.
schema.plugin(tenantPlugin);

export default mongoose.models.HospitalityDeposit || mongoose.model("HospitalityDeposit", schema);
