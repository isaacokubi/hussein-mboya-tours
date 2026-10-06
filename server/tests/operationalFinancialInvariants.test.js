import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import ChartOfAccount from "../models/ChartOfAccount.js";
import Invoice from "../models/Invoice.js";
import InvoiceSequence from "../models/InvoiceSequence.js";
import JournalEntry from "../models/JournalEntry.js";
import TaxProfile from "../models/TaxProfile.js";
import { runWithTenant } from "../tenancy/context.js";
import {
  postExpenseToLedger,
  postInvoiceToLedger,
  postPaymentRefundToLedger,
  postPaymentToLedger,
  postSupplierPayableToLedger,
  postSupplierPaymentToLedger,
  reverseJournalOnce,
} from "../services/operationalAccountingService.js";

const query = (value) => ({
  lean: async () => value,
  session() { return this; },
  sort() { return this; },
});

const runPreSave = (document) => new Promise((resolve, reject) => {
  Invoice.schema.s.hooks.execPre("save", document, (error) => error ? reject(error) : resolve());
});

test("invoice numbering is tenant scoped, profile configured, and zero padded", async () => {
  const previousFindProfile = TaxProfile.findOne;
  const previousFindSequence = InvoiceSequence.findOneAndUpdate;
  const tenantId = new mongoose.Types.ObjectId();
  let sequenceQuery;
  let sequenceUpdate;
  let sequenceOptions;
  let sequenceCalls = 0;

  try {
    TaxProfile.findOne = (filter) => {
      assert.equal(String(filter.tenantId), String(tenantId));
      return query({ etimsBranchId: "02", etimsDeviceId: "07", etimsInvoicePrefix: "gt" });
    };
    InvoiceSequence.findOneAndUpdate = async (filter, update, options) => {
      sequenceCalls += 1;
      sequenceQuery = filter;
      sequenceUpdate = update;
      sequenceOptions = options;
      return { nextNumber: 43 };
    };

    const invoice = new Invoice({ tenantId, totalAmount: 1200, subtotal: 1200 });
    await runWithTenant({ tenantId, role: "admin" }, () => runPreSave(invoice));

    assert.equal(invoice.invoiceNumber, "GT-00000042");
    assert.equal(String(sequenceQuery.tenantId), String(tenantId));
    assert.deepEqual({ branchId: sequenceQuery.branchId, deviceId: sequenceQuery.deviceId, prefix: sequenceQuery.prefix }, {
      branchId: "02", deviceId: "07", prefix: "GT",
    });
    assert.deepEqual(sequenceUpdate, { $inc: { nextNumber: 1 } });
    assert.equal(sequenceOptions.upsert, true);
    assert.equal(sequenceOptions.new, true);

    const missingTenant = new Invoice({ totalAmount: 10, subtotal: 10 });
    await assert.rejects(runPreSave(missingTenant), /tenantId/);
    assert.equal(sequenceCalls, 1, "an invoice without tenant identity must not allocate a sequence");
  } finally {
    TaxProfile.findOne = previousFindProfile;
    InvoiceSequence.findOneAndUpdate = previousFindSequence;
  }
});

test("invoice, payment, refund, supplier, and reversal journals balance and remain tenant idempotent", async () => {
  const saved = {
    bulkWrite: ChartOfAccount.bulkWrite,
    findAccount: ChartOfAccount.findOne,
    findJournal: JournalEntry.findOne,
    createJournal: JournalEntry.create,
    findInvoice: Invoice.findOne,
  };
  const entries = [];
  const accountWrites = [];
  const tenantA = new mongoose.Types.ObjectId();
  const tenantB = new mongoose.Types.ObjectId();
  const invoice = { tenantId: tenantA, _id: "invoice-a", invoiceNumber: "GT-00000042", totalAmount: 1160, tax: 160, status: "pending" };

  try {
    ChartOfAccount.bulkWrite = async (operations) => { accountWrites.push(...operations); };
    ChartOfAccount.findOne = (filter) => query({
      _id: `${String(filter.tenantId)}:${filter.code || "account"}`,
      tenantId: filter.tenantId,
      code: filter.code,
      active: true,
    });
    JournalEntry.findOne = (filter) => query(entries.find((entry) =>
      String(entry.tenantId) === String(filter.tenantId)
      && entry.sourceType === filter.sourceType
      && (filter.sourceId === undefined || String(entry.sourceId) === String(filter.sourceId))
    ) || null);
    JournalEntry.create = async (entry) => {
      const savedEntry = { ...entry, _id: new mongoose.Types.ObjectId() };
      entries.push(savedEntry);
      return savedEntry;
    };
    Invoice.findOne = () => query(invoice);

    const invoiceJournal = await postInvoiceToLedger(invoice);
    assert.equal(invoiceJournal.tenantId, tenantA);
    assert.deepEqual(invoiceJournal.lines.map((line) => [line.account.split(":").at(-1), line.debit, line.credit]), [
      ["1100", 1160, 0], ["4000", 0, 1000], ["2110", 0, 160],
    ]);
    assert.equal(await postInvoiceToLedger(invoice), invoiceJournal, "repeated invoice posting returns the existing journal");

    const payment = { tenantId: tenantA, _id: "payment-a", status: "completed", provider: "MPESA", amount: 500, feeAmount: 10, booking: "booking-a" };
    const paymentJournal = await postPaymentToLedger(payment);
    assert.deepEqual(paymentJournal.lines.map((line) => [line.account.split(":").at(-1), line.debit, line.credit]), [
      ["1020", 490, 0], ["1100", 0, 500], ["5260", 10, 0],
    ]);

    const refundJournal = await postPaymentRefundToLedger(payment, 200, "REV-A");
    assert.deepEqual(refundJournal.lines.map((line) => [line.account.split(":").at(-1), line.debit, line.credit]), [
      ["4000", 172.41, 0], ["2110", 27.59, 0], ["1020", 0, 200],
    ]);

    const expenseJournal = await postExpenseToLedger({
      tenantId: tenantA, _id: "expense-a", status: "approved", amount: 100, taxAmount: 16,
      supplier: "supplier-a", category: "transport", description: "Fuel", expenseNumber: "EXP-A",
    });
    assert.deepEqual(expenseJournal.lines.map((line) => [line.account.split(":").at(-1), line.debit, line.credit]), [
      ["5020", 100, 0], ["2120", 16, 0], ["2000", 0, 116],
    ]);

    const payableJournal = await postSupplierPayableToLedger({ tenantId: tenantA, _id: "payable-a", amount: 300, status: "open" });
    assert.deepEqual(payableJournal.lines.map((line) => [line.account.split(":").at(-1), line.debit, line.credit]), [
      ["5000", 300, 0], ["2000", 0, 300],
    ]);
    const supplierPayment = await postSupplierPaymentToLedger({ tenantId: tenantA, _id: "payable-a", amount: 300 }, 100, "SUP-A", "BANK_TRANSFER");
    assert.deepEqual(supplierPayment.lines.map((line) => [line.account.split(":").at(-1), line.debit, line.credit]), [
      ["2000", 100, 0], ["1010", 0, 100],
    ]);

    const reversal = await reverseJournalOnce({
      tenantId: tenantA, originalJournal: invoiceJournal, sourceType: "invoice_reversal", sourceId: "invoice-a-reversal",
    });
    assert.deepEqual(reversal.lines.map((line) => [line.debit, line.credit]), [[0, 1160], [1000, 0], [160, 0]]);

    const sameSourceOtherTenant = await postInvoiceToLedger({ ...invoice, tenantId: tenantB });
    assert.equal(String(sameSourceOtherTenant.tenantId), String(tenantB));
    assert.notEqual(sameSourceOtherTenant, invoiceJournal, "the idempotency lookup must include tenant identity");

    for (const entry of entries) {
      const debits = entry.lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
      const credits = entry.lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
      assert.ok(debits > 0, `${entry.sourceType} has non-zero debits`);
      assert.equal(Math.round(debits * 100), Math.round(credits * 100), `${entry.sourceType} balances to cents`);
    }
    assert.ok(accountWrites.some((operation) => String(operation.updateOne.filter.tenantId) === String(tenantA)));
    assert.ok(accountWrites.some((operation) => String(operation.updateOne.filter.tenantId) === String(tenantB)));
  } finally {
    ChartOfAccount.bulkWrite = saved.bulkWrite;
    ChartOfAccount.findOne = saved.findAccount;
    JournalEntry.findOne = saved.findJournal;
    JournalEntry.create = saved.createJournal;
    Invoice.findOne = saved.findInvoice;
  }
});
