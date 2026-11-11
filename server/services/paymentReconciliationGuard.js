/**
 * Purpose: payment Reconciliation Guard business-logic service. Main declarations: reconcilePaymentReferences.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Payment from "../models/Payment.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { requireTenantId } from "../tenancy/context.js";

// Declare ACTIVE for use by the surrounding module or function.
const ACTIVE = ["completed", "refunded"];

// Define reconcilePaymentReferences; its parameters and body implement this operation.
export async function reconcilePaymentReferences({ tenantId = requireTenantId(), paymentId, session = null } = {}) {
  // Check the condition (!paymentId) and run the matching branch.
  if (!paymentId) throw Object.assign(new Error("Payment ID is required."), { statusCode: 400 });
  // Declare options for use by the surrounding module or function.
  const options = session ? { session } : {};
  // Declare payment for use by the surrounding module or function.
  const payment = await Payment.findOne({ tenantId, _id: paymentId }, null, options).lean();
  // Check the condition (!payment) and run the matching branch.
  if (!payment) throw Object.assign(new Error("Payment not found."), { statusCode: 404 });

  // Declare refs for use by the surrounding module or function.
  const refs = [payment.transactionReference, payment.transactionId, payment.mpesaReceiptNumber]
    .map((value) => String(value || "").trim().toUpperCase())
    .filter(Boolean);
  // Declare duplicateReferences for use by the surrounding module or function.
  const duplicateReferences = [];
  // Repeat the enclosed work for each required iteration.
  for (const reference of refs) {
    // Declare matches for use by the surrounding module or function.
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
    // Check the condition (matches.length) and run the matching branch.
    if (matches.length) duplicateReferences.push({ reference, payments: matches });
  }
  // Return the object assembled below to the caller.
  return { payment, duplicateReferences };
}
