import HotelRoomType from "../models/HotelRoomType.js";

/**
 * Optimistic concurrency guard for hotel room inventory.
 * A room type's inventoryVersion is bumped atomically. Concurrent writers that
 * observed the same version cannot both acquire the guard.
 */
export async function acquireRoomInventoryGuard({ roomTypeId, tenantId, expectedVersion }) {
  const current = Number(expectedVersion || 0);
  const versionFilter = current === 0
    ? { $or: [{ inventoryVersion: 0 }, { inventoryVersion: { $exists: false } }] }
    : { inventoryVersion: current };
  const updated = await HotelRoomType.findOneAndUpdate(
    { _id: roomTypeId, tenantId, ...versionFilter },
    { $inc: { inventoryVersion: 1 } },
    { new: true }
  ).select("_id inventoryVersion totalRooms").lean();
  return updated || null;
}

export async function currentRoomInventoryVersion({ roomTypeId, tenantId }) {
  const room = await HotelRoomType.findOne({ _id: roomTypeId, tenantId }).select("inventoryVersion totalRooms").lean();
  return room ? { version: Number(room.inventoryVersion || 0), totalRooms: Number(room.totalRooms || 0) } : null;
}
