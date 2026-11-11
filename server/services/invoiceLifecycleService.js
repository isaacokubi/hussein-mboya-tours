/**
 * Purpose: invoice Lifecycle Service business-logic service. Main declarations: syncInvoiceFromPayment.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Invoice from "../models/Invoice.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Define syncInvoiceFromPayment; its parameters and body implement this operation.
export async function syncInvoiceFromPayment(payment) {
  // Check the condition (!payment?.booking || !payment?.tenantId) and run the matching branch.
  if (!payment?.booking || !payment?.tenantId) return null;
  // Declare invoice for use by the surrounding module or function.
  const invoice = await Invoice.findOne({ tenantId: payment.tenantId, booking: payment.booking, isDeleted: { $ne: true } });
  // Check the condition (!invoice) and run the matching branch.
  if (!invoice) return null;
  // Declare totals for use by the surrounding module or function.
  const totals = await Payment.aggregate([{ $match: { tenantId: payment.tenantId, booking: payment.booking, status: "completed" } }, { $group: { _id: null, amount: { $sum: "$amount" }, lastReference: { $last: "$transactionReference" } } }]);
  // Declare paid for use by the surrounding module or function.
  const paid = Math.min(Number(invoice.totalAmount || 0), Number(totals[0]?.amount || 0));
  // Perform the side effect or state update expressed on the following line.
  invoice.amountPaid = Math.round(paid * 100) / 100;
  // Perform the side effect or state update expressed on the following line.
  invoice.balance = Math.max(0, Math.round((Number(invoice.totalAmount || 0) - paid) * 100) / 100);
  // Perform the side effect or state update expressed on the following line.
  invoice.status = invoice.balance <= 0 && invoice.totalAmount > 0 ? "paid" : paid > 0 ? "partial" : "pending";
  // Check the condition (totals[0]?.lastReference) and run the matching branch.
  if (totals[0]?.lastReference) invoice.paymentReference = String(totals[0].lastReference);
  // Perform the side effect or state update expressed on the following line.
  await invoice.save();
  // Return the value of invoice to the caller.
  return invoice;
}
