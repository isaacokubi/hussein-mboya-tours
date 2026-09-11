import mongoose from "mongoose";
const { Schema } = mongoose;

const AirportTransferSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 180 },
  airportName: { type: String, trim: true, maxlength: 180, default: "" },
  airportCode: { type: String, trim: true, uppercase: true, maxlength: 10, default: "" },
  direction: { type: String, enum: ["airport_to_destination", "destination_to_airport", "point_to_point"], default: "airport_to_destination" },
  pickupLocation: { type: String, trim: true, maxlength: 300, default: "" },
  dropoffLocation: { type: String, trim: true, maxlength: 300, default: "" },
  vehicleType: { type: String, trim: true, maxlength: 100, required: true },
  passengerCapacity: { type: Number, min: 1, required: true },
  luggageCapacity: { type: Number, min: 0, default: 2 },
  pricingModel: { type: String, enum: ["per_vehicle", "per_passenger"], default: "per_vehicle" },
  price: { type: Number, min: 0, required: true },
  currency: { type: String, uppercase: true, trim: true, default: "KES" },
  durationMinutes: { type: Number, min: 0, default: 60 },
  amenities: [{ type: String, trim: true, maxlength: 100 }],
  operatingHours: { type: String, trim: true, default: "24/7" },
  notes: { type: String, trim: true, maxlength: 2000, default: "" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

AirportTransferSchema.index({ tenantId: 1, status: 1, airportCode: 1 });
AirportTransferSchema.index({ tenantId: 1, name: 1 });

export default mongoose.models.AirportTransfer || mongoose.model("AirportTransfer", AirportTransferSchema);
