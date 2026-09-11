import mongoose from "mongoose";
import HotelBooking from "./HotelBooking.js";
import AirportTransferBooking from "./AirportTransferBooking.js";

const { Schema } = mongoose;

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

schema.index({ tenantId: 1, hospitalityType: 1, hospitalityBooking: 1 });

schema.pre("validate", async function(next) {
  try {
    const Model = this.hospitalityType === "hotel" ? HotelBooking : this.hospitalityType === "airport_transfer" ? AirportTransferBooking : null;
    if (!Model) return next(new Error("Invalid hospitality deposit type."));

    const booking = await Model.findOne({ _id: this.hospitalityBooking, tenantId: this.tenantId }).select("reference totalAmount currency status").lean();
    if (!booking) return next(new Error("Hospitality reservation does not belong to this tenant or no longer exists."));

    this.bookingReference = booking.reference;
    this.currency = String(this.currency || booking.currency || "KES").toUpperCase();

    if (!Number.isFinite(Number(this.amount)) || Number(this.amount) <= 0) return next(new Error("Deposit amount must be greater than zero."));
    if (Number(this.paidAmount || 0) > Number(this.amount)) return next(new Error("Deposit paid amount cannot exceed the deposit amount."));
    if (this.dueDate && Number.isNaN(new Date(this.dueDate).getTime())) return next(new Error("Deposit due date is invalid."));

    if (this.status !== "forfeited" && this.status !== "waived") {
      this.status = Number(this.paidAmount || 0) <= 0 ? "pending" : Number(this.paidAmount || 0) >= Number(this.amount) ? "paid" : "partial";
    }
    return next();
  } catch (error) {
    return next(error);
  }
});

export default mongoose.models.HospitalityDeposit || mongoose.model("HospitalityDeposit", schema);
