import mongoose from "mongoose";
const { Schema } = mongoose;

const HotelSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 180 },
  slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
  description: { type: String, trim: true, maxlength: 5000, default: "" },
  location: { type: String, trim: true, maxlength: 240, default: "" },
  address: { type: String, trim: true, maxlength: 300, default: "" },
  city: { type: String, trim: true, maxlength: 120, default: "" },
  county: { type: String, trim: true, maxlength: 120, default: "" },
  country: { type: String, trim: true, default: "Kenya" },
  latitude: { type: Number, min: -90, max: 90, default: null },
  longitude: { type: Number, min: -180, max: 180, default: null },
  starRating: { type: Number, min: 1, max: 5, default: 3 },
  amenities: [{ type: String, trim: true, maxlength: 100 }],
  images: [{ type: String, trim: true }],
  contactPhone: { type: String, trim: true, default: "" },
  contactEmail: { type: String, trim: true, lowercase: true, default: "" },
  checkInTime: { type: String, trim: true, default: "14:00" },
  checkOutTime: { type: String, trim: true, default: "11:00" },
  cancellationPolicy: { type: String, trim: true, maxlength: 3000, default: "" },
  status: { type: String, enum: ["draft", "active", "inactive"], default: "active" },
  featured: { type: Boolean, default: false },
  currency: { type: String, uppercase: true, trim: true, default: "KES" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

HotelSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
HotelSchema.index({ tenantId: 1, status: 1, featured: -1 });
HotelSchema.index({ tenantId: 1, city: 1, county: 1 });
HotelSchema.index({ tenantId: 1, name: "text", description: "text", location: "text" });

export default mongoose.models.Hotel || mongoose.model("Hotel", HotelSchema);
