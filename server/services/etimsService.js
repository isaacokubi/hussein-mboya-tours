import Invoice from "../models/Invoice.js";
import TaxProfile from "../models/TaxProfile.js";
import { enqueueJob } from "./jobQueueService.js";

const adapterUrl = () => String(process.env.ETIMS_ADAPTER_URL || "").trim().replace(/\/$/, "");

const buildInvoicePayload = (invoice, profile) => ({
  invoiceId: String(invoice._id),
  invoiceNumber: invoice.invoiceNumber,
  issueDate: invoice.issueDate,
  dueDate: invoice.dueDate,
  currency: "KES",
  buyerPin: invoice.buyerPin || "",
  seller: { kraPin: profile?.kraPin || "" },
  customer: invoice.customerSnapshot || {},
  amounts: { subtotal: invoice.subtotal, discount: invoice.discount, tax: invoice.tax, total: invoice.totalAmount },
  tax: { rate: invoice.taxRate, type: invoice.taxType },
});

export async function enqueueInvoiceForEtims(invoiceId, tenantId) {
  if (!invoiceId || !tenantId) throw new Error("Invoice and tenant are required for eTIMS queueing.");
  return enqueueJob("etims.invoice.submit", { invoiceId: String(invoiceId), tenantId: String(tenantId) }, { tenantId, idempotencyKey: `etims-invoice:${invoiceId}` });
}

export async function processEtimsInvoiceJob(payload) {
  const invoice = await Invoice.findOne({ tenantId: payload.tenantId, _id: payload.invoiceId, isDeleted: { $ne: true } });
  if (!invoice) return;
  const profile = await TaxProfile.findOne({ tenantId: payload.tenantId }).lean();
  if (!profile?.etimsEnabled) {
    invoice.etimsStatus = "not_configured";
    invoice.etimsLastError = "eTIMS is not enabled for this tenant.";
    await invoice.save();
    return;
  }

  const url = adapterUrl();
  if (!url) {
    invoice.etimsStatus = "failed";
    invoice.etimsLastError = "No ETIMS_ADAPTER_URL is configured. Configure a certified eTIMS/OSCU/VSCU adapter before enabling submission.";
    await invoice.save();
    throw new Error(invoice.etimsLastError);
  }

  invoice.etimsStatus = "pending";
  invoice.etimsLastAttemptAt = new Date();
  invoice.etimsSubmissionAttempts = Number(invoice.etimsSubmissionAttempts || 0) + 1;
  await invoice.save();

  const response = await fetch(`${url}/invoices`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(process.env.ETIMS_ADAPTER_TOKEN ? { authorization: `Bearer ${process.env.ETIMS_ADAPTER_TOKEN}` } : {}) },
    body: JSON.stringify(buildInvoicePayload(invoice, profile)),
    signal: AbortSignal.timeout(15000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    invoice.etimsStatus = "failed";
    invoice.etimsLastError = String(body?.message || body?.error || `Adapter returned HTTP ${response.status}`).slice(0, 2000);
    const delayMinutes = Math.min(1440, 5 * (2 ** Math.min(invoice.etimsSubmissionAttempts - 1, 8)));
    invoice.etimsNextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000);
    await invoice.save();
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
  await invoice.save();
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
