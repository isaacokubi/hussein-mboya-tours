/**
 * Purpose: expense Lifecycle Controller HTTP controller. Main declarations: actor, transitionExpense.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Expense from "../models/Expense.js";
// Load ../models/SupplierPayable.js so this module can use its exported dependencies.
import SupplierPayable from "../models/SupplierPayable.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../services/operationalAccountingService.js so this module can use its exported dependencies.
import { postExpenseToLedger, postExpensePaymentToLedger } from "../services/operationalAccountingService.js";

// Declare actor for use by the surrounding module or function.
const actor = (req) => req.user?._id || req.user?.id || null;

// Declare transitionExpense for use by the surrounding module or function.
export const transitionExpense = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare expense for use by the surrounding module or function.
    const expense = await Expense.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    // Check the condition (!expense) and run the matching branch.
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found." });

    // Declare nextStatus for use by the surrounding module or function.
    const nextStatus = String(req.body?.status || "").trim().toLowerCase();
    // Declare current for use by the surrounding module or function.
    const current = String(expense.status || "draft");
    // Declare allowed for use by the surrounding module or function.
    const allowed = { draft: ["approved", "cancelled"], approved: ["paid", "cancelled"], paid: [], cancelled: [] };
    // Check the condition (!allowed[current]?.includes(nextStatus)) and run the matching branch.
    if (!allowed[current]?.includes(nextStatus)) return res.status(409).json({ success: false, message: `Expense cannot move from ${current} to ${nextStatus}.` });

    // Declare linkedPayable for use by the surrounding module or function.
    const linkedPayable = expense.purchaseOrder ? await SupplierPayable.findOne(mergeTenantFilter(req, { purchaseOrder: expense.purchaseOrder })) : null;
    // Check the condition (nextStatus === "paid" && linkedPayable && linkedPayable.balance > 0) and run the matching branch.
    if (nextStatus === "paid" && linkedPayable && linkedPayable.balance > 0) return res.status(409).json({ success: false, message: "This procurement expense is backed by an Accounts Payable balance. Settle the linked supplier payable instead of paying the expense directly." });
    // Check the condition (nextStatus === "paid" && !String(req.body?.paymentReference || expense) and run the matching branch.
    if (nextStatus === "paid" && !String(req.body?.paymentReference || expense.paymentReference || "").trim()) return res.status(422).json({ success: false, message: "A payment reference is required before an expense can be marked paid." });

    // Perform the side effect or state update expressed on the following line.
    expense.status = nextStatus;
    // Check the condition (req.body?.paymentReference !== undefined) and run the matching branch.
    if (req.body?.paymentReference !== undefined) expense.paymentReference = String(req.body.paymentReference || "").trim();
    // Check the condition (nextStatus === "approved") and run the matching branch.
    if (nextStatus === "approved") expense.approvedBy = actor(req);
    // Check the condition (nextStatus === "paid") and run the matching branch.
    if (nextStatus === "paid") { expense.paidAt = new Date(); expense.paidBy = actor(req); }
    // Check the condition (nextStatus === "cancelled") and run the matching branch.
    if (nextStatus === "cancelled") expense.cancelledBy = actor(req);
    // Perform the side effect or state update expressed on the following line.
    await expense.save();

    // A received PO already posts its linked SupplierPayable to cost/AP. Do not post the
    // operational expense a second time. Direct expenses without a payable post normally.
    // Check the condition ((nextStatus === "approved" || nextStatus === "paid") && !linkedPayable) and run the matching branch.
    if ((nextStatus === "approved" || nextStatus === "paid") && !linkedPayable) await postExpenseToLedger(expense);
    // Check the condition (nextStatus === "paid" && expense.supplier && !linkedPayable) and run the matching branch.
    if (nextStatus === "paid" && expense.supplier && !linkedPayable) await postExpensePaymentToLedger(expense);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: expense, tenantId });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
};
