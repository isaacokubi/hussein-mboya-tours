/**
 * Purpose: commission Service business-logic service. Main declarations: getGlobalCommissionRate, createCommission.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Commission.js so this module can use its exported dependencies.
import Commission from "../models/Commission.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";
// Load ./settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "./settingsService.js";

// Declare getGlobalCommissionRate for use by the surrounding module or function.
const getGlobalCommissionRate = async (tenantId) => {
  // Declare settings for use by the surrounding module or function.
  const settings = await getSystemSettings({ tenantId });
  // Declare rate for use by the surrounding module or function.
  const rate = Number(settings?.defaultCommissionRate);
  // Return the expression shown below to the caller.
  return Number.isFinite(rate) && rate >= 0 && rate <= 100 ? rate : 10;
};

// Declare createCommission for use by the surrounding module or function.
export const createCommission = async (booking) => {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = requireTenantId();
  // Check the condition (!booking?.agent) and run the matching branch.
  if (!booking?.agent) return null;

  // Check the condition (booking.tenantId && String(booking.tenantId) !== String(tenantId)) and run the matching branch.
  if (booking.tenantId && String(booking.tenantId) !== String(tenantId)) {
    // Declare error for use by the surrounding module or function.
    const error = new Error("Cross-tenant commission creation rejected.");
    // Perform the side effect or state update expressed on the following line.
    error.status = 403;
    // Perform the side effect or state update expressed on the following line.
    error.code = "CROSS_TENANT_COMMISSION";
    // Stop the current operation by raising the value of error.
    throw error;
  }

  // Defense-in-depth: never resolve a commission or agent outside the
  // tenant currently executing this request, even if tenant middleware/plugin
  // behavior changes later.
  // Declare existingCommission for use by the surrounding module or function.
  const existingCommission = await Commission.findOne(
    mergeTenantFilter({ booking: booking._id })
  );
  // Check the condition (existingCommission) and run the matching branch.
  if (existingCommission) return existingCommission;

  // Declare agent for use by the surrounding module or function.
  const agent = await Agent.findOne(
    mergeTenantFilter({ _id: booking.agent })
  );
  // Check the condition (!agent) and run the matching branch.
  if (!agent) throw new Error("Agent profile not found.");

  // Check the condition (agent.tenantId && String(agent.tenantId) !== String(tenantId)) and run the matching branch.
  if (agent.tenantId && String(agent.tenantId) !== String(tenantId)) {
    // Declare error for use by the surrounding module or function.
    const error = new Error("Cross-tenant agent commission rejected.");
    // Perform the side effect or state update expressed on the following line.
    error.status = 403;
    // Perform the side effect or state update expressed on the following line.
    error.code = "CROSS_TENANT_AGENT";
    // Stop the current operation by raising the value of error.
    throw error;
  }

  // Commission rates are tenant settings, never platform/global settings.
  // Declare rate for use by the surrounding module or function.
  const rate = await getGlobalCommissionRate(tenantId);
  // Declare bookingAmount for use by the surrounding module or function.
  const bookingAmount = Number(booking.totalAmount || 0);
  // Declare amount for use by the surrounding module or function.
  const amount = Number(((bookingAmount * rate) / 100).toFixed(2));

  // Keep the legacy Agent field synchronized for compatibility with older records/UI.
  // Check the condition (Number(agent.commissionRate) !== rate) and run the matching branch.
  if (Number(agent.commissionRate) !== rate) {
    // Perform the side effect or state update expressed on the following line.
    await Agent.updateOne(
      mergeTenantFilter({ _id: agent._id }),
      { $set: { commissionRate: rate } }
    );
  }

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Return the completed the result of Commission.create() operation to the caller.
    return await Commission.create({
      tenantId,
      agent: agent._id,
      booking: booking._id,
      customer: booking.user || booking.customer || null,
      tour: booking.tour || null,
      bookingAmount,
      rate,
      amount,
      status: "pending",
      paymentMethod: booking.paymentMethod || "MPESA",
    });
  } catch (error) {
    // The booking field is unique (and tenantPlugin makes its uniqueness
    // tenant-aware). If two payment/booking flows race, the losing insert
    // should resolve to the already-created commission instead of surfacing
    // a duplicate-key failure to the customer.
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) {
      // Declare concurrentCommission for use by the surrounding module or function.
      const concurrentCommission = await Commission.findOne(
        mergeTenantFilter({ booking: booking._id })
      );
      // Check the condition (concurrentCommission) and run the matching branch.
      if (concurrentCommission) return concurrentCommission;
    }

    // Stop the current operation by raising the value of error.
    throw error;
  }
};
