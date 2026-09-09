import OperationalAsset from "../models/OperationalAsset.js";

export const assertNoScheduleConflict = async ({ tenantId, assignedTo, startAt, endAt, excludeId = null }) => {
  if (!assignedTo || !startAt || !endAt) return;
  const filter = { tenantId, assignedTo, status: { $nin: ["cancelled", "completed"] }, startAt: { $lt: new Date(endAt) }, endAt: { $gt: new Date(startAt) } };
  if (excludeId) filter._id = { $ne: excludeId };
  const conflict = await OperationalAsset.exists(filter);
  if (conflict) {
    const error = new Error("The assigned resource is already scheduled during this period.");
    error.statusCode = 409;
    throw error;
  }
};

export const createScheduledOperation = async (payload) => {
  await assertNoScheduleConflict(payload);
  return OperationalAsset.create(payload);
};

export const updateScheduledOperation = async (item, updates) => {
  const merged = { tenantId: item.tenantId, assignedTo: updates.assignedTo ?? item.assignedTo, startAt: updates.startAt ?? item.startAt, endAt: updates.endAt ?? item.endAt, excludeId: item._id };
  await assertNoScheduleConflict(merged);
  Object.assign(item, updates);
  return item.save();
};
