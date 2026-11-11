/**
 * Purpose: hospitality Inventory Concurrency Service business-logic service. Main declarations: acquireRoomInventoryGuard, currentRoomInventoryVersion.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import HotelRoomType from "../models/HotelRoomType.js";

/**
 * Optimistic concurrency guard for hotel room inventory.
 * A room type's inventoryVersion is bumped atomically. Concurrent writers that
 * observed the same version cannot both acquire the guard.
 */
// Define acquireRoomInventoryGuard; its parameters and body implement this operation.
export async function acquireRoomInventoryGuard({ roomTypeId, tenantId, expectedVersion }) {
  // Declare current for use by the surrounding module or function.
  const current = Number(expectedVersion || 0);
  // Declare versionFilter for use by the surrounding module or function.
  const versionFilter = current === 0
    ? { $or: [{ inventoryVersion: 0 }, { inventoryVersion: { $exists: false } }] }
    : { inventoryVersion: current };
  // Declare updated for use by the surrounding module or function.
  const updated = await HotelRoomType.findOneAndUpdate(
    { _id: roomTypeId, tenantId, ...versionFilter },
    { $inc: { inventoryVersion: 1 } },
    { new: true }
  ).select("_id inventoryVersion totalRooms").lean();
  // Return the expression shown below to the caller.
  return updated || null;
}

// Define currentRoomInventoryVersion; its parameters and body implement this operation.
export async function currentRoomInventoryVersion({ roomTypeId, tenantId }) {
  // Declare room for use by the surrounding module or function.
  const room = await HotelRoomType.findOne({ _id: roomTypeId, tenantId }).select("inventoryVersion totalRooms").lean();
  // Return the expression shown below to the caller.
  return room ? { version: Number(room.inventoryVersion || 0), totalRooms: Number(room.totalRooms || 0) } : null;
}
