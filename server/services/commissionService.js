import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import Commission from "../models/Commission.js";
import Agent from "../models/Agent.js";
import { getSystemSettings } from "./settingsService.js";
const getGlobalCommissionRate = async () => {
  const settings = await getSystemSettings({
    tenantId: options?.tenantId || null,
  });
  const rate = Number(settings?.defaultCommissionRate);
  return Number.isFinite(rate) && rate >= 0 && rate <= 100 ? rate : 10;
};

export const createCommission = async (booking) => {
  requireTenantId();
  if (!booking?.agent) return null;

  const existingCommission = await Commission.findOne({ booking: booking._id });
  if (existingCommission) return existingCommission;

  const agent = await Agent.findById(booking.agent);
  if (!agent) throw new Error("Agent profile not found.");

  // Commission is globally controlled by SuperAdmin system settings.
  const rate = await getGlobalCommissionRate();
  const bookingAmount = Number(booking.totalAmount || 0);
  const amount = Number(((bookingAmount * rate) / 100).toFixed(2));

  // Keep the legacy Agent field synchronized for compatibility with older records/UI.
  if (Number(agent.commissionRate) !== rate) {
    await Agent.updateOne({ _id: agent._id }, { $set: { commissionRate: rate } });
  }

  return Commission.create({
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
};
