import mongoose from "mongoose";
import CalendarReminder from "../models/CalendarReminder.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

const isValidDateOnly = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

export const listCalendarReminders = async (req, res, next) => {
  try {
    requireTenantId();
    const filter = mergeTenantFilter({});
    if (req.query.start || req.query.end) {
      if ((req.query.start && !isValidDateOnly(req.query.start)) || (req.query.end && !isValidDateOnly(req.query.end))) {
        return res.status(400).json({ success: false, message: "Use valid YYYY-MM-DD start/end dates." });
      }
      if (req.query.start && req.query.end && req.query.start > req.query.end) {
        return res.status(400).json({ success: false, message: "Start date must be on or before end date." });
      }
      if (req.query.start || req.query.end) {
        filter.date = {};
        if (req.query.start) filter.date.$gte = req.query.start;
        if (req.query.end) filter.date.$lte = req.query.end;
      }
    }
    const reminders = await CalendarReminder.find(filter).sort({ date: 1, createdAt: 1 }).limit(500).lean();
    return res.status(200).json({ success: true, data: reminders });
  } catch (error) { return next(error); }
};

export const createCalendarReminder = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const date = typeof req.body?.date === "string" ? req.body.date : "";
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    if (!isValidDateOnly(date)) return res.status(400).json({ success: false, message: "A valid reminder date in YYYY-MM-DD format is required." });
    if (!title || title.length > 180) return res.status(400).json({ success: false, message: "Reminder title must contain 1–180 characters." });
    const normalizedTitle = title.toLocaleLowerCase("en");
    const existing = await CalendarReminder.findOne(mergeTenantFilter({ date, normalizedTitle }));
    if (existing) return res.status(409).json({ success: false, message: "That reminder already exists on this date.", data: existing });
    const reminder = await CalendarReminder.create({
      tenantId,
      createdBy: req.user?._id || req.user?.id || null,
      date,
      title,
      normalizedTitle,
    });
    return res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "That reminder already exists on this date." });
    return next(error);
  }
};

export const deleteCalendarReminder = async (req, res, next) => {
  try {
    requireTenantId();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ success: false, message: "Reminder not found." });
    const reminder = await CalendarReminder.findOneAndDelete(mergeTenantFilter({ _id: req.params.id }));
    if (!reminder) return res.status(404).json({ success: false, message: "Reminder not found." });
    return res.status(200).json({ success: true, message: "Reminder removed.", data: { id: String(reminder._id) } });
  } catch (error) { return next(error); }
};
