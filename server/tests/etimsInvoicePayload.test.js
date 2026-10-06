import assert from "node:assert/strict";
import test from "node:test";
import { buildEtimsInvoicePayload } from "../services/etimsService.js";

test("eTIMS invoice payload carries tenant invoice, seller, buyer, tax, payment and line-item data", () => {
  const invoice = {
    _id: "invoice-1",
    invoiceNumber: "INV-00000001",
    issueDate: new Date("2026-10-01T00:00:00.000Z"),
    dueDate: new Date("2026-10-15T00:00:00.000Z"),
    buyerPin: "P000000000A",
    customerSnapshot: { name: "Demo Customer", email: "customer@example.test" },
    subtotal: 10000,
    discount: 1000,
    tax: 1620,
    totalAmount: 10620,
    taxRate: 18,
    taxType: "VAT",
    taxMode: "exclusive",
    paymentMethod: "MPESA",
    paymentReference: "receipt-1",
    items: [{ description: "Safari", quantity: 1, unitPrice: 10000, discount: 1000, taxableAmount: 9000, taxRate: 18, taxType: "VAT", taxAmount: 1620, totalAmount: 10620 }],
  };
  const profile = { kraPin: "P051234567X", etimsBranchId: "001", etimsBranchName: "Nairobi", etimsDeviceId: "DEVICE-1", etimsTillId: "TILL-1" };

  assert.deepEqual(buildEtimsInvoicePayload(invoice, profile), {
    invoiceId: "invoice-1",
    invoiceNumber: "INV-00000001",
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    currency: "KES",
    receiptType: "INVOICE",
    transactionType: "NORMAL",
    buyerPin: "P000000000A",
    seller: { kraPin: "P051234567X", branchId: "001", branchName: "Nairobi", deviceId: "DEVICE-1", tillId: "TILL-1" },
    customer: invoice.customerSnapshot,
    amounts: { subtotal: 10000, discount: 1000, taxableAmount: 9000, tax: 1620, total: 10620 },
    tax: { rate: 18, type: "VAT", mode: "exclusive" },
    payment: { method: "MPESA", reference: "receipt-1" },
    items: invoice.items,
  });
});

test("eTIMS payload defaults optional seller, buyer and tax fields without changing the invoice total", () => {
  const payload = buildEtimsInvoicePayload({ _id: "invoice-2", subtotal: 5000, discount: 0, totalAmount: 5000 }, null);
  assert.equal(payload.buyerPin, "");
  assert.deepEqual(payload.seller, { kraPin: "", branchId: "", branchName: "Head Office", deviceId: "", tillId: "" });
  assert.deepEqual(payload.amounts, { subtotal: 5000, discount: 0, taxableAmount: 5000, tax: undefined, total: 5000 });
  assert.deepEqual(payload.tax, { rate: undefined, type: undefined, mode: "exclusive" });
  assert.deepEqual(payload.items, []);
});
