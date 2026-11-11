/**
 * Purpose: Calendar Reminder database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare calendarReminderSchema for use by the surrounding module or function.
const calendarReminderSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  title: { type: String, required: true, trim: true, minlength: 1, maxlength: 180 },
  normalizedTitle: { type: String, required: true, trim: true, lowercase: true },
}, { timestamps: true });

// Perform the side effect or state update expressed on the following line.
calendarReminderSchema.index({ tenantId: 1, date: 1, createdAt: 1 });
// Perform the side effect or state update expressed on the following line.
calendarReminderSchema.index({ tenantId: 1, date: 1, normalizedTitle: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
calendarReminderSchema.plugin(tenantPlugin);

export default mongoose.models.CalendarReminder || mongoose.model("CalendarReminder", calendarReminderSchema);
