/**
 * Purpose: operational Asset Controller HTTP controller. Main declarations: listOperationalAssets, createOperationalAsset, updateOperationalAsset, deleteOperationalAsset.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import OperationalAsset from "../models/OperationalAsset.js";

// Declare allowedTypes for use by the surrounding module or function.
const allowedTypes = new Set(["vehicle", "driver", "guide", "room", "transfer", "park_fee", "voucher", "traveller_document", "incident"]);

// Declare listOperationalAssets for use by the surrounding module or function.
export const listOperationalAssets = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { type, status, bookingId, tourId } for use by the surrounding module or function.
    const { type, status, bookingId, tourId } = req.query;
    // Declare filter for use by the surrounding module or function.
    const filter = { tenantId: req.user.tenantId };
    // Check the condition (type && allowedTypes.has(type)) and run the matching branch.
    if (type && allowedTypes.has(type)) filter.type = type;
    // Check the condition (status) and run the matching branch.
    if (status) filter.status = status;
    // Check the condition (bookingId) and run the matching branch.
    if (bookingId) filter.bookingId = bookingId;
    // Check the condition (tourId) and run the matching branch.
    if (tourId) filter.tourId = tourId;
    // Declare items for use by the surrounding module or function.
    const items = await OperationalAsset.find(filter).sort({ startAt: 1, createdAt: -1 }).lean();
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
};

// Declare createOperationalAsset for use by the surrounding module or function.
export const createOperationalAsset = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { type, name, code, status, bookingId, tourId, assignedTo, startAt, endAt, metadata, notes } for use by the surrounding module or function.
    const { type, name, code, status, bookingId, tourId, assignedTo, startAt, endAt, metadata, notes } = req.body;
    // Check the condition (!allowedTypes.has(type) || !name) and run the matching branch.
    if (!allowedTypes.has(type) || !name) return res.status(400).json({ success: false, message: "type and name are required" });
    // Check the condition (startAt && endAt && new Date(endAt) <= new Date(startAt)) and run the matching branch.
    if (startAt && endAt && new Date(endAt) <= new Date(startAt)) return res.status(400).json({ success: false, message: "endAt must be after startAt" });
    // Declare item for use by the surrounding module or function.
    const item = await OperationalAsset.create({ tenantId: req.user.tenantId, type, name, code, status, bookingId, tourId, assignedTo, startAt, endAt, metadata, notes, createdBy: req.user._id });
    // Perform the side effect or state update expressed on the following line.
    res.status(201).json({ success: true, data: item });
  } catch (error) { next(error); }
};

// Declare updateOperationalAsset for use by the surrounding module or function.
export const updateOperationalAsset = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare item for use by the surrounding module or function.
    const item = await OperationalAsset.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    // Check the condition (!item) and run the matching branch.
    if (!item) return res.status(404).json({ success: false, message: "Operational record not found" });
    // Declare allowed for use by the surrounding module or function.
    const allowed = ["name", "code", "status", "bookingId", "tourId", "assignedTo", "startAt", "endAt", "metadata", "notes"];
    // Repeat the enclosed work for each required iteration.
    for (const key of allowed) if (req.body[key] !== undefined) item[key] = req.body[key];
    // Check the condition (item.startAt && item.endAt && item.endAt <= item.startAt) and run the matching branch.
    if (item.startAt && item.endAt && item.endAt <= item.startAt) return res.status(400).json({ success: false, message: "endAt must be after startAt" });
    // Perform the side effect or state update expressed on the following line.
    item.updatedBy = req.user._id;
    // Perform the side effect or state update expressed on the following line.
    await item.save();
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
};

// Declare deleteOperationalAsset for use by the surrounding module or function.
export const deleteOperationalAsset = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare result for use by the surrounding module or function.
    const result = await OperationalAsset.deleteOne({ _id: req.params.id, tenantId: req.user.tenantId });
    // Check the condition (!result.deletedCount) and run the matching branch.
    if (!result.deletedCount) return res.status(404).json({ success: false, message: "Operational record not found" });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true });
  } catch (error) { next(error); }
};
