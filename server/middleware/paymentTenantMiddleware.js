/**
 * Purpose: payment Tenant Middleware request middleware. Main declarations: resolvePaymentTenant, resolveMpesaPaymentTenant.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Payment from "../models/Payment.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant, setTenantContext } from "../tenancy/context.js";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";

// Define resolvePaymentTenant; its parameters and body implement this operation.
async function resolvePaymentTenant(req) {
  // Declare checkoutRequestID for use by the surrounding module or function.
  const checkoutRequestID = String(req.body?.Body?.stkCallback?.CheckoutRequestID || "").trim();
  // Declare conversationId for use by the surrounding module or function.
  const conversationId = String(req.body?.Result?.ConversationID || req.body?.Result?.OriginatorConversationID || "").trim();
  // Declare payment for use by the surrounding module or function.
  const payment = await runWithTenant({ bypass: true }, async () => {
    // Check the condition (checkoutRequestID) and run the matching branch.
    if (checkoutRequestID) return Payment.findOne({ $or: [{ checkoutRequestID }, { checkoutRequestId: checkoutRequestID }] }).lean();
    // Check the condition (conversationId) and run the matching branch.
    if (conversationId) return Payment.findOne({ refundReference: conversationId }).lean();
    // Return the expression shown below to the caller.
    return null;
  });
  // Check the condition (!payment?.tenantId) and run the matching branch.
  if (!payment?.tenantId) return null;
  // Declare tenant for use by the surrounding module or function.
  const tenant = await runWithTenant({ bypass: true }, () => Organization.findById(payment.tenantId).lean());
  // Check the condition (!tenant) and run the matching branch.
  if (!tenant) return null;
  // Perform the side effect or state update expressed on the following line.
  setTenantContext({ tenantId: payment.tenantId, tenant, bypass: false });
  // Perform the side effect or state update expressed on the following line.
  req.tenant = tenant;
  // Perform the side effect or state update expressed on the following line.
  req.tenantId = payment.tenantId;
  // Return the value of payment to the caller.
  return payment;
}

// Define resolveMpesaPaymentTenant; its parameters and body implement this operation.
export async function resolveMpesaPaymentTenant(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await resolvePaymentTenant(req);
    // Perform the side effect or state update expressed on the following line.
    next();
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("PAYMENT TENANT RESOLUTION ERROR:", error.message);
    // Unknown callbacks are still acknowledged by the provider-facing
    // controller; never expose tenant existence through this middleware.
    // Perform the side effect or state update expressed on the following line.
    next();
  }
}
