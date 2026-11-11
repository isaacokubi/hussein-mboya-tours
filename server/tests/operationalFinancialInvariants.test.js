/**
 * Purpose: operational Financial Invariants.test automated test. Main declarations: query, runPreSave.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/ChartOfAccount.js so this module can use its exported dependencies.
import ChartOfAccount from "../models/ChartOfAccount.js";
// Load ../models/Invoice.js so this module can use its exported dependencies.
import Invoice from "../models/Invoice.js";
// Load ../models/InvoiceSequence.js so this module can use its exported dependencies.
import InvoiceSequence from "../models/InvoiceSequence.js";
// Load ../models/JournalEntry.js so this module can use its exported dependencies.
import JournalEntry from "../models/JournalEntry.js";
// Load ../models/TaxProfile.js so this module can use its exported dependencies.
import TaxProfile from "../models/TaxProfile.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ../services/operationalAccountingService.js so this module can use its exported dependencies.
import {
  postExpenseToLedger,
  postInvoiceToLedger,
  postPaymentRefundToLedger,
  postPaymentToLedger,
  postSupplierPayableToLedger,
  postSupplierPaymentToLedger,
  reverseJournalOnce,
} from "../services/operationalAccountingService.js";

// Declare query for use by the surrounding module or function.
const query = (value) => ({
  lean: async () => value,
  // Implement the session method for this class.
  session() { return this; },
  // Implement the sort method for this class.
  sort() { return this; },
});

// Declare runPreSave for use by the surrounding module or function.
const runPreSave = (document) => new Promise((resolve, reject) => {
  // Perform the side effect or state update expressed on the following line.
  Invoice.schema.s.hooks.execPre("save", document, (error) => error ? reject(error) : resolve());
});

// Perform the side effect or state update expressed on the following line.
test("invoice numbering is tenant scoped, profile configured, and zero padded", async () => {
  // Declare previousFindProfile for use by the surrounding module or function.
  const previousFindProfile = TaxProfile.findOne;
  // Declare previousFindSequence for use by the surrounding module or function.
  const previousFindSequence = InvoiceSequence.findOneAndUpdate;
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = new mongoose.Types.ObjectId();
  // Declare sequenceQuery for use by the surrounding module or function.
  let sequenceQuery;
  // Declare sequenceUpdate for use by the surrounding module or function.
  let sequenceUpdate;
  // Declare sequenceOptions for use by the surrounding module or function.
  let sequenceOptions;
  // Declare sequenceCalls for use by the surrounding module or function.
  let sequenceCalls = 0;

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    TaxProfile.findOne = (filter) => {
      // Perform the side effect or state update expressed on the following line.
      assert.equal(String(filter.tenantId), String(tenantId));
      // Return the result of query() to the caller.
      return query({ etimsBranchId: "02", etimsDeviceId: "07", etimsInvoicePrefix: "gt" });
    };
    // Perform the side effect or state update expressed on the following line.
    InvoiceSequence.findOneAndUpdate = async (filter, update, options) => {
      // Perform the side effect or state update expressed on the following line.
      sequenceCalls += 1;
      // Perform the side effect or state update expressed on the following line.
      sequenceQuery = filter;
      // Perform the side effect or state update expressed on the following line.
      sequenceUpdate = update;
      // Perform the side effect or state update expressed on the following line.
      sequenceOptions = options;
      // Return the object assembled below to the caller.
      return { nextNumber: 43 };
    };

    // Declare invoice for use by the surrounding module or function.
    const invoice = new Invoice({ tenantId, totalAmount: 1200, subtotal: 1200 });
    // Perform the side effect or state update expressed on the following line.
    await runWithTenant({ tenantId, role: "admin" }, () => runPreSave(invoice));

    // Perform the side effect or state update expressed on the following line.
    assert.equal(invoice.invoiceNumber, "GT-00000042");
    // Perform the side effect or state update expressed on the following line.
    assert.equal(String(sequenceQuery.tenantId), String(tenantId));
    // Perform the side effect or state update expressed on the following line.
    assert.deepEqual({ branchId: sequenceQuery.branchId, deviceId: sequenceQuery.deviceId, prefix: sequenceQuery.prefix }, {
      branchId: "02", deviceId: "07", prefix: "GT",
    });
    // Perform the side effect or state update expressed on the following line.
    assert.deepEqual(sequenceUpdate, { $inc: { nextNumber: 1 } });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(sequenceOptions.upsert, true);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(sequenceOptions.new, true);

    // Declare missingTenant for use by the surrounding module or function.
    const missingTenant = new Invoice({ totalAmount: 10, subtotal: 10 });
    // Perform the side effect or state update expressed on the following line.
    await assert.rejects(runPreSave(missingTenant), /tenantId/);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(sequenceCalls, 1, "an invoice without tenant identity must not allocate a sequence");
  } finally {
    // Perform the side effect or state update expressed on the following line.
    TaxProfile.findOne = previousFindProfile;
    // Perform the side effect or state update expressed on the following line.
    InvoiceSequence.findOneAndUpdate = previousFindSequence;
  }
});

// Perform the side effect or state update expressed on the following line.
test("invoice, payment, refund, supplier, and reversal journals balance and remain tenant idempotent", async () => {
  // Declare saved for use by the surrounding module or function.
  const saved = {
    bulkWrite: ChartOfAccount.bulkWrite,
    findAccount: ChartOfAccount.findOne,
    findJournal: JournalEntry.findOne,
    createJournal: JournalEntry.create,
    findInvoice: Invoice.findOne,
  };
  // Declare entries for use by the surrounding module or function.
  const entries = [];
  // Declare accountWrites for use by the surrounding module or function.
  const accountWrites = [];
  // Declare tenantA for use by the surrounding module or function.
  const tenantA = new mongoose.Types.ObjectId();
  // Declare tenantB for use by the surrounding module or function.
  const tenantB = new mongoose.Types.ObjectId();
  // Declare invoice for use by the surrounding module or function.
  const invoice = { tenantId: tenantA, _id: "invoice-a", invoiceNumber: "GT-00000042", totalAmount: 1160, tax: 160, status: "pending" };

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    ChartOfAccount.bulkWrite = async (operations) => { accountWrites.push(...operations); };
    // Perform the side effect or state update expressed on the following line.
    ChartOfAccount.findOne = (filter) => query({
      _id: `${String(filter.tenantId)}:${filter.code || "account"}`,
      tenantId: filter.tenantId,
      code: filter.code,
      active: true,
    });
    // Perform the side effect or state update expressed on the following line.
    JournalEntry.findOne = (filter) => query(entries.find((entry) =>
      String(entry.tenantId) === String(filter.tenantId)
      && entry.sourceType === filter.sourceType
      && (filter.sourceId === undefined || String(entry.sourceId) === String(filter.sourceId))
    ) || null);
    // Perform the side effect or state update expressed on the following line.
    JournalEntry.create = async (entry) => {
      // Declare savedEntry for use by the surrounding module or function.
      const savedEntry = { ...entry, _id: new mongoose.Types.ObjectId() };
      // Perform the side effect or state update expressed on the following line.
      entries.push(savedEntry);
      // Return the value of savedEntry to the caller.
      return savedEntry;
    };
    // Perform the side effect or state update expressed on the following line.
    Invoice.findOne = () => query(invoice);

    // Declare invoiceJournal for use by the surrounding module or function.
    const invoiceJournal = await postInvoiceToLedger(invoice);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(invoiceJournal.tenantId, tenantA);
    // Perform the side effect or state update expressed on the following line.
    assert.deepEqual(invoiceJournal.lines.map((line) => [line.account.split(":").at(-1), line.debit, line.credit]), [
      ["1100", 1160, 0], ["4000", 0, 1000], ["2110", 0, 160],
    ]);
    // Perform the side effect or state update expressed on the following line.
    assert.equal(await postInvoiceToLedger(invoice), invoiceJournal, "repeated invoice posting returns the existing journal");

    // Declare payment for use by the surrounding module or function.
    const payment = { tenantId: tenantA, _id: "payment-a", status: "completed", provider: "MPESA", amount: 500, feeAmount: 10, booking: "booking-a" };
    // Declare paymentJournal for use by the surrounding module or function.
    const paymentJournal = await postPaymentToLedger(payment);
    // Perform the side effect or state update expressed on the following line.
    assert.deepEqual(paymentJournal.lines.map((line) => [line.account.split(":").at(-1), line.debit, line.credit]), [
      ["1020", 490, 0], ["1100", 0, 500], ["5260", 10, 0],
    ]);

    // Declare refundJournal for use by the surrounding module or function.
    const refundJournal = await postPaymentRefundToLedger(payment, 200, "REV-A");
    // Perform the side effect or state update expressed on the following line.
    assert.deepEqual(refundJournal.lines.map((line) => [line.account.split(":").at(-1), line.debit, line.credit]), [
      ["4000", 172.41, 0], ["2110", 27.59, 0], ["1020", 0, 200],
    ]);

    // Declare expenseJournal for use by the surrounding module or function.
    const expenseJournal = await postExpenseToLedger({
      tenantId: tenantA, _id: "expense-a", status: "approved", amount: 100, taxAmount: 16,
      supplier: "supplier-a", category: "transport", description: "Fuel", expenseNumber: "EXP-A",
    });
    // Perform the side effect or state update expressed on the following line.
    assert.deepEqual(expenseJournal.lines.map((line) => [line.account.split(":").at(-1), line.debit, line.credit]), [
      ["5020", 100, 0], ["2120", 16, 0], ["2000", 0, 116],
    ]);

    // Declare payableJournal for use by the surrounding module or function.
    const payableJournal = await postSupplierPayableToLedger({ tenantId: tenantA, _id: "payable-a", amount: 300, status: "open" });
    // Perform the side effect or state update expressed on the following line.
    assert.deepEqual(payableJournal.lines.map((line) => [line.account.split(":").at(-1), line.debit, line.credit]), [
      ["5000", 300, 0], ["2000", 0, 300],
    ]);
    // Declare supplierPayment for use by the surrounding module or function.
    const supplierPayment = await postSupplierPaymentToLedger({ tenantId: tenantA, _id: "payable-a", amount: 300 }, 100, "SUP-A", "BANK_TRANSFER");
    // Perform the side effect or state update expressed on the following line.
    assert.deepEqual(supplierPayment.lines.map((line) => [line.account.split(":").at(-1), line.debit, line.credit]), [
      ["2000", 100, 0], ["1010", 0, 100],
    ]);

    // Declare reversal for use by the surrounding module or function.
    const reversal = await reverseJournalOnce({
      tenantId: tenantA, originalJournal: invoiceJournal, sourceType: "invoice_reversal", sourceId: "invoice-a-reversal",
    });
    // Perform the side effect or state update expressed on the following line.
    assert.deepEqual(reversal.lines.map((line) => [line.debit, line.credit]), [[0, 1160], [1000, 0], [160, 0]]);

    // Declare sameSourceOtherTenant for use by the surrounding module or function.
    const sameSourceOtherTenant = await postInvoiceToLedger({ ...invoice, tenantId: tenantB });
    // Perform the side effect or state update expressed on the following line.
    assert.equal(String(sameSourceOtherTenant.tenantId), String(tenantB));
    // Perform the side effect or state update expressed on the following line.
    assert.notEqual(sameSourceOtherTenant, invoiceJournal, "the idempotency lookup must include tenant identity");

    // Repeat the enclosed work for each required iteration.
    for (const entry of entries) {
      // Declare debits for use by the surrounding module or function.
      const debits = entry.lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
      // Declare credits for use by the surrounding module or function.
      const credits = entry.lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
      // Perform the side effect or state update expressed on the following line.
      assert.ok(debits > 0, `${entry.sourceType} has non-zero debits`);
      // Perform the side effect or state update expressed on the following line.
      assert.equal(Math.round(debits * 100), Math.round(credits * 100), `${entry.sourceType} balances to cents`);
    }
    // Perform the side effect or state update expressed on the following line.
    assert.ok(accountWrites.some((operation) => String(operation.updateOne.filter.tenantId) === String(tenantA)));
    // Perform the side effect or state update expressed on the following line.
    assert.ok(accountWrites.some((operation) => String(operation.updateOne.filter.tenantId) === String(tenantB)));
  } finally {
    // Perform the side effect or state update expressed on the following line.
    ChartOfAccount.bulkWrite = saved.bulkWrite;
    // Perform the side effect or state update expressed on the following line.
    ChartOfAccount.findOne = saved.findAccount;
    // Perform the side effect or state update expressed on the following line.
    JournalEntry.findOne = saved.findJournal;
    // Perform the side effect or state update expressed on the following line.
    JournalEntry.create = saved.createJournal;
    // Perform the side effect or state update expressed on the following line.
    Invoice.findOne = saved.findInvoice;
  }
});
