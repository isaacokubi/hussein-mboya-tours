/**
 * Purpose: travel Operations Service business-logic service. Main declarations: assertNoScheduleConflict, createScheduledOperation, updateScheduledOperation.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import OperationalAsset from "../models/OperationalAsset.js";

// Declare assertNoScheduleConflict for use by the surrounding module or function.
export const assertNoScheduleConflict = async ({ tenantId, assignedTo, startAt, endAt, excludeId = null }) => {
  // Check the condition (!assignedTo || !startAt || !endAt) and run the matching branch.
  if (!assignedTo || !startAt || !endAt) return;
  // Declare filter for use by the surrounding module or function.
  const filter = { tenantId, assignedTo, status: { $nin: ["cancelled", "completed"] }, startAt: { $lt: new Date(endAt) }, endAt: { $gt: new Date(startAt) } };
  // Check the condition (excludeId) and run the matching branch.
  if (excludeId) filter._id = { $ne: excludeId };
  // Declare conflict for use by the surrounding module or function.
  const conflict = await OperationalAsset.exists(filter);
  // Check the condition (conflict) and run the matching branch.
  if (conflict) {
    // Declare error for use by the surrounding module or function.
    const error = new Error("The assigned resource is already scheduled during this period.");
    // Perform the side effect or state update expressed on the following line.
    error.statusCode = 409;
    // Stop the current operation by raising the value of error.
    throw error;
  }
};

// Declare createScheduledOperation for use by the surrounding module or function.
export const createScheduledOperation = async (payload) => {
  // Perform the side effect or state update expressed on the following line.
  await assertNoScheduleConflict(payload);
  // Return the result of OperationalAsset.create() to the caller.
  return OperationalAsset.create(payload);
};

// Declare updateScheduledOperation for use by the surrounding module or function.
export const updateScheduledOperation = async (item, updates) => {
  // Declare merged for use by the surrounding module or function.
  const merged = { tenantId: item.tenantId, assignedTo: updates.assignedTo ?? item.assignedTo, startAt: updates.startAt ?? item.startAt, endAt: updates.endAt ?? item.endAt, excludeId: item._id };
  // Perform the side effect or state update expressed on the following line.
  await assertNoScheduleConflict(merged);
  // Perform the side effect or state update expressed on the following line.
  Object.assign(item, updates);
  // Return the result of item.save() to the caller.
  return item.save();
};
