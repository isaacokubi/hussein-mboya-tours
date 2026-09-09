import CreditDebitNote from "../models/CreditDebitNote.js";
import TaxProfile from "../models/TaxProfile.js";
import { enqueueJob } from "./jobQueueService.js";
const adapterUrl = () => String(process.env.ETIMS_ADAPTER_URL || "").trim().replace(/\/$/, "");
export const enqueueNoteForEtims = async (noteId, tenantId) => enqueueJob("etims.credit_debit_note.submit", { noteId: String(noteId), tenantId: String(tenantId) }, { tenantId, idempotencyKey: `etims-note:${noteId}` });
export async function processEtimsNoteJob(payload) {
  const note = await CreditDebitNote.findOne({ tenantId: payload.tenantId, _id: payload.noteId }); if (!note) return;
  const profile = await TaxProfile.findOne({ tenantId: payload.tenantId }).lean();
  if (!profile?.etimsEnabled) { note.etimsStatus = "not_submitted"; await note.save(); return; }
  const url = adapterUrl(); if (!url) { note.etimsStatus = "failed"; await note.save(); throw new Error("No ETIMS_ADAPTER_URL is configured."); }
  note.etimsStatus = "pending"; note.etimsLastAttemptAt = new Date(); note.etimsSubmissionAttempts = Number(note.etimsSubmissionAttempts || 0) + 1; await note.save();
  const response = await fetch(`${url}/credit-debit-notes`, { method: "POST", headers: { "content-type": "application/json", ...(process.env.ETIMS_ADAPTER_TOKEN ? { authorization: `Bearer ${process.env.ETIMS_ADAPTER_TOKEN}` } : {}) }, body: JSON.stringify({ noteId: String(note._id), noteNumber: note.noteNumber, type: note.type, originalInvoiceNumber: note.originalInvoiceNumber, reason: note.reason, amounts: { amount: note.amount, taxAmount: note.taxAmount, totalAmount: note.totalAmount }, seller: { kraPin: profile.kraPin || "" } }), signal: AbortSignal.timeout(15000) });
  const body = await response.json().catch(() => ({})); if (!response.ok) { note.etimsStatus = "failed"; note.etimsLastError = String(body?.message || body?.error || `Adapter returned HTTP ${response.status}`).slice(0, 2000); await note.save(); throw new Error(note.etimsLastError); }
  note.etimsStatus = "synced"; note.etimsReference = String(body?.reference || body?.noteNumber || body?.etimsReference || ""); note.etimsSubmittedAt = new Date(); note.etimsLastError = ""; await note.save();
}
