/**
 * Purpose: etims Invoice Payload.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../services/etimsService.js so this module can use its exported dependencies.
import { buildEtimsInvoicePayload } from "../services/etimsService.js";

// Perform the side effect or state update expressed on the following line.
test("eTIMS invoice payload carries tenant invoice, seller, buyer, tax, payment and line-item data", () => {
  // Declare invoice for use by the surrounding module or function.
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
  // Declare profile for use by the surrounding module or function.
  const profile = { kraPin: "P051234567X", etimsBranchId: "001", etimsBranchName: "Nairobi", etimsDeviceId: "DEVICE-1", etimsTillId: "TILL-1" };

  // Perform the side effect or state update expressed on the following line.
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

// Perform the side effect or state update expressed on the following line.
test("eTIMS payload defaults optional seller, buyer and tax fields without changing the invoice total", () => {
  // Declare payload for use by the surrounding module or function.
  const payload = buildEtimsInvoicePayload({ _id: "invoice-2", subtotal: 5000, discount: 0, totalAmount: 5000 }, null);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(payload.buyerPin, "");
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(payload.seller, { kraPin: "", branchId: "", branchName: "Head Office", deviceId: "", tillId: "" });
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(payload.amounts, { subtotal: 5000, discount: 0, taxableAmount: 5000, tax: undefined, total: 5000 });
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(payload.tax, { rate: undefined, type: undefined, mode: "exclusive" });
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(payload.items, []);
});
