/**
 * Purpose: hospitality Inventory Sync Controller HTTP controller. Main declarations: clean, slugify, syncAccommodationInventoryToHotelPms.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import AccommodationInventory from "../models/AccommodationInventory.js";
// Load ../models/Hotel.js so this module can use its exported dependencies.
import Hotel from "../models/Hotel.js";
// Load ../models/HotelRoomType.js so this module can use its exported dependencies.
import HotelRoomType from "../models/HotelRoomType.js";

// Declare clean for use by the surrounding module or function.
const clean = (value) => String(value ?? "").trim();
// Declare slugify for use by the surrounding module or function.
const slugify = (value) => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 170);

// Declare syncAccommodationInventoryToHotelPms for use by the surrounding module or function.
export const syncAccommodationInventoryToHotelPms = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = req.tenantId || req.user?.tenantId;
    // Check the condition (!tenantId) and run the matching branch.
    if (!tenantId) return res.status(400).json({ success: false, message: "Tenant context is required." });

    // Declare legacy for use by the surrounding module or function.
    const legacy = await AccommodationInventory.find({ tenantId }).sort({ propertyName: 1, roomType: 1 }).lean();
    // Declare hotelsCreated for use by the surrounding module or function.
    let hotelsCreated = 0;
    // Declare roomsCreated for use by the surrounding module or function.
    let roomsCreated = 0;
    // Declare roomsUpdated for use by the surrounding module or function.
    let roomsUpdated = 0;

    // Repeat the enclosed work for each required iteration.
    for (const item of legacy) {
      // Declare propertyName for use by the surrounding module or function.
      const propertyName = clean(item.propertyName);
      // Declare roomName for use by the surrounding module or function.
      const roomName = clean(item.roomType);
      // Check the condition (!propertyName || !roomName) and run the matching branch.
      if (!propertyName || !roomName) continue;

      // Declare hotel for use by the surrounding module or function.
      let hotel = await Hotel.findOne({ tenantId, name: propertyName });
      // Check the condition (!hotel) and run the matching branch.
      if (!hotel) {
        // Declare baseSlug for use by the surrounding module or function.
        const baseSlug = slugify(propertyName) || `hotel-${Date.now()}`;
        // Declare slug for use by the surrounding module or function.
        let slug = baseSlug;
        // Declare suffix for use by the surrounding module or function.
        let suffix = 2;
        // Repeat the enclosed work for each required iteration.
        while (await Hotel.exists({ tenantId, slug })) slug = `${baseSlug}-${suffix++}`;
        // Perform the side effect or state update expressed on the following line.
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
        // Perform the side effect or state update expressed on the following line.
        hotelsCreated += 1;
      }

      // Declare payload for use by the surrounding module or function.
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

      // Declare existing for use by the surrounding module or function.
      const existing = await HotelRoomType.findOne({ tenantId, hotel: hotel._id, name: roomName });
      // Check the condition (existing) and run the matching branch.
      if (existing) {
        // Perform the side effect or state update expressed on the following line.
        Object.assign(existing, payload);
        // Perform the side effect or state update expressed on the following line.
        await existing.save();
        // Perform the side effect or state update expressed on the following line.
        roomsUpdated += 1;
      } else {
        // Perform the side effect or state update expressed on the following line.
        await HotelRoomType.create({ ...payload, createdBy: req.user?._id || null });
        // Perform the side effect or state update expressed on the following line.
        roomsCreated += 1;
      }
    }

    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: { legacyRecords: legacy.length, hotelsCreated, roomsCreated, roomsUpdated } });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};
