import mongoose from "mongoose";
const { Schema } = mongoose;

const HotelRoomTypeSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  hotel: { type: Schema.Types.ObjectId, ref: "Hotel", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 2500, default: "" },
  maxAdults: { type: Number, min: 1, default: 2 },
  maxChildren: { type: Number, min: 0, default: 1 },
  beds: [{ type: String, trim: true, maxlength: 80 }],
  amenities: [{ type: String, trim: true, maxlength: 100 }],
  totalRooms: { type: Number, min: 0, required: true },
  availableRooms: { type: Number, min: 0, required: true },
  nightlyRate: { type: Number, min: 0, required: true },
  mealPlans: [{ type: String, enum: ["room_only", "breakfast", "half_board", "full_board", "all_inclusive"] }],
  currency: { type: String, uppercase: true, trim: true, default: "KES" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

HotelRoomTypeSchema.index({ tenantId: 1, hotel: 1, name: 1 }, { unique: true });
HotelRoomTypeSchema.index({ tenantId: 1, hotel: 1, status: 1 });

export default mongoose.models.HotelRoomType || mongoose.model("HotelRoomType", HotelRoomTypeSchema);
