import crypto from "crypto";
import InvoiceSequence from "../models/InvoiceSequence.js";
import EtimsCredential, { decryptEtimsSecret, encryptEtimsSecret } from "../models/EtimsCredential.js";

const KRA_SANDBOX = "https://etims-api-sbx.kra.go.ke/etims-api";
const KRA_PRODUCTION = "https://etims-api.kra.go.ke/etims-api";

const baseUrl = (environment = "sandbox") =>
  String(process.env.ETIMS_KRA_API_URL || (environment === "production" ? KRA_PRODUCTION : KRA_SANDBOX)).replace(/\/$/, "");

const nowCompact = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
};

const paymentCode = (method) => ({
  CASH: process.env.ETIMS_PAYMENT_CODE_CASH || "01",
  CARD: process.env.ETIMS_PAYMENT_CODE_CARD || "02",
  MPESA: process.env.ETIMS_PAYMENT_CODE_MPESA || "04",
  BANK_TRANSFER: process.env.ETIMS_PAYMENT_CODE_BANK || "05",
  PAYPAL: process.env.ETIMS_PAYMENT_CODE_PAYPAL || "05",
  PESAPAL: process.env.ETIMS_PAYMENT_CODE_PESAPAL || "05",
})[method] || process.env.ETIMS_PAYMENT_CODE_DEFAULT || "01";

const taxCode = (type) => ({
  EXEMPT: "A",
  STANDARD: "B",
  ZERO_RATED: "C",
  NON_VAT: "D",
  OTHER: "D",
})[type] || "D";

const round2 = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

async function kraPost({ environment, path, body, cmcKey }) {
  const response = await fetch(`${baseUrl(environment)}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(cmcKey ? { cmcKey } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(Number(process.env.ETIMS_KRA_TIMEOUT_MS || 30000)),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`KRA eTIMS HTTP ${response.status}: ${String(payload?.resultMsg || payload?.message || "request failed").slice(0, 1000)}`);
  if (String(payload?.resultCd || "") !== "000") {
    const error = new Error(`KRA eTIMS rejected request (${String(payload?.resultCd || "unknown")}): ${String(payload?.resultMsg || "unknown error").slice(0, 1500)}`);
    error.kraResponse = payload;
    throw error;
  }
  return payload;
}

export async function initializeOscu({ tenantId, environment = "sandbox", pin, branchId, deviceSerial }) {
  if (!tenantId || !pin || !branchId || !deviceSerial) throw new Error("Tenant, KRA PIN, branch ID and device serial are required for OSCU initialization.");
  if (String(branchId).length !== 2) throw new Error("KRA OSCU branch ID must be two characters, e.g. 00.");
  const payload = await kraPost({
    environment,
    path: "/selectInitOsdcInfo",
    body: { tin: String(pin).trim().toUpperCase(), bhfId: String(branchId), dvcSrlNo: String(deviceSerial).trim() },
  });
  const info = payload?.data?.info || payload?.data || {};
  const cmcKey = info?.cmcKey || payload?.cmcKey;
  if (!cmcKey) throw new Error("KRA OSCU initialization succeeded but no communication key was returned.");
  const existing = await EtimsCredential.findOne({ tenantId, environment }).lean();
  const credential = existing ? await EtimsCredential.findOne({ tenantId, environment }) : new EtimsCredential({ tenantId, environment });
  credential.kraPin = String(pin).trim().toUpperCase();
  credential.branchId = String(branchId);
  credential.deviceSerial = String(deviceSerial).trim();
  credential.cmcKeyEncrypted = encryptEtimsSecret(cmcKey);
  credential.credentialRef = String(info?.sdcId || info?.mrcNo || credential.credentialRef || "").trim();
  await credential.save();
  return { result: payload, credentialRef: credential.credentialRef, sdcId: info?.sdcId || "", mrcNo: info?.mrcNo || "" };
}

async function getCmcKey({ tenantId, environment }) {
  const credential = await EtimsCredential.findOne({ tenantId, environment }).lean();
  if (!credential?.cmcKeyEncrypted) throw new Error("OSCU is not initialized for this tenant/environment. Run KRA OSCU initialization first.");
  return decryptEtimsSecret(credential.cmcKeyEncrypted);
}

async function nextKraInvoiceNumber(tenantId, branchId, deviceId) {
  const prefix = "KRA-OSCU";
  const sequence = await InvoiceSequence.findOneAndUpdate(
    { tenantId, branchId, deviceId, prefix },
    { $inc: { nextNumber: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return Math.max(1, Number(sequence.nextNumber || 1) - 1);
}

export async function submitInvoiceToKra({ tenantId, invoice, profile }) {
  const environment = profile.etimsEnvironment || "sandbox";
  const pin = String(profile.kraPin || "").trim().toUpperCase();
  const branchId = String(profile.etimsBranchId || "00").trim() || "00";
  const deviceId = String(profile.etimsDeviceId || "MAIN").trim() || "MAIN";
  if (!pin) throw new Error("KRA PIN is required before OSCU invoice submission.");
  if (branchId.length !== 2) throw new Error("eTIMS branch ID must be two characters.");
  if (profile.etimsSolution !== "OSCU") throw new Error("KRA direct OSCU submission requires TaxProfile.etimsSolution=OSCU.");

  const cmcKey = await getCmcKey({ tenantId, environment });
  const kraInvoiceNo = Number(invoice.etimsKraInvoiceNo || await nextKraInvoiceNumber(tenantId, branchId, deviceId));
  const items = (invoice.items || []).map((item, index) => {
    if (!item.itemCode || !item.itemClassCode) {
      throw new Error(`Invoice line ${index + 1} is missing eTIMS itemCode/itemClassCode. Sync/register the tour service in KRA before submission.`);
    }
    const qty = round2(item.quantity || 1);
    const unitPrice = round2(item.unitPrice);
    const supplyAmount = round2(qty * unitPrice);
    const taxableAmount = round2(item.taxableAmount ?? supplyAmount);
    const taxAmount = round2(item.taxAmount);
    const totalAmount = round2(item.totalAmount ?? (taxableAmount + taxAmount));
    return {
      itemSeq: index + 1,
      itemCd: String(item.itemCode),
      itemClsCd: String(item.itemClassCode),
      itemNm: String(item.description || "Tour service").slice(0, 200),
      bcd: item.barcode || null,
      pkgUnitCd: item.packageUnitCode || "NT",
      pkg: round2(item.packageQuantity || 1),
      qtyUnitCd: item.quantityUnitCode || "U",
      qty,
      prc: unitPrice,
      splyAmt: supplyAmount,
      dcRt: round2(item.discount ? (Number(item.discount) / Math.max(0.01, supplyAmount)) * 100 : 0),
      dcAmt: round2(item.discount),
      taxTyCd: taxCode(item.taxType),
      taxblAmt: taxableAmount,
      taxAmt: taxAmount,
      totAmt: totalAmount,
    };
  });

  const buckets = { A: { taxable: 0, tax: 0, rate: 0 }, B: { taxable: 0, tax: 0, rate: 0 }, C: { taxable: 0, tax: 0, rate: 0 }, D: { taxable: 0, tax: 0, rate: 0 }, E: { taxable: 0, tax: 0, rate: 0 } };
  for (const item of items) {
    const code = item.taxTyCd;
    buckets[code].taxable = round2(buckets[code].taxable + item.taxblAmt);
    buckets[code].tax = round2(buckets[code].tax + item.taxAmt);
    if (code === "B") buckets[code].rate = Number(item.taxRate || invoice.taxRate || profile.defaultVatRate || 16);
  }

  const payload = {
    tin: pin,
    bhfId: branchId,
    trdInvcNo: String(invoice.invoiceNumber),
    invcNo: kraInvoiceNo,
    orgInvcNo: 0,
    custTin: invoice.buyerPin || invoice.customerSnapshot?.buyerPin || null,
    custNm: invoice.customerSnapshot?.name || "Walk-in Customer",
    salesTyCd: "N",
    rcptTyCd: "S",
    pmtTyCd: paymentCode(invoice.paymentMethod),
    salesSttsCd: "02",
    cfmDt: nowCompact(),
    salesDt: nowCompact().slice(0, 8),
    stockRlsDt: nowCompact(),
    cnclReqDt: null,
    cnclDt: null,
    rfdDt: null,
    rfdRsnCd: null,
    totItemCnt: items.length,
    taxblAmtA: buckets.A.taxable,
    taxblAmtB: buckets.B.taxable,
    taxblAmtC: buckets.C.taxable,
    taxblAmtD: buckets.D.taxable,
    taxblAmtE: buckets.E.taxable,
    taxRtA: buckets.A.rate,
    taxRtB: buckets.B.rate,
    taxRtC: buckets.C.rate,
    taxRtD: buckets.D.rate,
    taxRtE: buckets.E.rate,
    taxAmtA: buckets.A.tax,
    taxAmtB: buckets.B.tax,
    taxAmtC: buckets.C.tax,
    taxAmtD: buckets.D.tax,
    taxAmtE: buckets.E.tax,
    totTaxblAmt: round2(items.reduce((sum, item) => sum + item.taxblAmt, 0)),
    totTaxAmt: round2(items.reduce((sum, item) => sum + item.taxAmt, 0)),
    totAmt: round2(invoice.totalAmount),
    prchrAcptcYn: "N",
    remark: invoice.notes || null,
    regrId: String(process.env.ETIMS_REGISTERED_USER_ID || "TOURS"),
    regrNm: String(process.env.ETIMS_REGISTERED_USER_NAME || "Tours System"),
    modrId: String(process.env.ETIMS_REGISTERED_USER_ID || "TOURS"),
    modrNm: String(process.env.ETIMS_REGISTERED_USER_NAME || "Tours System"),
    receipt: {
      custTin: invoice.buyerPin || invoice.customerSnapshot?.buyerPin || null,
      custMblNo: invoice.customerSnapshot?.phone || null,
      rcptPbctDt: nowCompact(),
      trdeNm: profile.etimsBranchName || null,
      adrs: invoice.customerSnapshot?.address || null,
      topMsg: null,
      btmMsg: null,
      prchrAcptcYn: "N",
    },
    itemList: items,
  };

  const response = await kraPost({ environment, path: "/saveTrnsSalesOsdc", body: payload, cmcKey });
  return { payload, response, kraInvoiceNo };
}

export const kraEtimsBaseUrls = { sandbox: KRA_SANDBOX, production: KRA_PRODUCTION };
export const fingerprint = (value) => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
