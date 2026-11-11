/**
 * Purpose: calendar Reminder Controller HTTP controller. Main declarations: isValidDateOnly, listCalendarReminders, createCalendarReminder, deleteCalendarReminder.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/CalendarReminder.js so this module can use its exported dependencies.
import CalendarReminder from "../models/CalendarReminder.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

// Declare isValidDateOnly for use by the surrounding module or function.
const isValidDateOnly = (value) => {
  // Check the condition (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) and run the matching branch.
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  // Declare [year, month, day] for use by the surrounding module or function.
  const [year, month, day] = value.split("-").map(Number);
  // Declare date for use by the surrounding module or function.
  const date = new Date(Date.UTC(year, month - 1, day));
  // Return the expression shown below to the caller.
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

// Declare listCalendarReminders for use by the surrounding module or function.
export const listCalendarReminders = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare filter for use by the surrounding module or function.
    const filter = mergeTenantFilter({});
    // Check the condition (req.query.start || req.query.end) and run the matching branch.
    if (req.query.start || req.query.end) {
      // Check the condition ((req.query.start && !isValidDateOnly(req.query.start)) || (req.query.e) and run the matching branch.
      if ((req.query.start && !isValidDateOnly(req.query.start)) || (req.query.end && !isValidDateOnly(req.query.end))) {
        // Return the result of res.status(400).json() to the caller.
        return res.status(400).json({ success: false, message: "Use valid YYYY-MM-DD start/end dates." });
      }
      // Check the condition (req.query.start && req.query.end && req.query.start > req.query.end) and run the matching branch.
      if (req.query.start && req.query.end && req.query.start > req.query.end) {
        // Return the result of res.status(400).json() to the caller.
        return res.status(400).json({ success: false, message: "Start date must be on or before end date." });
      }
      // Check the condition (req.query.start || req.query.end) and run the matching branch.
      if (req.query.start || req.query.end) {
        // Perform the side effect or state update expressed on the following line.
        filter.date = {};
        // Check the condition (req.query.start) and run the matching branch.
        if (req.query.start) filter.date.$gte = req.query.start;
        // Check the condition (req.query.end) and run the matching branch.
        if (req.query.end) filter.date.$lte = req.query.end;
      }
    }
    // Declare reminders for use by the surrounding module or function.
    const reminders = await CalendarReminder.find(filter).sort({ date: 1, createdAt: 1 }).limit(500).lean();
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, data: reminders });
  } catch (error) { return next(error); }
};

// Declare createCalendarReminder for use by the surrounding module or function.
export const createCalendarReminder = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare date for use by the surrounding module or function.
    const date = typeof req.body?.date === "string" ? req.body.date : "";
    // Declare title for use by the surrounding module or function.
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    // Check the condition (!isValidDateOnly(date)) and run the matching branch.
    if (!isValidDateOnly(date)) return res.status(400).json({ success: false, message: "A valid reminder date in YYYY-MM-DD format is required." });
    // Check the condition (!title || title.length > 180) and run the matching branch.
    if (!title || title.length > 180) return res.status(400).json({ success: false, message: "Reminder title must contain 1–180 characters." });
    // Declare normalizedTitle for use by the surrounding module or function.
    const normalizedTitle = title.toLocaleLowerCase("en");
    // Declare existing for use by the surrounding module or function.
    const existing = await CalendarReminder.findOne(mergeTenantFilter({ date, normalizedTitle }));
    // Check the condition (existing) and run the matching branch.
    if (existing) return res.status(409).json({ success: false, message: "That reminder already exists on this date.", data: existing });
    // Declare reminder for use by the surrounding module or function.
    const reminder = await CalendarReminder.create({
      tenantId,
      createdBy: req.user?._id || req.user?.id || null,
      date,
      title,
      normalizedTitle,
    });
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "That reminder already exists on this date." });
    // Return the result of next() to the caller.
    return next(error);
  }
};

// Declare deleteCalendarReminder for use by the surrounding module or function.
export const deleteCalendarReminder = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ success: false, message: "Reminder not found." });
    // Declare reminder for use by the surrounding module or function.
    const reminder = await CalendarReminder.findOneAndDelete(mergeTenantFilter({ _id: req.params.id }));
    // Check the condition (!reminder) and run the matching branch.
    if (!reminder) return res.status(404).json({ success: false, message: "Reminder not found." });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Reminder removed.", data: { id: String(reminder._id) } });
  } catch (error) { return next(error); }
};
