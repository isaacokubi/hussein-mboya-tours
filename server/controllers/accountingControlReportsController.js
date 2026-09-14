import JournalEntry from "../models/JournalEntry.js";
import ChartOfAccount from "../models/ChartOfAccount.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

const money = (n) => Math.round(Number(n || 0) * 100) / 100;
const TAX_ACCOUNT_CODES = ["2110", "2120", "2130", "2140", "2150"];

async function journalBalances(tenantId, from, to, codes = TAX_ACCOUNT_CODES) {
  const accounts = await ChartOfAccount.find({ tenantId, code: { $in: codes }, active: true }).lean();
  const ids = new Map(accounts.map((a) => [String(a._id), a]));
  const filter = { tenantId, status: "posted" };
  if (from || to) {
    filter.entryDate = {
      ...(from ? { $gte: new Date(`${from}T00:00:00.000Z`) } : {}),
      ...(to ? { $lt: new Date(`${to}T23:59:59.999Z`) } : {}),
    };
  }
  const entries = await JournalEntry.find(filter).select("entryDate reference description lines").lean();
  const balances = new Map();
  for (const entry of entries) {
    for (const line of entry.lines || []) {
      const account = ids.get(String(line.account));
      if (!account) continue;
      const row = balances.get(account.code) || {
        code: account.code,
        name: account.name,
        type: account.type,
        debit: 0,
        credit: 0,
      };
      row.debit += Number(line.debit || 0);
      row.credit += Number(line.credit || 0);
      balances.set(account.code, row);
    }
  }
  return [...balances.values()].map((row) => ({
    ...row,
    debit: money(row.debit),
    credit: money(row.credit),
    balance: money(["asset", "expense"].includes(row.type) ? row.debit - row.credit : row.credit - row.debit),
  }));
}

const periodFilter = (from, to) => {
  if (!from && !to) return {};
  return {
    issueDate: {
      ...(from ? { $gte: new Date(`${from}T00:00:00.000Z`) } : {}),
      ...(to ? { $lt: new Date(`${to}T23:59:59.999Z`) } : {}),
    },
  };
};

export const getTaxControlReport = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const rows = await journalBalances(tenantId, req.query.from, req.query.to);
    const by = new Map(rows.map((row) => [row.code, row]));
    const output = by.get("2110")?.balance || 0;
    const input = by.get("2120")?.balance || 0;
    const wht = by.get("2130")?.balance || 0;
    return res.json({
      success: true,
      data: {
        period: { from: req.query.from || null, to: req.query.to || null },
        rows,
        outputVat: money(output),
        inputVat: money(input),
        netVat: money(output - input),
        withholdingTaxPayable: money(wht),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerLedgerReport = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const account = await ChartOfAccount.findOne({ tenantId, code: "1100", active: true }).lean();
    if (!account) return res.json({ success: true, data: { account: "1100", rows: [], closingBalance: 0 } });
    const dateFilter = req.query.from || req.query.to
      ? {
          entryDate: {
            ...(req.query.from ? { $gte: new Date(`${req.query.from}T00:00:00.000Z`) } : {}),
            ...(req.query.to ? { $lt: new Date(`${req.query.to}T23:59:59.999Z`) } : {}),
          },
        }
      : {};
    const rows = await JournalEntry.aggregate([
      { $match: { tenantId, status: "posted", ...dateFilter } },
      { $unwind: "$lines" },
      { $match: { "lines.account": account._id } },
      { $project: { _id: 1, entryDate: 1, entryNumber: 1, reference: 1, description: 1, debit: "$lines.debit", credit: "$lines.credit" } },
      { $sort: { entryDate: 1, _id: 1 } },
    ]);
    let balance = 0;
    const data = rows.map((row) => {
      balance += Number(row.debit || 0) - Number(row.credit || 0);
      return {
        ...row,
        debit: money(row.debit),
        credit: money(row.credit),
        balance: money(balance),
      };
    });
    return res.json({ success: true, data: { account: "1100", rows: data, closingBalance: money(balance) } });
  } catch (error) {
    next(error);
  }
};

export const getSupplierLedgerReport = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const account = await ChartOfAccount.findOne({ tenantId, code: "2000", active: true }).lean();
    if (!account) return res.json({ success: true, data: { account: "2000", rows: [], closingBalance: 0 } });
    const dateFilter = req.query.from || req.query.to
      ? {
          entryDate: {
            ...(req.query.from ? { $gte: new Date(`${req.query.from}T00:00:00.000Z`) } : {}),
            ...(req.query.to ? { $lt: new Date(`${req.query.to}T23:59:59.999Z`) } : {}),
          },
        }
      : {};
    const rows = await JournalEntry.aggregate([
      { $match: { tenantId, status: "posted", ...dateFilter } },
      { $unwind: "$lines" },
      { $match: { "lines.account": account._id } },
      { $project: { _id: 1, entryDate: 1, entryNumber: 1, reference: 1, description: 1, debit: "$lines.debit", credit: "$lines.credit" } },
      { $sort: { entryDate: 1, _id: 1 } },
    ]);
    let balance = 0;
    const data = rows.map((row) => {
      balance += Number(row.credit || 0) - Number(row.debit || 0);
      return {
        ...row,
        debit: money(row.debit),
        credit: money(row.credit),
        balance: money(balance),
      };
    });
    return res.json({ success: true, data: { account: "2000", rows: data, closingBalance: money(balance) } });
  } catch (error) {
    next(error);
  }
};

export const getProfitabilityReport = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const invoiceFilter = mergeTenantFilter(req, {
      isDeleted: { $ne: true },
      status: { $nin: ["draft", "cancelled"] },
      ...periodFilter(req.query.from, req.query.to),
    });
    const paymentFilter = mergeTenantFilter(req, {});
    if (req.query.from || req.query.to) {
      paymentFilter.paidAt = {
        ...(req.query.from ? { $gte: new Date(`${req.query.from}T00:00:00.000Z`) } : {}),
        ...(req.query.to ? { $lt: new Date(`${req.query.to}T23:59:59.999Z`) } : {}),
      };
    }
    const [invoices, payments] = await Promise.all([
      Invoice.find(invoiceFilter).select("booking hospitalityType totalAmount status issueDate").lean(),
      Payment.find(paymentFilter).select("booking hospitalityType amount refundedAmount status paidAt").lean(),
    ]);
    const groups = new Map();
    for (const invoice of invoices) {
      const key = invoice.hospitalityType || "tour";
      const row = groups.get(key) || { serviceType: key, invoiced: 0, collected: 0, refunded: 0 };
      row.invoiced += Math.max(0, Number(invoice.totalAmount || 0));
      groups.set(key, row);
    }
    for (const payment of payments) {
      if (String(payment.status || "").toLowerCase() !== "completed") continue;
      const key = payment.hospitalityType || "tour";
      const row = groups.get(key) || { serviceType: key, invoiced: 0, collected: 0, refunded: 0 };
      row.collected += Math.max(0, Number(payment.amount || 0));
      row.refunded += Math.max(0, Number(payment.refundedAmount || 0));
      groups.set(key, row);
    }
    return res.json({
      success: true,
      data: [...groups.values()].map((row) => {
        const netCollected = Math.max(0, row.collected - row.refunded);
        return {
          ...row,
          invoiced: money(row.invoiced),
          collected: money(row.collected),
          refunded: money(row.refunded),
          netCollected: money(netCollected),
          collectionRate: row.invoiced ? money((netCollected / row.invoiced) * 100) : null,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
};