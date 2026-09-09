import crypto from "crypto";
import Invoice from "../models/Invoice.js";
import TaxProfile from "../models/TaxProfile.js";
import EtimsSubmission from "../models/EtimsSubmission.js";
import { enqueueJob } from "./jobQueueService.js";

const adapterUrl = (profile) => String(profile?.etimsAdapterUrl || process.env.ETIMS_ADAPTER_URL || "").trim().replace(/\/$/, "");
const assertAdapterUrl = (url) => {
  const parsed = new URL(url);
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error("eTIMS adapter URL must use HTTP(S).");
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") throw new Error("Production eTIMS adapter must use HTTPS.");
};

const buildInvoicePayload = (invoice, profile) => ({
  invoiceId: String(invoice._id),
  invoiceNumber: invoice.invoiceNumber,
  issueDate: invoice.issueDate,
  dueDate: invoice.dueDate,
  currency: "KES",
  buyerPin: invoice.buyerPin || "",
  seller: { kraPin: profile?.kraPin || "", branchId: profile?.etimsBranchId || "", branchName: profile?.etimsBranchName || "Head Office", deviceId: profile?.etimsDeviceId || "" },
  customer: invoice.customerSnapshot || {},
  amounts: { subtotal: invoice.subtotal, discount: invoice.discount, taxableAmount: Math.max(0, Number(invoice.subtotal || 0) - Number(invoice.discount || 0)), tax: invoice.tax, total: invoice.totalAmount },
  tax: { rate: invoice.taxRate, type: invoice.taxType, mode: invoice.taxMode || "exclusive" },
  payment: { method: invoice.paymentMethod, reference: invoice.paymentReference || "" },
});

export async function enqueueInvoiceForEtims(invoiceId, tenantId) {
  if (!invoiceId || !tenantId) throw new Error("Invoice and tenant are required for eTIMS queueing.");
  return enqueueJob("etims.invoice.submit", { invoiceId: String(invoiceId), tenantId: String(tenantId) }, { tenantId, idempotencyKey: `etims-invoice:${invoiceId}` });
}

export async function processEtimsInvoiceJob(payload) {
  const invoice = await Invoice.findOne({ tenantId: payload.tenantId, _id: payload.invoiceId, isDeleted: { $ne: true } });
  if (!invoice) return;
  if (invoice.etimsStatus === "synced" && invoice.etimsInvoiceNumber) return;
  const profile = await TaxProfile.findOne({ tenantId: payload.tenantId }).lean();
  if (!profile?.etimsEnabled) {
    invoice.etimsStatus = "not_configured";
    invoice.etimsLastError = "eTIMS is not enabled for this tenant.";
    await invoice.save();
    return;
  }

  const url = adapterUrl(profile);
  if (!url) {
    invoice.etimsStatus = "failed";
    invoice.etimsLastError = "No eTIMS adapter is configured. Configure a certified OSCU/VSCU adapter before enabling production submission.";
    await invoice.save();
    throw new Error(invoice.etimsLastError);
  }
  assertAdapterUrl(url);

  invoice.etimsStatus = "pending";
  invoice.etimsLastAttemptAt = new Date();
  invoice.etimsSubmissionAttempts = Number(invoice.etimsSubmissionAttempts || 0) + 1;
  await invoice.save();

  const requestPayload = buildInvoicePayload(invoice, profile);
  const requestHash = crypto.createHash("sha256").update(JSON.stringify(requestPayload)).digest("hex");
  const attempt = invoice.etimsSubmissionAttempts;
  const idempotencyKey = `etims-invoice:${invoice._id}`;
  const audit = await EtimsSubmission.create({ tenantId: payload.tenantId, documentType: "invoice", documentId: invoice._id, documentNumber: invoice.invoiceNumber, attempt, status: "pending", idempotencyKey, requestHash });

  try {
    const response = await fetch(`${url}/invoices`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-idempotency-key": idempotencyKey, ...(process.env.ETIMS_ADAPTER_TOKEN ? { authorization: `Bearer ${process.env.ETIMS_ADAPTER_TOKEN}` } : {}) },
      body: JSON.stringify(requestPayload),
      signal: AbortSignal.timeout(15000),
    });
    const body = await response.json().catch(() => ({}));
    audit.httpStatus = response.status;
    audit.response = body;
    if (!response.ok) {
      invoice.etimsStatus = "failed";
      invoice.etimsLastError = String(body?.message || body?.error || `Adapter returned HTTP ${response.status}`).slice(0, 2000);
      const delayMinutes = Math.min(1440, 5 * (2 ** Math.min(invoice.etimsSubmissionAttempts - 1, 8)));
      invoice.etimsNextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000);
      audit.status = "failed";
      audit.error = invoice.etimsLastError;
      await Promise.all([invoice.save(), audit.save()]);
      throw new Error(invoice.etimsLastError);
    }

    invoice.etimsStatus = "synced";
    invoice.etimsSubmittedAt = new Date();
    invoice.etimsNextRetryAt = null;
    invoice.etimsLastError = "";
    invoice.etimsResponse = body;
    invoice.etimsInvoiceNumber = String(body?.invoiceNumber || body?.etimsInvoiceNumber || invoice.etimsInvoiceNumber || "");
    invoice.etimsReceiptNumber = String(body?.receiptNumber || body?.etimsReceiptNumber || invoice.etimsReceiptNumber || "");
    invoice.etimsUniqueRegisterIdentifier = String(body?.uniqueRegisterIdentifier || body?.uir || invoice.etimsUniqueRegisterIdentifier || "");
    invoice.etimsQrCode = String(body?.qrCode || invoice.etimsQrCode || "");
    audit.status = "synced";
    audit.submittedAt = invoice.etimsSubmittedAt;
    audit.etimsInvoiceNumber = invoice.etimsInvoiceNumber;
    audit.etimsReceiptNumber = invoice.etimsReceiptNumber;
    audit.uniqueRegisterIdentifier = invoice.etimsUniqueRegisterIdentifier;
    audit.qrCode = invoice.etimsQrCode;
    await Promise.all([invoice.save(), audit.save()]);
  } catch (error) {
    if (audit.status === "pending") {
      audit.status = "failed";
      audit.error = String(error?.message || error).slice(0, 2000);
      await audit.save().catch(() => undefined);
    }
    throw error;
  }
}

export async function enqueueDueEtimsInvoices() {
  const profiles = await TaxProfile.find({ etimsEnabled: true }).select("tenantId").lean();
  let queued = 0;
  for (const profile of profiles) {
    const invoices = await Invoice.find({ tenantId: profile.tenantId, isDeleted: { $ne: true }, etimsStatus: { $in: ["not_configured", "failed", "pending"] }, $or: [{ etimsNextRetryAt: null }, { etimsNextRetryAt: { $lte: new Date() } }] }).select("_id").limit(100).lean();
    for (const invoice of invoices) { await enqueueInvoiceForEtims(invoice._id, profile.tenantId); queued += 1; }
  }
  return queued;
}
