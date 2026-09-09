import TaxProfile from "../models/TaxProfile.js";
import Expense from "../models/Expense.js";
import CreditDebitNote from "../models/CreditDebitNote.js";
import Invoice from "../models/Invoice.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

export const getTaxProfile = async (req, res, next) => {
  try {
    requireTenantId();
    let profile = await TaxProfile.findOne(mergeTenantFilter(req, {})).lean();
    if (!profile) profile = { kraPin: "", vatRegistered: false, defaultVatRate: 16, taxRegime: "VAT", etimsEnabled: false, etimsSolution: "", etimsDeviceId: "", etimsInvoicePrefix: "INV" };
    return res.json({ success: true, data: profile });
  } catch (error) { next(error); }
};

export const upsertTaxProfile = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const allowed = ["kraPin", "vatRegistered", "vatNumber", "defaultVatRate", "taxRegime", "etimsEnabled", "etimsSolution", "etimsDeviceId", "etimsInvoicePrefix", "complianceNotes"];
    const data = {};
    for (const key of allowed) if (req.body?.[key] !== undefined) data[key] = req.body[key];
    if (data.kraPin && !/^P\d{9}[A-Z]$/i.test(String(data.kraPin).trim())) return res.status(400).json({ success: false, message: "Invalid Kenyan KRA PIN format." });
    if (data.defaultVatRate !== undefined && (!Number.isFinite(Number(data.defaultVatRate)) || Number(data.defaultVatRate) < 0 || Number(data.defaultVatRate) > 100)) return res.status(400).json({ success: false, message: "Invalid VAT rate." });
    data.updatedBy = req.user?._id || null;
    const profile = await TaxProfile.findOneAndUpdate({ tenantId }, { $set: data, $setOnInsert: { tenantId } }, { upsert: true, new: true, runValidators: true });
    return res.json({ success: true, data: profile });
  } catch (error) { next(error); }
};

export const listExpenses = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.startDate || req.query.endDate) {
      filter.expenseDate = {};
      if (req.query.startDate) filter.expenseDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.expenseDate.$lte = new Date(req.query.endDate);
    }
    const tenantFilter = mergeTenantFilter(req, filter);
    const [data, total] = await Promise.all([Expense.find(tenantFilter).sort({ expenseDate: -1 }).skip((page - 1) * limit).limit(limit).lean(), Expense.countDocuments(tenantFilter)]);
    return res.json({ success: true, data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

export const createExpense = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const amount = Number(req.body?.amount);
    if (!req.body?.category || !req.body?.description || !Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "Category, description and a positive amount are required." });
    const expense = await Expense.create({ ...req.body, tenantId, amount, createdBy: req.user?._id || null });
    return res.status(201).json({ success: true, data: expense });
  } catch (error) { next(error); }
};

export const listNotes = async (req, res, next) => {
  try {
    const data = await CreditDebitNote.find(mergeTenantFilter(req, {})).populate("originalInvoice", "invoiceNumber totalAmount").sort({ createdAt: -1 }).limit(200).lean();
    return res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const createNote = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const type = String(req.body?.type || "").toLowerCase();
    if (!["credit", "debit"].includes(type)) return res.status(400).json({ success: false, message: "Note type must be credit or debit." });
    const invoice = await Invoice.findOne(mergeTenantFilter(req, { _id: req.body?.originalInvoice }));
    if (!invoice) return res.status(404).json({ success: false, message: "Original invoice not found." });
    const totalAmount = Number(req.body?.totalAmount);
    if (!Number.isFinite(totalAmount) || totalAmount <= 0 || totalAmount > Number(invoice.totalAmount)) return res.status(400).json({ success: false, message: "Note amount must be positive and cannot exceed the original invoice total." });
    const note = await CreditDebitNote.create({ tenantId, type, originalInvoice: invoice._id, originalInvoiceNumber: invoice.invoiceNumber, reason: req.body?.reason, amount: Number(req.body?.amount || totalAmount), taxAmount: Number(req.body?.taxAmount || 0), totalAmount, createdBy: req.user?._id || null });
    return res.status(201).json({ success: true, data: note });
  } catch (error) { next(error); }
};

export const getFinanceComplianceSummary = async (req, res, next) => {
  try {
    const [profile, expenses] = await Promise.all([
      TaxProfile.findOne(mergeTenantFilter(req, {})).lean(),
      Expense.aggregate([{ $match: mergeTenantFilter(req, {}) }, { $group: { _id: null, total: { $sum: "$amount" }, tax: { $sum: "$taxAmount" }, count: { $sum: 1 } } }]),
    ]);
    return res.json({ success: true, data: { taxProfile: profile, expenses: expenses[0] || { total: 0, tax: 0, count: 0 }, compliance: { etimsConfigured: Boolean(profile?.etimsEnabled), kraPinConfigured: Boolean(profile?.kraPin) } } });
  } catch (error) { next(error); }
};
