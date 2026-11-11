/**
 * Purpose: Journal Entry database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare journalLineSchema for use by the surrounding module or function.
const journalLineSchema = new mongoose.Schema({ account: { type: mongoose.Schema.Types.ObjectId, ref: "ChartOfAccount", required: true }, description: { type: String, trim: true, default: "" }, debit: { type: Number, min: 0, default: 0 }, credit: { type: Number, min: 0, default: 0 } }, { _id: true });
// Declare journalEntrySchema for use by the surrounding module or function.
const journalEntrySchema = new mongoose.Schema({ tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true }, entryNumber: { type: String, trim: true }, entryDate: { type: Date, default: Date.now, index: true }, description: { type: String, required: true, trim: true, maxlength: 300 }, reference: { type: String, trim: true, default: "" }, sourceType: { type: String, trim: true, default: "manual" }, sourceId: { type: mongoose.Schema.Types.ObjectId, default: null }, status: { type: String, enum: ["draft", "posted", "void"], default: "draft", index: true }, lines: { type: [journalLineSchema], default: [] }, postedAt: { type: Date, default: null }, postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null } }, { timestamps: true });

// Perform the side effect or state update expressed on the following line.
journalEntrySchema.pre("validate", function(next) { if (!this.lines.length) return next(new Error("Journal entry requires at least two lines.")); const totals = this.lines.reduce((acc, line) => { line.debit = Math.round(Number(line.debit || 0) * 100) / 100; line.credit = Math.round(Number(line.credit || 0) * 100) / 100; if (line.debit > 0 && line.credit > 0) return acc; acc.debit += line.debit; acc.credit += line.credit; return acc; }, { debit: 0, credit: 0 }); if (this.lines.some((line) => line.debit > 0 && line.credit > 0)) return next(new Error("A journal line cannot contain both debit and credit.")); if (this.status === "posted" && Math.abs(totals.debit - totals.credit) > 0.01) return next(new Error("Posted journal entry must balance: debits must equal credits.")); next(); });
// Perform the side effect or state update expressed on the following line.
journalEntrySchema.pre("save", function(next) { if (!this.entryNumber) this.entryNumber = `JE-${Date.now()}-${Math.floor(Math.random() * 10000)}`; next(); });

// Perform the side effect or state update expressed on the following line.
journalEntrySchema.index({ tenantId: 1, entryNumber: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
journalEntrySchema.index({ tenantId: 1, status: 1, entryDate: -1 });
// Perform the side effect or state update expressed on the following line.
journalEntrySchema.index({ tenantId: 1, sourceType: 1, sourceId: 1 }, { unique: true, partialFilterExpression: { sourceId: { $type: "objectId" } } });
// Perform the side effect or state update expressed on the following line.
journalEntrySchema.plugin(tenantPlugin);
export default mongoose.models.JournalEntry || mongoose.model("JournalEntry", journalEntrySchema);
