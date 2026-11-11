/**
 * Purpose: accounting Reports Controller HTTP controller. Main declarations: money, ageBucket, dateFilter, getLedger, getFinancialStatements.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import ChartOfAccount from "../models/ChartOfAccount.js";
// Load ../models/JournalEntry.js so this module can use its exported dependencies.
import JournalEntry from "../models/JournalEntry.js";
// Load ../models/Invoice.js so this module can use its exported dependencies.
import Invoice from "../models/Invoice.js";
// Load ../models/SupplierPayable.js so this module can use its exported dependencies.
import SupplierPayable from "../models/SupplierPayable.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";

// Declare money for use by the surrounding module or function.
const money = (n) => Math.round(Number(n || 0) * 100) / 100;
// Declare ageBucket for use by the surrounding module or function.
const ageBucket = (days) => days <= 0 ? "current" : days <= 30 ? "1_30" : days <= 60 ? "31_60" : days <= 90 ? "61_90" : "90_plus";

// Declare dateFilter for use by the surrounding module or function.
const dateFilter = (req, field = "entryDate") => {
  // Declare filter for use by the surrounding module or function.
  const filter = {};
  // Check the condition (req.query.from || req.query.to) and run the matching branch.
  if (req.query.from || req.query.to) {
    // Perform the side effect or state update expressed on the following line.
    filter[field] = {};
    // Check the condition (req.query.from) and run the matching branch.
    if (req.query.from) {
      // Declare from for use by the surrounding module or function.
      const from = new Date(req.query.from);
      // Check the condition (Number.isNaN(from.getTime())) and run the matching branch.
      if (Number.isNaN(from.getTime())) throw new Error("Invalid from date.");
      // Perform the side effect or state update expressed on the following line.
      from.setHours(0, 0, 0, 0);
      // Perform the side effect or state update expressed on the following line.
      filter[field].$gte = from;
    }
    // Check the condition (req.query.to) and run the matching branch.
    if (req.query.to) {
      // Declare to for use by the surrounding module or function.
      const to = new Date(req.query.to);
      // Check the condition (Number.isNaN(to.getTime())) and run the matching branch.
      if (Number.isNaN(to.getTime())) throw new Error("Invalid to date.");
      // Perform the side effect or state update expressed on the following line.
      to.setHours(23, 59, 59, 999);
      // Perform the side effect or state update expressed on the following line.
      filter[field].$lte = to;
    }
  }
  // Return the value of filter to the caller.
  return filter;
};

// Declare getLedger for use by the surrounding module or function.
const getLedger = async (req) => {
  // Declare accounts for use by the surrounding module or function.
  const accounts = await ChartOfAccount.find({ ...tenantFilter(req), active: { $ne: false } }).sort({ code: 1 }).lean();
  // Declare entries for use by the surrounding module or function.
  const entries = await JournalEntry.find({ ...tenantFilter(req), status: "posted", ...dateFilter(req) }).select("entryDate lines").lean();
  // Declare balances for use by the surrounding module or function.
  const balances = new Map(accounts.map((a) => [String(a._id), { account: a, debit: 0, credit: 0 }]));
  // Repeat the enclosed work for each required iteration.
  for (const entry of entries) for (const line of entry.lines || []) {
    // Declare row for use by the surrounding module or function.
    const row = balances.get(String(line.account));
    // Check the condition (row) and run the matching branch.
    if (row) { row.debit += Number(line.debit || 0); row.credit += Number(line.credit || 0); }
  }
  // Return the result of [...balances.values()].map() to the caller.
  return [...balances.values()].map((row) => ({ ...row, debit: money(row.debit), credit: money(row.credit), balance: money(["asset", "expense"].includes(row.account.type) ? row.debit - row.credit : row.credit - row.debit) }));
};

// Declare getFinancialStatements for use by the surrounding module or function.
export const getFinancialStatements = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare rows for use by the surrounding module or function.
    const rows = await getLedger(req);
    // Declare revenue for use by the surrounding module or function.
    const revenue = rows.filter((r) => r.account.type === "revenue");
    // Declare expenses for use by the surrounding module or function.
    const expenses = rows.filter((r) => r.account.type === "expense");
    // Declare assets for use by the surrounding module or function.
    const assets = rows.filter((r) => r.account.type === "asset");
    // Declare liabilities for use by the surrounding module or function.
    const liabilities = rows.filter((r) => r.account.type === "liability");
    // Declare equity for use by the surrounding module or function.
    const equity = rows.filter((r) => r.account.type === "equity");
    // Declare revenueTotal for use by the surrounding module or function.
    const revenueTotal = money(revenue.reduce((s, r) => s + r.balance, 0));
    // Declare expenseTotal for use by the surrounding module or function.
    const expenseTotal = money(expenses.reduce((s, r) => s + r.balance, 0));
    // Declare netProfit for use by the surrounding module or function.
    const netProfit = money(revenueTotal - expenseTotal);
    // Declare assetTotal for use by the surrounding module or function.
    const assetTotal = money(assets.reduce((s, r) => s + r.balance, 0));
    // Declare liabilityTotal for use by the surrounding module or function.
    const liabilityTotal = money(liabilities.reduce((s, r) => s + r.balance, 0));
    // Declare equityTotal for use by the surrounding module or function.
    const equityTotal = money(equity.reduce((s, r) => s + r.balance, 0));
    // Declare cashAccounts for use by the surrounding module or function.
    const cashAccounts = rows.filter((r) => ["cash", "bank", "mobile_money", "payment_clearing"].includes(r.account.subtype));
    // Declare cashPosition for use by the surrounding module or function.
    const cashPosition = money(cashAccounts.reduce((s, r) => s + r.balance, 0));
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: {
      period: { from: req.query.from || null, to: req.query.to || null },
      profitAndLoss: { revenue: revenue.map((r) => ({ code: r.account.code, name: r.account.name, amount: r.balance })), totalRevenue: revenueTotal, expenses: expenses.map((r) => ({ code: r.account.code, name: r.account.name, amount: r.balance })), totalExpenses: expenseTotal, netProfit },
      balanceSheet: { assets: assets.map((r) => ({ code: r.account.code, name: r.account.name, amount: r.balance })), totalAssets: assetTotal, liabilities: liabilities.map((r) => ({ code: r.account.code, name: r.account.name, amount: r.balance })), totalLiabilities: liabilityTotal, equity: equity.map((r) => ({ code: r.account.code, name: r.account.name, amount: r.balance })), currentYearResult: netProfit, liabilitiesAndEquity: money(liabilityTotal + equityTotal + netProfit), balanced: Math.abs(assetTotal - money(liabilityTotal + equityTotal + netProfit)) <= 0.01 },
      cash: { position: cashPosition, accounts: cashAccounts.map((r) => ({ code: r.account.code, name: r.account.name, amount: r.balance })) },
    }});
  } catch (error) { return next(error); }
};

// Declare getArAging for use by the surrounding module or function.
export const getArAging = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare invoices for use by the surrounding module or function.
    const invoices = await Invoice.find({ ...tenantFilter(req), isDeleted: { $ne: true }, status: { $nin: ["draft", "cancelled", "paid"] }, balance: { $gt: 0 } }).select("invoiceNumber issueDate dueDate totalAmount amountPaid balance customerSnapshot buyerPin status").sort({ dueDate: 1 }).lean();
    // Declare buckets for use by the surrounding module or function.
    const buckets = { current: 0, "1_30": 0, "31_60": 0, "61_90": 0, "90_plus": 0 };
    // Declare today for use by the surrounding module or function.
    const today = Date.now();
    // Declare data for use by the surrounding module or function.
    const data = invoices.map((invoice) => {
      // Declare due for use by the surrounding module or function.
      const due = new Date(invoice.dueDate || invoice.issueDate || today).getTime();
      // Declare days for use by the surrounding module or function.
      const days = Math.ceil((today - due) / 86400000);
      // Declare bucket for use by the surrounding module or function.
      const bucket = ageBucket(days);
      // Perform the side effect or state update expressed on the following line.
      buckets[bucket] += Number(invoice.balance || 0);
      // Return the object assembled below to the caller.
      return { ...invoice, balance: money(invoice.balance), daysOverdue: Math.max(0, days), bucket };
    });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: { buckets: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, money(v)])), totalOutstanding: money(data.reduce((s, r) => s + r.balance, 0)), invoices: data } });
  } catch (error) { return next(error); }
};

// Declare getApAging for use by the surrounding module or function.
export const getApAging = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare filter for use by the surrounding module or function.
    const filter = tenantFilter(req);
    // Declare payables for use by the surrounding module or function.
    const payables = await SupplierPayable.find({ ...filter, status: { $nin: ["cancelled", "paid"] }, balance: { $gt: 0 } })
      .populate("supplier", "legalName supplierNumber").sort({ dueDate: 1 }).lean();

    // Supplier-backed expenses can create an AP control entry before a
    // SupplierPayable exists. Include those unpaid liabilities, but exclude
    // expenses already represented by a SupplierPayable to avoid duplication.
    // Declare linkedExpenseIds for use by the surrounding module or function.
    const linkedExpenseIds = new Set(payables.filter((p) => p.expense).map((p) => String(p.expense)));
    // Declare expenses for use by the surrounding module or function.
    const expenses = await (await import("../models/Expense.js")).default.find({
      ...filter,
      supplier: { $ne: null },
      status: "approved",
    }).select("expenseNumber supplier supplierName amount taxAmount expenseDate paidAt purchaseOrder").lean();

    // Declare rows for use by the surrounding module or function.
    const rows = [
      ...payables.map((payable) => ({
        ...payable,
        liabilityType: "supplier_payable",
        balance: money(payable.balance),
        dueDate: payable.dueDate || payable.createdAt,
      })),
      ...expenses
        .filter((expense) => !linkedExpenseIds.has(String(expense._id)))
        .map((expense) => ({
          _id: expense._id,
          expenseNumber: expense.expenseNumber,
          supplier: expense.supplier,
          supplierName: expense.supplierName,
          liabilityType: "supplier_expense",
          amount: money(Number(expense.amount || 0) + Number(expense.taxAmount || 0)),
          amountPaid: 0,
          balance: money(Number(expense.amount || 0) + Number(expense.taxAmount || 0)),
          dueDate: expense.expenseDate,
          status: "open",
        })),
    ];

    // Declare buckets for use by the surrounding module or function.
    const buckets = { current: 0, "1_30": 0, "31_60": 0, "61_90": 0, "90_plus": 0 };
    // Declare today for use by the surrounding module or function.
    const today = Date.now();
    // Declare data for use by the surrounding module or function.
    const data = rows.map((payable) => {
      // Declare due for use by the surrounding module or function.
      const due = new Date(payable.dueDate || today).getTime();
      // Declare days for use by the surrounding module or function.
      const days = Math.ceil((today - due) / 86400000);
      // Declare bucket for use by the surrounding module or function.
      const bucket = ageBucket(days);
      // Perform the side effect or state update expressed on the following line.
      buckets[bucket] += Number(payable.balance || 0);
      // Return the object assembled below to the caller.
      return { ...payable, balance: money(payable.balance), daysOverdue: Math.max(0, days), bucket };
    });

    // Return the result of res.json() to the caller.
    return res.json({
      success: true,
      data: {
        buckets: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, money(v)])),
        totalOutstanding: money(data.reduce((s, r) => s + r.balance, 0)),
        payables: data,
      },
    });
  } catch (error) { return next(error); }
};

// Declare getCashFlow for use by the surrounding module or function.
export const getCashFlow = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare filter for use by the surrounding module or function.
    const filter = { ...tenantFilter(req), status: "posted", ...dateFilter(req) };
    // Declare cashCodes for use by the surrounding module or function.
    const cashCodes = new Map((await ChartOfAccount.find({ ...tenantFilter(req), code: { $in: ["1000", "1010", "1020", "1030"] } }).select("_id code").lean()).map((a) => [String(a._id), a.code]));
    // Declare entries for use by the surrounding module or function.
    const entries = await JournalEntry.find(filter).select("entryDate lines description sourceType reference").sort({ entryDate: 1 }).lean();
    // Declare movements for use by the surrounding module or function.
    const movements = [];
    // Repeat the enclosed work for each required iteration.
    for (const entry of entries) for (const line of entry.lines || []) {
      // Declare code for use by the surrounding module or function.
      const code = cashCodes.get(String(line.account));
      // Check the condition (!code) and run the matching branch.
      if (!code) continue;
      // Declare amount for use by the surrounding module or function.
      const amount = money(Number(line.debit || 0) - Number(line.credit || 0));
      // Check the condition (amount === 0) and run the matching branch.
      if (amount === 0) continue;
      // Perform the side effect or state update expressed on the following line.
      movements.push({ date: entry.entryDate, accountCode: code, amount, description: entry.description, sourceType: entry.sourceType, reference: entry.reference });
    }
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: { movements, netMovement: money(movements.reduce((s, m) => s + m.amount, 0)), inflows: money(movements.filter((m) => m.amount > 0).reduce((s, m) => s + m.amount, 0)), outflows: money(Math.abs(movements.filter((m) => m.amount < 0).reduce((s, m) => s + m.amount, 0))) } });
  } catch (error) { return next(error); }
};
