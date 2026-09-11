import Payment from "../models/Payment.js";
import { requireTenantId } from "../tenancy/context.js";

const ACTIVE = ["completed", "refunded"];

export async function reconcilePaymentReferences({ tenantId = requireTenantId(), paymentId, session = null } = {}) {
  if (!paymentId) throw Object.assign(new Error("Payment ID is required."), { statusCode: 400 });
  const options = session ? { session } : {};
  const payment = await Payment.findOne({ tenantId, _id: paymentId }, null, options).lean();
  if (!payment) throw Object.assign(new Error("Payment not found."), { statusCode: 404 });

  const refs = [payment.transactionReference, payment.transactionId, payment.mpesaReceiptNumber]
    .map((value) => String(value || "").trim().toUpperCase())
    .filter(Boolean);
  const duplicateReferences = [];
  for (const reference of refs) {
    const matches = await Payment.find({
      tenantId,
      _id: { $ne: payment._id },
      status: { $in: ACTIVE },
      $or: [
        { transactionReference: reference },
        { transactionId: reference },
        { mpesaReceiptNumber: reference },
      ],
    }, null, options).select("_id status transactionReference transactionId mpesaReceiptNumber").limit(10).lean();
    if (matches.length) duplicateReferences.push({ reference, payments: matches });
  }
  return { payment, duplicateReferences };
}
