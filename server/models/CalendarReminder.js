import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const calendarReminderSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  date: { type: String, required: true, match: /^\\d{4}-\\d{2}-\\d{2}$/ },
  title: { type: String, required: true, trim: true, minlength: 1, maxlength: 180 },
  normalizedTitle: { type: String, required: true, trim: true, lowercase: true },
}, { timestamps: true });

calendarReminderSchema.index({ tenantId: 1, date: 1, createdAt: 1 });
calendarReminderSchema.index({ tenantId: 1, date: 1, normalizedTitle: 1 }, { unique: true });
calendarReminderSchema.plugin(tenantPlugin);

export default mongoose.models.CalendarReminder || mongoose.model("CalendarReminder", calendarReminderSchema);
