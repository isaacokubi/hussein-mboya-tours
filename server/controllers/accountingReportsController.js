import ChartOfAccount from "../models/ChartOfAccount.js";
import JournalEntry from "../models/JournalEntry.js";
import Invoice from "../models/Invoice.js";
import SupplierPayable from "../models/SupplierPayable.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";

const money = (n) => Math.round(Number(n || 0) * 100) / 100;
const ageBucket = (days) => days <= 0 ? "current" : days <= 30 ? "1_30" : days <= 60 ? "31_60" : days <= 90 ? "61_90" : "90_plus";

const dateFilter = (req, field = "entryDate") => {
  const filter = {};
  if (req.query.from || req.query.to) {
    filter[field] = {};
    if (req.query.from) {
      const from = new Date(req.query.from);
      if (Number.isNaN(from.getTime())) throw new Error("Invalid from date.");
      from.setHours(0, 0, 0, 0);
      filter[field].$gte = from;
    }
    if (req.query.to) {
      const to = new Date(req.query.to);
      if (Number.isNaN(to.getTime())) throw new Error("Invalid to date.");
      to.setHours(23, 59, 59, 999);
      filter[field].$lte = to;
    }
  }
  return filter;
};

const getLedger = async (req) => {
  const accounts = await ChartOfAccount.find({ ...tenantFilter(req), active: { $ne: false } }).sort({ code: 1 }).lean();
  const entries = await JournalEntry.find({ ...tenantFilter(req), status: "posted", ...dateFilter(req) }).select("entryDate lines").lean();
  const balances = new Map(accounts.map((a) => [String(a._id), { account: a, debit: 0, credit: 0 }]));
  for (const entry of entries) for (const line of entry.lines || []) {
    const row = balances.get(String(line.account));
    if (row) { row.debit += Number(line.debit || 0); row.credit += Number(line.credit || 0); }
  }
  return [...balances.values()].map((row) => ({ ...row, debit: money(row.debit), credit: money(row.credit), balance: money(["asset", "expense"].includes(row.account.type) ? row.debit - row.credit : row.credit - row.debit) }));
};

export const getFinancialStatements = async (req, res, next) => {
  try {
    const rows = await getLedger(req);
    const revenue = rows.filter((r) => r.account.type === "revenue");
    const expenses = rows.filter((r) => r.account.type === "expense");
    const assets = rows.filter((r) => r.account.type === "asset");
    const liabilities = rows.filter((r) => r.account.type === "liability");
    const equity = rows.filter((r) => r.account.type === "equity");
    const revenueTotal = money(revenue.reduce((s, r) => s + r.balance, 0));
    const expenseTotal = money(expenses.reduce((s, r) => s + r.balance, 0));
    const netProfit = money(revenueTotal - expenseTotal);
    const assetTotal = money(assets.reduce((s, r) => s + r.balance, 0));
    const liabilityTotal = money(liabilities.reduce((s, r) => s + r.balance, 0));
    const equityTotal = money(equity.reduce((s, r) => s + r.balance, 0));
    const cashAccounts = rows.filter((r) => ["cash", "bank", "mobile_money", "payment_clearing"].includes(r.account.subtype));
    const cashPosition = money(cashAccounts.reduce((s, r) => s + r.balance, 0));
    return res.json({ success: true, data: {
      period: { from: req.query.from || null, to: req.query.to || null },
      profitAndLoss: { revenue: revenue.map((r) => ({ code: r.account.code, name: r.account.name, amount: r.balance })), totalRevenue: revenueTotal, expenses: expenses.map((r) => ({ code: r.account.code, name: r.account.name, amount: r.balance })), totalExpenses: expenseTotal, netProfit },
      balanceSheet: { assets: assets.map((r) => ({ code: r.account.code, name: r.account.name, amount: r.balance })), totalAssets: assetTotal, liabilities: liabilities.map((r) => ({ code: r.account.code, name: r.account.name, amount: r.balance })), totalLiabilities: liabilityTotal, equity: equity.map((r) => ({ code: r.account.code, name: r.account.name, amount: r.balance })), currentYearResult: netProfit, liabilitiesAndEquity: money(liabilityTotal + equityTotal + netProfit), balanced: Math.abs(assetTotal - money(liabilityTotal + equityTotal + netProfit)) <= 0.01 },
      cash: { position: cashPosition, accounts: cashAccounts.map((r) => ({ code: r.account.code, name: r.account.name, amount: r.balance })) },
    }});
  } catch (error) { return next(error); }
};

export const getArAging = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ ...tenantFilter(req), isDeleted: { $ne: true }, status: { $nin: ["draft", "cancelled", "paid"] }, balance: { $gt: 0 } }).select("invoiceNumber issueDate dueDate totalAmount amountPaid balance customerSnapshot buyerPin status").sort({ dueDate: 1 }).lean();
    const buckets = { current: 0, "1_30": 0, "31_60": 0, "61_90": 0, "90_plus": 0 };
    const today = Date.now();
    const data = invoices.map((invoice) => {
      const due = new Date(invoice.dueDate || invoice.issueDate || today).getTime();
      const days = Math.ceil((today - due) / 86400000);
      const bucket = ageBucket(days);
      buckets[bucket] += Number(invoice.balance || 0);
      return { ...invoice, balance: money(invoice.balance), daysOverdue: Math.max(0, days), bucket };
    });
    return res.json({ success: true, data: { buckets: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, money(v)])), totalOutstanding: money(data.reduce((s, r) => s + r.balance, 0)), invoices: data } });
  } catch (error) { return next(error); }
};

export const getApAging = async (req, res, next) => {
  try {
    const filter = tenantFilter(req);
    const payables = await SupplierPayable.find({ ...filter, status: { $nin: ["cancelled", "paid"] }, balance: { $gt: 0 } })
      .populate("supplier", "legalName supplierNumber").sort({ dueDate: 1 }).lean();

    // Supplier-backed expenses can create an AP control entry before a
    // SupplierPayable exists. Include those unpaid liabilities, but exclude
    // expenses already represented by a SupplierPayable to avoid duplication.
    const linkedExpenseIds = new Set(payables.filter((p) => p.expense).map((p) => String(p.expense)));
    const expenses = await (await import("../models/Expense.js")).default.find({
      ...filter,
      supplier: { $ne: null },
      status: "approved",
    }).select("expenseNumber supplier supplierName amount taxAmount expenseDate paidAt purchaseOrder").lean();

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

    const buckets = { current: 0, "1_30": 0, "31_60": 0, "61_90": 0, "90_plus": 0 };
    const today = Date.now();
    const data = rows.map((payable) => {
      const due = new Date(payable.dueDate || today).getTime();
      const days = Math.ceil((today - due) / 86400000);
      const bucket = ageBucket(days);
      buckets[bucket] += Number(payable.balance || 0);
      return { ...payable, balance: money(payable.balance), daysOverdue: Math.max(0, days), bucket };
    });

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

export const getCashFlow = async (req, res, next) => {
  try {
    const filter = { ...tenantFilter(req), status: "posted", ...dateFilter(req) };
    const cashCodes = new Map((await ChartOfAccount.find({ ...tenantFilter(req), code: { $in: ["1000", "1010", "1020", "1030"] } }).select("_id code").lean()).map((a) => [String(a._id), a.code]));
    const entries = await JournalEntry.find(filter).select("entryDate lines description sourceType reference").sort({ entryDate: 1 }).lean();
    const movements = [];
    for (const entry of entries) for (const line of entry.lines || []) {
      const code = cashCodes.get(String(line.account));
      if (!code) continue;
      const amount = money(Number(line.debit || 0) - Number(line.credit || 0));
      if (amount === 0) continue;
      movements.push({ date: entry.entryDate, accountCode: code, amount, description: entry.description, sourceType: entry.sourceType, reference: entry.reference });
    }
    return res.json({ success: true, data: { movements, netMovement: money(movements.reduce((s, m) => s + m.amount, 0)), inflows: money(movements.filter((m) => m.amount > 0).reduce((s, m) => s + m.amount, 0)), outflows: money(Math.abs(movements.filter((m) => m.amount < 0).reduce((s, m) => s + m.amount, 0))) } });
  } catch (error) { return next(error); }
};
