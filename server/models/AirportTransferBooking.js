import mongoose from "mongoose";
const { Schema } = mongoose;

const AirportTransferBookingSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  reference: { type: String, required: true, trim: true, uppercase: true },
  transfer: { type: Schema.Types.ObjectId, ref: "AirportTransfer", required: true, index: true },
  customer: { type: Schema.Types.ObjectId, ref: "Customer", default: null, index: true },
  user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
  linkedBooking: { type: Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
  pickupDateTime: { type: Date, required: true },
  pickupLocation: { type: String, trim: true, maxlength: 300, required: true },
  dropoffLocation: { type: String, trim: true, maxlength: 300, required: true },
  flightNumber: { type: String, trim: true, uppercase: true, maxlength: 30, default: "" },
  airline: { type: String, trim: true, maxlength: 120, default: "" },
  terminal: { type: String, trim: true, maxlength: 80, default: "" },
  passengerName: { type: String, trim: true, maxlength: 180, required: true },
  passengerPhone: { type: String, trim: true, maxlength: 40, required: true },
  passengerEmail: { type: String, trim: true, lowercase: true, default: "" },
  passengers: { type: Number, min: 1, required: true },
  luggage: { type: Number, min: 0, default: 0 },
  specialRequests: { type: String, trim: true, maxlength: 2000, default: "" },
  status: { type: String, enum: ["pending", "confirmed", "assigned", "driver_en_route", "picked_up", "completed", "cancelled", "no_show"], default: "pending", index: true },
  paymentStatus: { type: String, enum: ["pending", "partial", "paid", "failed", "refunded"], default: "pending" },
  subtotal: { type: Number, min: 0, required: true },
  taxes: { type: Number, min: 0, default: 0 },
  fees: { type: Number, min: 0, default: 0 },
  totalAmount: { type: Number, min: 0, required: true },
  currency: { type: String, uppercase: true, default: "KES" },
  assignedVehicle: { type: Schema.Types.ObjectId, ref: "Vehicle", default: null },
  assignedDriver: { type: Schema.Types.ObjectId, ref: "User", default: null },
  source: { type: String, enum: ["website", "agent", "admin", "booking", "api"], default: "website" },
  notes: { type: String, trim: true, maxlength: 3000, default: "" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

AirportTransferBookingSchema.index({ tenantId: 1, reference: 1 }, { unique: true });
AirportTransferBookingSchema.index({ tenantId: 1, pickupDateTime: 1, status: 1 });
AirportTransferBookingSchema.index({ tenantId: 1, customer: 1, createdAt: -1 });

export default mongoose.models.AirportTransferBooking || mongoose.model("AirportTransferBooking", AirportTransferBookingSchema);
