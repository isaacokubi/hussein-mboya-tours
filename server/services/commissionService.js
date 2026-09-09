import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Commission from "../models/Commission.js";
import Agent from "../models/Agent.js";
import { getSystemSettings } from "./settingsService.js";

const getGlobalCommissionRate = async (tenantId) => {
  const settings = await getSystemSettings({ tenantId });
  const rate = Number(settings?.defaultCommissionRate);
  return Number.isFinite(rate) && rate >= 0 && rate <= 100 ? rate : 10;
};

export const createCommission = async (booking) => {
  const tenantId = requireTenantId();
  if (!booking?.agent) return null;

  if (booking.tenantId && String(booking.tenantId) !== String(tenantId)) {
    const error = new Error("Cross-tenant commission creation rejected.");
    error.status = 403;
    error.code = "CROSS_TENANT_COMMISSION";
    throw error;
  }

  // Defense-in-depth: never resolve a commission or agent outside the
  // tenant currently executing this request, even if tenant middleware/plugin
  // behavior changes later.
  const existingCommission = await Commission.findOne(
    mergeTenantFilter({ booking: booking._id })
  );
  if (existingCommission) return existingCommission;

  const agent = await Agent.findOne(
    mergeTenantFilter({ _id: booking.agent })
  );
  if (!agent) throw new Error("Agent profile not found.");

  if (agent.tenantId && String(agent.tenantId) !== String(tenantId)) {
    const error = new Error("Cross-tenant agent commission rejected.");
    error.status = 403;
    error.code = "CROSS_TENANT_AGENT";
    throw error;
  }

  // Commission rates are tenant settings, never platform/global settings.
  const rate = await getGlobalCommissionRate(tenantId);
  const bookingAmount = Number(booking.totalAmount || 0);
  const amount = Number(((bookingAmount * rate) / 100).toFixed(2));

  // Keep the legacy Agent field synchronized for compatibility with older records/UI.
  if (Number(agent.commissionRate) !== rate) {
    await Agent.updateOne(
      mergeTenantFilter({ _id: agent._id }),
      { $set: { commissionRate: rate } }
    );
  }

  try {
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
    if (error?.code === 11000) {
      const concurrentCommission = await Commission.findOne(
        mergeTenantFilter({ booking: booking._id })
      );
      if (concurrentCommission) return concurrentCommission;
    }

    throw error;
  }
};
