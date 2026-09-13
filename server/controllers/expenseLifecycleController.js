import Expense from "../models/Expense.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { postExpenseToLedger, postExpensePaymentToLedger } from "../services/operationalAccountingService.js";

const actor = (req) => req.user?._id || req.user?.id || null;

export const transitionExpense = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const expense = await Expense.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found." });

    const nextStatus = String(req.body?.status || "").trim().toLowerCase();
    const current = String(expense.status || "draft");
    const allowed = {
      draft: ["approved", "cancelled"],
      approved: ["paid", "cancelled"],
      paid: [],
      cancelled: [],
    };
    if (!allowed[current]?.includes(nextStatus)) return res.status(409).json({ success: false, message: `Expense cannot move from ${current} to ${nextStatus}.` });
    if (nextStatus === "paid" && !String(req.body?.paymentReference || expense.paymentReference || "").trim()) return res.status(422).json({ success: false, message: "A payment reference is required before an expense can be marked paid." });

    expense.status = nextStatus;
    if (req.body?.paymentReference !== undefined) expense.paymentReference = String(req.body.paymentReference || "").trim();
    if (nextStatus === "approved") expense.approvedBy = actor(req);
    if (nextStatus === "paid") {
      expense.paidAt = new Date();
      expense.paidBy = actor(req);
    }
    if (nextStatus === "cancelled") expense.cancelledBy = actor(req);
    await expense.save();

    if (nextStatus === "approved" || nextStatus === "paid") await postExpenseToLedger(expense);
    if (nextStatus === "paid" && expense.supplier) await postExpensePaymentToLedger(expense);
    return res.json({ success: true, data: expense, tenantId });
  } catch (error) {
    return next(error);
  }
};
