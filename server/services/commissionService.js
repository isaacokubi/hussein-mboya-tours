import Commission from "../models/Commission.js";
import Agent from "../models/Agent.js";

export const createCommission = async (booking) => {
  if (!booking?.agent) return null;

  const existingCommission = await Commission.findOne({ booking: booking._id });
  if (existingCommission) return existingCommission;

  const agent = await Agent.findById(booking.agent);
  if (!agent) throw new Error("Agent profile not found.");

  const rate = Number(agent.commissionRate || 0);
  const bookingAmount = Number(booking.totalAmount || 0);
  const amount = Number(((bookingAmount * rate) / 100).toFixed(2));

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
