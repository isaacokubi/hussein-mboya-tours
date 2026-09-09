import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
export async function syncInvoiceFromPayment(payment) {
  if (!payment?.booking || !payment?.tenantId) return null;
  const invoice = await Invoice.findOne({ tenantId: payment.tenantId, booking: payment.booking, isDeleted: { $ne: true } });
  if (!invoice) return null;
  const totals = await Payment.aggregate([{ $match: { tenantId: payment.tenantId, booking: payment.booking, status: "completed" } }, { $group: { _id: null, amount: { $sum: "$amount" }, lastReference: { $last: "$transactionReference" } } }]);
  const paid = Math.min(Number(invoice.totalAmount || 0), Number(totals[0]?.amount || 0));
  invoice.amountPaid = Math.round(paid * 100) / 100;
  invoice.balance = Math.max(0, Math.round((Number(invoice.totalAmount || 0) - paid) * 100) / 100);
  invoice.status = invoice.balance <= 0 && invoice.totalAmount > 0 ? "paid" : paid > 0 ? "partial" : "pending";
  if (totals[0]?.lastReference) invoice.paymentReference = String(totals[0].lastReference);
  await invoice.save();
  return invoice;
}
