import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Commission from "../models/Commission.js";
import Agent from "../models/Agent.js";
import { getSystemSettings } from "./settingsService.js";

const getGlobalCommissionRate = async ({ tenantId } = {}) => {
  const settings = await getSystemSettings({ tenantId: tenantId || null });
  const rate = Number(settings?.defaultCommissionRate);
  return Number.isFinite(rate) && rate >= 0 && rate <= 100 ? rate : 10;
};

export const createCommission = async (booking, session = null) => {
  requireTenantId();
  if (!booking?.agent) return null;

  const tenantFilter = mergeTenantFilter({});
  const existingCommission = await Commission.findOne({
    ...tenantFilter,
    booking: booking._id,
  }).session(session || undefined);
  if (existingCommission) return existingCommission;

  const agent = await Agent.findOne({
    ...tenantFilter,
    _id: booking.agent,
  }).session(session || undefined);
  if (!agent) throw new Error("Agent profile not found.");

  const tenantId = booking.tenantId || agent.tenantId || null;
  const rate = await getGlobalCommissionRate({ tenantId });
  const bookingAmount = Number(booking.totalAmount || 0);
  const amount = Number(((bookingAmount * rate) / 100).toFixed(2));

  if (Number(agent.commissionRate) !== rate) {
    agent.commissionRate = rate;
  }

  const commission = await Commission.create([{
    ...tenantFilter,
    agent: agent._id,
    booking: booking._id,
    customer: booking.user || booking.customer || null,
    tour: booking.tour || null,
    bookingAmount,
    rate,
    amount,
    status: "pending",
    paymentMethod: booking.paymentMethod || "MPESA",
  }], session ? { session } : undefined);

  // Keep legacy Agent totals/wallet synchronized with the commission ledger.
  agent.totalCommission = Number(agent.totalCommission || 0) + amount;
  agent.pendingCommission = Number(agent.pendingCommission || 0) + amount;
  agent.walletBalance = Number(agent.walletBalance || 0) + amount;
  await agent.save(session ? { session } : undefined);

  return commission[0];
};
