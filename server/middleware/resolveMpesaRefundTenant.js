/**
 * Purpose: resolve Mpesa Refund Tenant request middleware. Main declarations: resolveMpesaRefundTenant.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Payment from "../models/Payment.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant, setTenantContext } from "../tenancy/context.js";

// Define resolveMpesaRefundTenant; its parameters and body implement this operation.
export async function resolveMpesaRefundTenant(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare result for use by the surrounding module or function.
    const result = req.body?.Result;
    // Declare conversationId for use by the surrounding module or function.
    const conversationId = String(result?.ConversationID || result?.OriginatorConversationID || "").trim();
    // Check the condition (!conversationId) and run the matching branch.
    if (!conversationId) return next();

    // Declare payment for use by the surrounding module or function.
    const payment = await runWithTenant({ bypass: true }, () => Payment.findOne({
      refundReference: conversationId,
    }).select("_id tenantId").lean());

    // Check the condition (!payment?.tenantId) and run the matching branch.
    if (!payment?.tenantId) return next();

    // Perform the side effect or state update expressed on the following line.
    setTenantContext({ tenantId: payment.tenantId, bypass: false });
    // Perform the side effect or state update expressed on the following line.
    req.tenantId = payment.tenantId;
    // Return the result of next() to the caller.
    return next();
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
}
