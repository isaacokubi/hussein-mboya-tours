import mongoose from "mongoose";
const { Schema } = mongoose;

const GuestSchema = new Schema({
  firstName: { type: String, trim: true, required: true },
  lastName: { type: String, trim: true, required: true },
  email: { type: String, trim: true, lowercase: true, default: "" },
  phone: { type: String, trim: true, default: "" },
  nationality: { type: String, trim: true, default: "" },
  specialRequests: { type: String, trim: true, maxlength: 1000, default: "" },
}, { _id: false });

const HotelBookingSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  reference: { type: String, required: true, trim: true, uppercase: true },
  hotel: { type: Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
  roomType: { type: Schema.Types.ObjectId, ref: "HotelRoomType", required: true, index: true },
  customer: { type: Schema.Types.ObjectId, ref: "Customer", default: null, index: true },
  user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
  linkedBooking: { type: Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  estimatedArrivalTime: { type: String, trim: true, default: "" },
  rooms: { type: Number, min: 1, required: true },
  adults: { type: Number, min: 1, required: true },
  children: { type: Number, min: 0, default: 0 },
  guests: { type: [GuestSchema], default: [] },
  mealPlan: { type: String, enum: ["room_only", "breakfast", "half_board", "full_board", "all_inclusive"], default: "room_only" },
  bedPreference: { type: String, trim: true, default: "" },
  dietaryRequirements: { type: String, trim: true, maxlength: 1500, default: "" },
  accessibilityNeeds: { type: String, trim: true, maxlength: 1500, default: "" },
  airportTransferRequired: { type: Boolean, default: false },
  specialRequests: { type: String, trim: true, maxlength: 3000, default: "" },
  status: { type: String, enum: ["pending", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"], default: "pending", index: true },
  paymentStatus: { type: String, enum: ["pending", "partial", "paid", "failed", "refunded"], default: "pending" },
  source: { type: String, enum: ["website", "agent", "admin", "booking", "api"], default: "website" },
  subtotal: { type: Number, min: 0, required: true },
  taxes: { type: Number, min: 0, default: 0 },
  fees: { type: Number, min: 0, default: 0 },
  totalAmount: { type: Number, min: 0, required: true },
  currency: { type: String, uppercase: true, default: "KES" },
  notes: { type: String, trim: true, maxlength: 3000, default: "" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

HotelBookingSchema.index({ tenantId: 1, reference: 1 }, { unique: true });
HotelBookingSchema.index({ tenantId: 1, checkIn: 1, checkOut: 1, status: 1 });
HotelBookingSchema.index({ tenantId: 1, customer: 1, createdAt: -1 });

export default mongoose.models.HotelBooking || mongoose.model("HotelBooking", HotelBookingSchema);
