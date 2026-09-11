import mongoose from "mongoose";
import AccommodationInventory from "./AccommodationInventory.js";
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
  inventoryVersion: { type: Number, min: 0, default: 0, index: true },
  nightlyRate: { type: Number, min: 0, required: true },
  mealPlans: [{ type: String, enum: ["room_only", "breakfast", "half_board", "full_board", "all_inclusive"] }],
  currency: { type: String, uppercase: true, trim: true, default: "KES" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

HotelRoomTypeSchema.index({ tenantId: 1, hotel: 1, name: 1 }, { unique: true });
HotelRoomTypeSchema.index({ tenantId: 1, hotel: 1, status: 1 });
HotelRoomTypeSchema.index({ tenantId: 1, hotel: 1, inventoryVersion: 1 });

const syncLegacyInventory = async (room) => {
  if (!room?.tenantId || !room?.hotel) return;
  const Hotel = mongoose.model("Hotel");
  const hotel = await Hotel.findOne({ _id: room.hotel, tenantId: room.tenantId }).select("name location").lean();
  if (!hotel) return;
  await AccommodationInventory.findOneAndUpdate(
    { tenantId: room.tenantId, propertyName: hotel.name, roomType: room.name },
    { tenantId: room.tenantId, propertyName: hotel.name, location: hotel.location || "", roomType: room.name, totalRooms: room.totalRooms, availableRooms: room.availableRooms, nightlyRate: room.nightlyRate, currency: room.currency, status: room.status, notes: room.description || "", updatedBy: room.updatedBy || null },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

HotelRoomTypeSchema.post("save", async (room) => { try { await syncLegacyInventory(room); } catch (error) { console.error("HOTEL ROOM LEGACY SYNC ERROR:", error.message); } });
HotelRoomTypeSchema.post("findOneAndUpdate", async (room) => { try { await syncLegacyInventory(room); } catch (error) { console.error("HOTEL ROOM LEGACY SYNC ERROR:", error.message); } });

export default mongoose.models.HotelRoomType || mongoose.model("HotelRoomType", HotelRoomTypeSchema);