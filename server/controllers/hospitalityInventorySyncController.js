import AccommodationInventory from "../models/AccommodationInventory.js";
import Hotel from "../models/Hotel.js";
import HotelRoomType from "../models/HotelRoomType.js";

const clean = (value) => String(value ?? "").trim();
const slugify = (value) => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 170);

export const syncAccommodationInventoryToHotelPms = async (req, res, next) => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ success: false, message: "Tenant context is required." });

    const legacy = await AccommodationInventory.find({ tenantId }).sort({ propertyName: 1, roomType: 1 }).lean();
    let hotelsCreated = 0;
    let roomsCreated = 0;
    let roomsUpdated = 0;

    for (const item of legacy) {
      const propertyName = clean(item.propertyName);
      const roomName = clean(item.roomType);
      if (!propertyName || !roomName) continue;

      let hotel = await Hotel.findOne({ tenantId, name: propertyName });
      if (!hotel) {
        const baseSlug = slugify(propertyName) || `hotel-${Date.now()}`;
        let slug = baseSlug;
        let suffix = 2;
        while (await Hotel.exists({ tenantId, slug })) slug = `${baseSlug}-${suffix++}`;
        hotel = await Hotel.create({
          tenantId,
          name: propertyName,
          slug,
          location: clean(item.location),
          city: clean(item.location),
          country: "Kenya",
          status: item.status === "active" ? "active" : "inactive",
          currency: item.currency || "KES",
          createdBy: req.user?._id || null,
          updatedBy: req.user?._id || null,
        });
        hotelsCreated += 1;
      }

      const payload = {
        tenantId,
        hotel: hotel._id,
        name: roomName,
        description: clean(item.notes),
        totalRooms: Number(item.totalRooms || 0),
        availableRooms: Math.min(Number(item.totalRooms || 0), Math.max(0, Number(item.availableRooms ?? item.totalRooms ?? 0))),
        nightlyRate: Number(item.nightlyRate || 0),
        currency: item.currency || hotel.currency || "KES",
        status: item.status === "active" ? "active" : "inactive",
        updatedBy: req.user?._id || null,
      };

      const existing = await HotelRoomType.findOne({ tenantId, hotel: hotel._id, name: roomName });
      if (existing) {
        Object.assign(existing, payload);
        await existing.save();
        roomsUpdated += 1;
      } else {
        await HotelRoomType.create({ ...payload, createdBy: req.user?._id || null });
        roomsCreated += 1;
      }
    }

    return res.json({ success: true, data: { legacyRecords: legacy.length, hotelsCreated, roomsCreated, roomsUpdated } });
  } catch (error) {
    return next(error);
  }
};
