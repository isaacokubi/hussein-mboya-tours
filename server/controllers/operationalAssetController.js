import OperationalAsset from "../models/OperationalAsset.js";

const allowedTypes = new Set(["vehicle", "driver", "guide", "room", "transfer", "park_fee", "voucher", "traveller_document", "incident"]);

export const listOperationalAssets = async (req, res, next) => {
  try {
    const { type, status, bookingId, tourId } = req.query;
    const filter = { tenantId: req.user.tenantId };
    if (type && allowedTypes.has(type)) filter.type = type;
    if (status) filter.status = status;
    if (bookingId) filter.bookingId = bookingId;
    if (tourId) filter.tourId = tourId;
    const items = await OperationalAsset.find(filter).sort({ startAt: 1, createdAt: -1 }).lean();
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
};

export const createOperationalAsset = async (req, res, next) => {
  try {
    const { type, name, code, status, bookingId, tourId, assignedTo, startAt, endAt, metadata, notes } = req.body;
    if (!allowedTypes.has(type) || !name) return res.status(400).json({ success: false, message: "type and name are required" });
    if (startAt && endAt && new Date(endAt) <= new Date(startAt)) return res.status(400).json({ success: false, message: "endAt must be after startAt" });
    const item = await OperationalAsset.create({ tenantId: req.user.tenantId, type, name, code, status, bookingId, tourId, assignedTo, startAt, endAt, metadata, notes, createdBy: req.user._id });
    res.status(201).json({ success: true, data: item });
  } catch (error) { next(error); }
};

export const updateOperationalAsset = async (req, res, next) => {
  try {
    const item = await OperationalAsset.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!item) return res.status(404).json({ success: false, message: "Operational record not found" });
    const allowed = ["name", "code", "status", "bookingId", "tourId", "assignedTo", "startAt", "endAt", "metadata", "notes"];
    for (const key of allowed) if (req.body[key] !== undefined) item[key] = req.body[key];
    if (item.startAt && item.endAt && item.endAt <= item.startAt) return res.status(400).json({ success: false, message: "endAt must be after startAt" });
    item.updatedBy = req.user._id;
    await item.save();
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
};

export const deleteOperationalAsset = async (req, res, next) => {
  try {
    const result = await OperationalAsset.deleteOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!result.deletedCount) return res.status(404).json({ success: false, message: "Operational record not found" });
    res.json({ success: true });
  } catch (error) { next(error); }
};
