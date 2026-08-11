import Commission from "../models/Commission.js";
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| CREATE AGENT COMMISSION
|--------------------------------------------------------------------------
*/

export const createCommission = async (booking) => {
  if (!booking.agent) {
    return null;
  }

  // Prevent duplicate commission
  const existingCommission = await Commission.findOne({
    booking: booking._id,
  });

  if (existingCommission) {
    return existingCommission;
  }

  const agent = await User.findById(booking.agent);

  if (!agent) {
    throw new Error("Agent not found.");
  }

  const rate = agent.agentProfile?.commissionRate ?? 0;

  const amount = Number(
    ((booking.totalAmount * rate) / 100).toFixed(2)
  );

  const commission = await Commission.create({
    agent: agent._id,
    booking: booking._id,
    amount,
    rate,
    status: "pending",
  });

  return commission;
};