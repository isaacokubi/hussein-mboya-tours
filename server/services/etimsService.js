/**
 * Purpose: etims Service business-logic service. Main declarations: adapterUrl, getEtimsConfirmation, isPrivateAddress, assertAdapterUrl, isRetryableEtimsHttpStatus.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import crypto from "crypto";
// Load dns/promises so this module can use its exported dependencies.
import dns from "dns/promises";
// Load net so this module can use its exported dependencies.
import net from "net";
// Load ../models/Invoice.js so this module can use its exported dependencies.
import Invoice from "../models/Invoice.js";
// Load ../models/TaxProfile.js so this module can use its exported dependencies.
import TaxProfile from "../models/TaxProfile.js";
// Load ../models/EtimsCredential.js so this module can use its exported dependencies.
import EtimsCredential, { decryptEtimsSecret } from "../models/EtimsCredential.js";
// Load ../models/EtimsSubmission.js so this module can use its exported dependencies.
import EtimsSubmission from "../models/EtimsSubmission.js";
// Load ./jobQueueService.js so this module can use its exported dependencies.
import { enqueueJob } from "./jobQueueService.js";
// Load ./jobRetryService.js so this module can use its exported dependencies.
import { retryDeadJob } from "./jobRetryService.js";

// Declare adapterUrl for use by the surrounding module or function.
const adapterUrl = (profile) => String(profile?.etimsAdapterUrl || process.env.ETIMS_ADAPTER_URL || "").trim().replace(/\/$/, "");

// Define getEtimsConfirmation; its parameters and body implement this operation.
export function getEtimsConfirmation(httpOk, body) {
  // Check the condition (!httpOk || body?.success !== true) and run the matching branch.
  if (!httpOk || body?.success !== true) return null;
  // Declare invoiceNumber for use by the surrounding module or function.
  const invoiceNumber = String(body.invoiceNumber || body.etimsInvoiceNumber || "").trim();
  // Declare receiptReference for use by the surrounding module or function.
  const receiptReference = String(body.receiptNumber || body.etimsReceiptNumber || body.uniqueRegisterIdentifier || body.uir || "").trim();
  // Check the condition (!invoiceNumber || !receiptReference) and run the matching branch.
  if (!invoiceNumber || !receiptReference) return null;
  // Return the object assembled below to the caller.
  return {
    invoiceNumber,
    receiptReference,
    uniqueRegisterIdentifier: String(body.uniqueRegisterIdentifier || body.uir || "").trim(),
    qrCode: String(body.qrCode || "").trim(),
  };
}

// Define isPrivateAddress; its parameters and body implement this operation.
function isPrivateAddress(address) {
  // Check the condition (net.isIPv4(address)) and run the matching branch.
  if (net.isIPv4(address)) {
    // Declare [a, b] for use by the surrounding module or function.
    const [a, b] = address.split(".").map(Number);
    // Return the expression shown below to the caller.
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 0) || (a === 192 && b === 168) || (a === 198 && (b === 18 || b === 19));
  }
  // Check the condition (net.isIPv6(address)) and run the matching branch.
  if (net.isIPv6(address)) {
    // Declare value for use by the surrounding module or function.
    const value = address.toLowerCase();
    // Return the expression shown below to the caller.
    return value === "::" || value === "::1" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:") || value.startsWith("ff");
  }
  // Return the expression shown below to the caller.
  return true;
}

// Define assertAdapterUrl; its parameters and body implement this operation.
async function assertAdapterUrl(rawUrl) {
  // Declare parsed for use by the surrounding module or function.
  let parsed;
  // Run this operation with a dedicated error-handling path for failures.
  try { parsed = new URL(rawUrl); } catch { throw new Error("Invalid eTIMS adapter URL."); }
  // Check the condition (!["https:", "http:"].includes(parsed.protocol)) and run the matching branch.
  if (!["https:", "http:"].includes(parsed.protocol)) throw new Error("eTIMS adapter URL must use HTTP(S).");
  // Check the condition (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") and run the matching branch.
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") throw new Error("Production eTIMS adapter must use HTTPS.");
  // Check the condition (parsed.username || parsed.password) and run the matching branch.
  if (parsed.username || parsed.password) throw new Error("eTIMS adapter URL must not contain credentials.");
  // Declare host for use by the surrounding module or function.
  const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  // Check the condition (["localhost", "localhost.localdomain", "metadata.google.internal", "me) and run the matching branch.
  if (["localhost", "localhost.localdomain", "metadata.google.internal", "metadata", "host.docker.internal"].includes(host) || (net.isIP(host) && isPrivateAddress(host))) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("eTIMS adapter cannot target a private or local address.");
  }
  // Check the condition (!net.isIP(host)) and run the matching branch.
  if (!net.isIP(host)) {
    // Declare records for use by the surrounding module or function.
    const records = await dns.lookup(host, { all: true, verbatim: true });
    // Check the condition (!records.length || records.some(({ address }) => isPrivateAddress(addr) and run the matching branch.
    if (!records.length || records.some(({ address }) => isPrivateAddress(address))) throw new Error("eTIMS adapter hostname resolves to a private or local address.");
  }
  // Return the result of parsed.toString().replace() to the caller.
  return parsed.toString().replace(/\/$/, "");
}

// Declare isRetryableEtimsHttpStatus for use by the surrounding module or function.
const isRetryableEtimsHttpStatus = (status) => {
  // Declare code for use by the surrounding module or function.
  const code = Number(status);
  // Return the expression shown below to the caller.
  return code === 408 || code === 429 || code >= 500;
};

// Declare nextEtimsRetryAt for use by the surrounding module or function.
const nextEtimsRetryAt = (attempt) =>
  new Date(Date.now() + Math.min(1440, 5 * (2 ** Math.min(Number(attempt || 1) - 1, 8))) * 60 * 1000);

// Declare adapterToken for use by the surrounding module or function.
const adapterToken = async (tenantId, environment) => {
  // Declare credential for use by the surrounding module or function.
  const credential = await EtimsCredential.findOne({ tenantId, environment }).select("+adapterTokenEncrypted").lean();
  // Return the expression shown below to the caller.
  return credential?.adapterTokenEncrypted ? decryptEtimsSecret(credential.adapterTokenEncrypted) : String(process.env.ETIMS_ADAPTER_TOKEN || "");
};

// Declare buildEtimsInvoicePayload for use by the surrounding module or function.
export const buildEtimsInvoicePayload = (invoice, profile) => ({
  invoiceId: String(invoice._id), invoiceNumber: invoice.invoiceNumber, issueDate: invoice.issueDate, dueDate: invoice.dueDate,
  currency: "KES", receiptType: "INVOICE", transactionType: "NORMAL", buyerPin: invoice.buyerPin || "",
  seller: { kraPin: profile?.kraPin || "", branchId: profile?.etimsBranchId || "", branchName: profile?.etimsBranchName || "Head Office", deviceId: profile?.etimsDeviceId || "", tillId: profile?.etimsTillId || "" },
  customer: invoice.customerSnapshot || {},
  amounts: { subtotal: invoice.subtotal, discount: invoice.discount, taxableAmount: Math.max(0, Number(invoice.subtotal || 0) - Number(invoice.discount || 0)), tax: invoice.tax, total: invoice.totalAmount },
  tax: { rate: invoice.taxRate, type: invoice.taxType, mode: invoice.taxMode || "exclusive" },
  payment: { method: invoice.paymentMethod, reference: invoice.paymentReference || "" },
  items: (invoice.items || []).map((item) => ({ description: item.description, quantity: item.quantity, unitPrice: item.unitPrice, discount: item.discount, taxableAmount: item.taxableAmount, taxRate: item.taxRate, taxType: item.taxType, taxAmount: item.taxAmount, totalAmount: item.totalAmount })),
});

// Define enqueueInvoiceForEtims; its parameters and body implement this operation.
export async function enqueueInvoiceForEtims(invoiceId, tenantId, { manualRetry = false } = {}) {
  // Check the condition (!invoiceId || !tenantId) and run the matching branch.
  if (!invoiceId || !tenantId) throw new Error("Invoice and tenant are required for eTIMS queueing.");
  // Declare idempotencyKey for use by the surrounding module or function.
  const idempotencyKey = `etims-invoice:${invoiceId}`;
  // Check the condition (manualRetry) and run the matching branch.
  if (manualRetry) await retryDeadJob({ tenantId, idempotencyKey });
  // Return the result of enqueueJob() to the caller.
  return enqueueJob("etims.invoice.submit", { invoiceId: String(invoiceId), tenantId: String(tenantId) }, { tenantId, idempotencyKey });
}

// Define createSubmissionAudit; its parameters and body implement this operation.
async function createSubmissionAudit({ tenantId, invoice, attempt, requestHash, idempotencyKey }) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Return the completed the result of EtimsSubmission.create() operation to the caller.
    return await EtimsSubmission.create({ tenantId, documentType: "invoice", documentId: invoice._id, documentNumber: invoice.invoiceNumber, attempt, status: "pending", idempotencyKey, requestHash });
  } catch (error) {
    // Check the condition (error?.code !== 11000) and run the matching branch.
    if (error?.code !== 11000) throw error;
    // Return the result of EtimsSubmission.findOne() to the caller.
    return EtimsSubmission.findOne({ tenantId, documentType: "invoice", documentId: invoice._id, attempt });
  }
}

// Define processEtimsInvoiceJob; its parameters and body implement this operation.
export async function processEtimsInvoiceJob(payload) {
  // Declare invoice for use by the surrounding module or function.
  const invoice = await Invoice.findOne({ tenantId: payload.tenantId, _id: payload.invoiceId, isDeleted: { $ne: true } });
  // Check the condition (!invoice) and run the matching branch.
  if (!invoice) return;
  // Check the condition (invoice.etimsStatus === "synced" && invoice.etimsInvoiceNumber) and run the matching branch.
  if (invoice.etimsStatus === "synced" && invoice.etimsInvoiceNumber) return;

  // Declare profile for use by the surrounding module or function.
  const profile = await TaxProfile.findOne({ tenantId: payload.tenantId }).lean();
  // Check the condition (!profile?.etimsEnabled) and run the matching branch.
  if (!profile?.etimsEnabled) {
    // Perform the side effect or state update expressed on the following line.
    invoice.etimsStatus = "not_configured";
    // Perform the side effect or state update expressed on the following line.
    invoice.etimsLastError = "eTIMS is not enabled for this tenant.";
    // Perform the side effect or state update expressed on the following line.
    await invoice.save();
    // Return the result to the caller.
    return;
  }

  // Declare configuredUrl for use by the surrounding module or function.
  const configuredUrl = adapterUrl(profile);
  // Check the condition (!configuredUrl) and run the matching branch.
  if (!configuredUrl) {
    // Perform the side effect or state update expressed on the following line.
    invoice.etimsStatus = "failed";
    // Perform the side effect or state update expressed on the following line.
    invoice.etimsLastError = "No eTIMS adapter is configured. Configure a certified OSCU/VSCU adapter before enabling production submission.";
    // Perform the side effect or state update expressed on the following line.
    await invoice.save();
    // Stop the current operation by raising a new Error instance.
    throw new Error(invoice.etimsLastError);
  }
  // Declare url for use by the surrounding module or function.
  const url = await assertAdapterUrl(configuredUrl);
  // Declare token for use by the surrounding module or function.
  const token = await adapterToken(payload.tenantId, profile.etimsEnvironment || "sandbox");

  // Perform the side effect or state update expressed on the following line.
  invoice.etimsStatus = "pending";
  // Perform the side effect or state update expressed on the following line.
  invoice.etimsLastAttemptAt = new Date();
  // Perform the side effect or state update expressed on the following line.
  invoice.etimsSubmissionAttempts = Number(invoice.etimsSubmissionAttempts || 0) + 1;
  // Perform the side effect or state update expressed on the following line.
  await invoice.save();

  // Declare requestPayload for use by the surrounding module or function.
  const requestPayload = buildEtimsInvoicePayload(invoice, profile);
  // Declare requestHash for use by the surrounding module or function.
  const requestHash = crypto.createHash("sha256").update(JSON.stringify(requestPayload)).digest("hex");
  // Declare attempt for use by the surrounding module or function.
  const attempt = invoice.etimsSubmissionAttempts;
  // Declare idempotencyKey for use by the surrounding module or function.
  const idempotencyKey = `etims-invoice:${invoice._id}`;
  // Declare audit for use by the surrounding module or function.
  const audit = await createSubmissionAudit({ tenantId: payload.tenantId, invoice, attempt, requestHash, idempotencyKey });

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare response for use by the surrounding module or function.
    const response = await fetch(`${url}/invoices`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-idempotency-key": idempotencyKey, ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(requestPayload),
      signal: AbortSignal.timeout(15000),
    });
    // Declare body for use by the surrounding module or function.
    const body = await response.json().catch(() => ({}));
    // Perform the side effect or state update expressed on the following line.
    audit.httpStatus = response.status;
    // Perform the side effect or state update expressed on the following line.
    audit.response = body;
    // Declare confirmation for use by the surrounding module or function.
    const confirmation = getEtimsConfirmation(response.ok, body);

    // Check the condition (!confirmation) and run the matching branch.
    if (!confirmation) {
      // Perform the side effect or state update expressed on the following line.
      invoice.etimsStatus = "failed";
      // Perform the side effect or state update expressed on the following line.
      invoice.etimsLastError = String(body?.message || body?.error || (!response.ok
        ? `Adapter returned HTTP ${response.status}`
        : "Adapter response did not include explicit success and official eTIMS invoice and receipt references.")).slice(0, 2000);
      // Declare retryable for use by the surrounding module or function.
      const retryable = !response.ok && isRetryableEtimsHttpStatus(response.status);
      // Perform the side effect or state update expressed on the following line.
      invoice.etimsNextRetryAt = retryable ? nextEtimsRetryAt(invoice.etimsSubmissionAttempts) : null;
      // Perform the side effect or state update expressed on the following line.
      audit.status = "failed";
      // Perform the side effect or state update expressed on the following line.
      audit.error = invoice.etimsLastError;
      // Perform the side effect or state update expressed on the following line.
      await Promise.all([invoice.save(), audit.save()]);
      // Check the condition (retryable) and run the matching branch.
      if (retryable) throw new Error(invoice.etimsLastError);
      // Return the result to the caller.
      return;
    }

    // Perform the side effect or state update expressed on the following line.
    invoice.etimsStatus = "synced";
    // Perform the side effect or state update expressed on the following line.
    invoice.etimsSubmittedAt = new Date();
    // Perform the side effect or state update expressed on the following line.
    invoice.etimsNextRetryAt = null;
    // Perform the side effect or state update expressed on the following line.
    invoice.etimsLastError = "";
    // Perform the side effect or state update expressed on the following line.
    invoice.etimsResponse = body;
    // Perform the side effect or state update expressed on the following line.
    invoice.etimsInvoiceNumber = confirmation.invoiceNumber;
    // Perform the side effect or state update expressed on the following line.
    invoice.etimsReceiptNumber = confirmation.receiptReference;
    // Perform the side effect or state update expressed on the following line.
    invoice.etimsUniqueRegisterIdentifier = confirmation.uniqueRegisterIdentifier;
    // Perform the side effect or state update expressed on the following line.
    invoice.etimsQrCode = confirmation.qrCode;
    // Perform the side effect or state update expressed on the following line.
    audit.status = "synced";
    // Perform the side effect or state update expressed on the following line.
    audit.submittedAt = invoice.etimsSubmittedAt;
    // Perform the side effect or state update expressed on the following line.
    audit.etimsInvoiceNumber = invoice.etimsInvoiceNumber;
    // Perform the side effect or state update expressed on the following line.
    audit.etimsReceiptNumber = invoice.etimsReceiptNumber;
    // Perform the side effect or state update expressed on the following line.
    audit.uniqueRegisterIdentifier = invoice.etimsUniqueRegisterIdentifier;
    // Perform the side effect or state update expressed on the following line.
    audit.qrCode = invoice.etimsQrCode;
    // Perform the side effect or state update expressed on the following line.
    await Promise.all([invoice.save(), audit.save()]);
  } catch (error) {
    // Check the condition (audit.status === "pending") and run the matching branch.
    if (audit.status === "pending") {
      // Perform the side effect or state update expressed on the following line.
      invoice.etimsStatus = "failed";
      // Perform the side effect or state update expressed on the following line.
      invoice.etimsLastError = String(error?.message || error || "eTIMS submission failed").slice(0, 2000);
      // Perform the side effect or state update expressed on the following line.
      invoice.etimsNextRetryAt = nextEtimsRetryAt(invoice.etimsSubmissionAttempts);
      // Perform the side effect or state update expressed on the following line.
      await invoice.save().catch(() => undefined);
      // Perform the side effect or state update expressed on the following line.
      audit.status = "failed";
      // Perform the side effect or state update expressed on the following line.
      audit.error = invoice.etimsLastError;
      // Perform the side effect or state update expressed on the following line.
      await audit.save().catch(() => undefined);
    }
    // Stop the current operation by raising the value of error.
    throw error;
  }
}

// Define enqueueDueEtimsInvoices; its parameters and body implement this operation.
export async function enqueueDueEtimsInvoices() {
  // Declare profiles for use by the surrounding module or function.
  const profiles = await TaxProfile.find({ etimsEnabled: true }).select("tenantId").lean();
  // Declare queued for use by the surrounding module or function.
  let queued = 0;
  // Repeat the enclosed work for each required iteration.
  for (const profile of profiles) {
    // Declare invoices for use by the surrounding module or function.
    const invoices = await Invoice.find({
      tenantId: profile.tenantId,
      isDeleted: { $ne: true },
      $or: [
        { etimsStatus: "pending" },
        { etimsStatus: "failed", etimsNextRetryAt: { $ne: null, $lte: new Date() } },
      ],
    }).select("_id").limit(100).lean();
    // Repeat the enclosed work for each required iteration.
    for (const invoice of invoices) {
      // Perform the side effect or state update expressed on the following line.
      await enqueueInvoiceForEtims(invoice._id, profile.tenantId);
      // Perform the side effect or state update expressed on the following line.
      queued += 1;
    }
  }
  // Return the value of queued to the caller.
  return queued;
}
