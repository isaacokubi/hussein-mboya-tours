/**
 * Purpose: admin Agent Controller HTTP controller. Main declarations: extractId, toObjectId, getSafeTenantId, tenantScopedFilter, formatTenantLocation.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { publicErrorMessage } from "../utils/publicError.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { requireTenantId, getTenantId } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Commission.js so this module can use its exported dependencies.
import Commission from "../models/Commission.js";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";

// Declare extractId for use by the surrounding module or function.
const extractId = (value) => {
  // Check the condition (value == null) and run the matching branch.
  if (value == null) return "";
  // Check the condition (typeof value === "string" || typeof value === "number") and run the matching branch.
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  // Check the condition (mongoose.isValidObjectId(value)) and run the matching branch.
  if (mongoose.isValidObjectId(value)) return String(value);
  // Check the condition (value._id != null) and run the matching branch.
  if (value._id != null) return extractId(value._id);
  // Check the condition (value.id != null) and run the matching branch.
  if (value.id != null) return extractId(value.id);
  // Check the condition (typeof value.toHexString === "function") and run the matching branch.
  if (typeof value.toHexString === "function") return value.toHexString();
  // Check the condition (typeof value.toString === "function") and run the matching branch.
  if (typeof value.toString === "function") {
    // Declare stringValue for use by the surrounding module or function.
    const stringValue = value.toString();
    // Check the condition (stringValue && stringValue !== "[object Object]") and run the matching branch.
    if (stringValue && stringValue !== "[object Object]") return stringValue.trim();
  }
  // Return a configured text value to the caller.
  return "";
};

// Declare toObjectId for use by the surrounding module or function.
const toObjectId = (value, fieldName) => {
  // Declare id for use by the surrounding module or function.
  const id = extractId(value);
  // Check the condition (!mongoose.isValidObjectId(id)) and run the matching branch.
  if (!mongoose.isValidObjectId(id)) {
    // Declare error for use by the surrounding module or function.
    const error = new Error(`Invalid ${fieldName}.`);
    // Perform the side effect or state update expressed on the following line.
    error.status = 400;
    // Perform the side effect or state update expressed on the following line.
    error.code = "INVALID_OBJECT_ID";
    // Stop the current operation by raising the value of error.
    throw error;
  }
  // Return a new mongoose.Types.ObjectId instance to the caller.
  return new mongoose.Types.ObjectId(id);
};

// Declare getSafeTenantId for use by the surrounding module or function.
const getSafeTenantId = () => toObjectId(getTenantId(), "tenant ID");
// Declare tenantScopedFilter for use by the surrounding module or function.
const tenantScopedFilter = (filter = {}) => ({ ...filter, tenantId: getSafeTenantId() });
// Declare formatTenantLocation for use by the surrounding module or function.
const formatTenantLocation = (organization) => [String(organization?.address || "").trim(), String(organization?.country || "").trim()].filter(Boolean).join(", ");

// Declare getAgents for use by the surrounding module or function.
export const getAgents = async (req, res) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = getSafeTenantId();
    // Declare [agents, organization] for use by the surrounding module or function.
    const [agents, organization] = await Promise.all([
      Agent.find(tenantFilter(req))
        .populate("user", "name email phone role status")
        .sort({ createdAt: -1 })
        .lean(),
      Organization.findById(tenantId).select("address country").lean(),
    ]);

    // Declare tenantLocation for use by the surrounding module or function.
    const tenantLocation = formatTenantLocation(organization);
    // Declare agentIds for use by the surrounding module or function.
    const agentIds = agents.map((agent) => agent._id).filter(Boolean);
    // Declare bookingStats for use by the surrounding module or function.
    const bookingStats = agentIds.length
      ? await Booking.aggregate([
          { $match: { tenantId, agent: { $in: agentIds }, isDeleted: { $ne: true } } },
          { $group: { _id: "$agent", totalBookings: { $sum: 1 } } },
        ])
      : [];

    // Declare commissionStats for use by the surrounding module or function.
    let commissionStats = [];
    // Check the condition (agentIds.length) and run the matching branch.
    if (agentIds.length) {
      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Perform the side effect or state update expressed on the following line.
        commissionStats = await Commission.aggregate([
          { $match: { tenantId, agent: { $in: agentIds }, isDeleted: { $ne: true } } },
          {
            $project: {
              agent: 1,
              status: 1,
              netAmount: {
                $max: [
                  0,
                  {
                    $subtract: [
                      { $ifNull: ["$amount", 0] },
                      { $ifNull: ["$refundedAmount", 0] },
                    ],
                  },
                ],
              },
            },
          },
          {
            $group: {
              _id: "$agent",
              totalCommission: { $sum: "$netAmount" },
              pendingCommission: {
                $sum: {
                  $cond: [
                    { $in: ["$status", ["pending", "approved", "processing"]] },
                    "$netAmount",
                    0,
                  ],
                },
              },
              paidCommission: {
                $sum: {
                  $cond: [{ $eq: ["$status", "paid"] }, "$netAmount", 0],
                },
              },
            },
          },
        ]);
      } catch (commissionError) {
        // Perform the side effect or state update expressed on the following line.
        console.error("Admin agent commission stats unavailable:", commissionError);
      }
    }

    // Declare bookingMap for use by the surrounding module or function.
    const bookingMap = new Map(bookingStats.map((item) => [String(item._id), Number(item.totalBookings || 0)]));
    // Declare commissionMap for use by the surrounding module or function.
    const commissionMap = new Map(commissionStats.map((item) => [String(item._id), item]));

    // Declare normalized for use by the surrounding module or function.
    const normalized = agents.map((agent) => {
      // Declare bookingCount for use by the surrounding module or function.
      const bookingCount = bookingMap.get(String(agent._id));
      // Declare commission for use by the surrounding module or function.
      const commission = commissionMap.get(String(agent._id));
      // Return the object assembled below to the caller.
      return {
        ...agent,
        companyName: String(agent.companyName || "").trim(),
        phone: String(agent.phone || agent.user?.phone || "").trim(),
        email: String(agent.email || agent.user?.email || "").trim(),
        location: String(agent.location || "").trim() || tenantLocation,
        totalBookings: bookingCount !== undefined ? bookingCount : Number(agent.totalBookings || 0),
        totalCommission: commission ? Number(commission.totalCommission || 0) : Number(agent.totalCommission || 0),
        pendingCommission: commission ? Number(commission.pendingCommission || 0) : Number(agent.pendingCommission || 0),
        paidCommission: commission ? Number(commission.paidCommission || 0) : Number(agent.paidCommission || 0),
        isActive: agent.status === "active" && agent.isApproved === true,
      };
    });

    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: normalized });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Admin get agents error:", error);
    // Return the result of res.status(error.status || 500).json() to the caller.
    return res.status(error.status || 500).json({
      success: false,
      code: error.code || "ADMIN_AGENTS_FETCH_FAILED",
      message: publicErrorMessage(error, "Unable to load agent accounts."),
    });
  }
};

// Declare getAgentById for use by the surrounding module or function.
export const getAgentById = async (req, res) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare agentId for use by the surrounding module or function.
    const agentId = toObjectId(req.params.id, "agent ID");
    // Declare agent for use by the surrounding module or function.
    const agent = await Agent.findOne(tenantScopedFilter({ _id: agentId }))
      .populate("user", "name email phone role status")
      .lean();
    // Check the condition (!agent) and run the matching branch.
    if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data: agent });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Admin get agent error:", error);
    // Return the result of res.status(error.status || 500).json() to the caller.
    return res.status(error.status || 500).json({ success: false, message: publicErrorMessage(error) });
  }
};

// Declare approveAgent for use by the surrounding module or function.
export const approveAgent = async (req, res) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare agentId for use by the surrounding module or function.
    const agentId = toObjectId(req.params.id, "agent ID");
    // Declare approverId for use by the surrounding module or function.
    const approverId = toObjectId(req.user?._id ?? req.user?.id ?? req.auth?.userId, "approver ID");
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = getSafeTenantId();
    // Declare filter for use by the surrounding module or function.
    const filter = { _id: agentId, tenantId };
    // Declare agent for use by the surrounding module or function.
    const agent = await Agent.findOne(filter).select("_id tenantId user isApproved status approvedBy approvedAt").lean();
    // Check the condition (!agent) and run the matching branch.
    if (!agent) return res.status(404).json({ success: false, code: "AGENT_NOT_FOUND", message: "Agent not found in the current tenant." });

    // Declare linkedUserId for use by the surrounding module or function.
    const linkedUserId = toObjectId(agent.user, "agent user ID");
    // Declare linkedUser for use by the surrounding module or function.
    const linkedUser = await User.findOne({ _id: linkedUserId, tenantId })
      .select("_id tenantId name email phone role legacyRole status isActive")
      .lean();
    // Check the condition (!linkedUser) and run the matching branch.
    if (!linkedUser) return res.status(422).json({ success: false, code: "AGENT_USER_NOT_FOUND", message: "The agent's linked user account could not be found in this tenant." });

    // Declare activatedUser for use by the surrounding module or function.
    const activatedUser = await User.findOneAndUpdate(
      { _id: linkedUserId, tenantId },
      { $set: { role: "agent", legacyRole: "agent", status: "active", isActive: true } },
      { new: true, runValidators: true }
    ).select("_id tenantId name email phone role legacyRole status isActive").lean();
    // Check the condition (!activatedUser) and run the matching branch.
    if (!activatedUser) return res.status(422).json({ success: false, code: "AGENT_USER_ACTIVATION_FAILED", message: "The linked agent user account could not be activated." });

    // Declare approvedAt for use by the surrounding module or function.
    const approvedAt = new Date();
    // Declare updatedAgent for use by the surrounding module or function.
    const updatedAgent = await Agent.findOneAndUpdate(
      filter,
      { $set: { isApproved: true, status: "active", approvedBy: approverId, approvedAt } },
      { new: true, runValidators: true }
    ).populate("user", "name email phone role status").lean();

    // Check the condition (!updatedAgent) and run the matching branch.
    if (!updatedAgent) {
      // Perform the side effect or state update expressed on the following line.
      await User.updateOne(
        { _id: linkedUserId, tenantId },
        { $set: { role: linkedUser.role || "customer", legacyRole: linkedUser.legacyRole || linkedUser.role || "customer", status: linkedUser.status || "inactive", isActive: linkedUser.isActive !== false } }
      ).catch((rollbackError) => console.error("Agent approval user rollback failed:", rollbackError));
      // Return the result of res.status(422).json() to the caller.
      return res.status(422).json({ success: false, code: "AGENT_APPROVAL_UPDATE_FAILED", message: "The agent approval could not be completed." });
    }

    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Agent approved successfully", data: updatedAgent });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Admin agent approval failed:", { name: error?.name, code: error?.code, status: error?.status, message: error?.message, stack: error?.stack });
    // Declare message for use by the surrounding module or function.
    const message = error?.status === 400
      ? error.message
      : error?.name === "ValidationError"
        ? Object.values(error.errors || {}).map((item) => item.message).join("; ") || error.message
        : error?.message || "Unable to approve this agent right now. Please try again.";
    // Return the result of res.status(error.status || 500).json() to the caller.
    return res.status(error.status || 500).json({ success: false, code: error.code || "AGENT_APPROVAL_FAILED", message });
  }
};

// Declare updateAgentStatus for use by the surrounding module or function.
export const updateAgentStatus = async (req, res) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare status for use by the surrounding module or function.
    const status = String(req.body?.status || "").trim().toLowerCase();
    // Check the condition (!["active", "inactive", "suspended"].includes(status)) and run the matching branch.
    if (!["active", "inactive", "suspended"].includes(status)) return res.status(400).json({ success: false, message: "Invalid agent status" });
    // Declare agentId for use by the surrounding module or function.
    const agentId = toObjectId(req.params.id, "agent ID");
    // Declare agent for use by the surrounding module or function.
    const agent = await Agent.findOne(tenantScopedFilter({ _id: agentId }))
      .select("_id tenantId user status isApproved")
      .lean();
    // Check the condition (!agent) and run the matching branch.
    if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });

    // Declare linkedUserId for use by the surrounding module or function.
    const linkedUserId = agent.user ? toObjectId(agent.user, "agent user ID") : null;
    // Check the condition (linkedUserId) and run the matching branch.
    if (linkedUserId) {
      // Declare userUpdate for use by the surrounding module or function.
      const userUpdate = status === "active"
        ? { $set: { status: "active", isActive: true, role: "agent", legacyRole: "agent" } }
        : { $set: { status, isActive: false } };
      // Declare linkedUser for use by the surrounding module or function.
      const linkedUser = await User.findOneAndUpdate(
        { _id: linkedUserId, tenantId: getSafeTenantId() },
        userUpdate,
        { new: true, runValidators: true }
      ).select("_id status isActive role legacyRole").lean();
      // Check the condition (!linkedUser) and run the matching branch.
      if (!linkedUser) {
        // Return the result of res.status(422).json() to the caller.
        return res.status(422).json({
          success: false,
          code: "AGENT_USER_NOT_FOUND",
          message: "The agent's linked user account could not be found in this tenant.",
        });
      }
    }

    // Declare updatedAgent for use by the surrounding module or function.
    const updatedAgent = await Agent.findOneAndUpdate(
      tenantScopedFilter({ _id: agentId }),
      { $set: { status } },
      { new: true, runValidators: true }
    ).populate("user", "name email phone role status").lean();

    // Check the condition (!updatedAgent) and run the matching branch.
    if (!updatedAgent) return res.status(404).json({ success: false, message: "Agent not found" });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Agent status and access updated", data: updatedAgent });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Admin agent status update failed:", error);
    // Return the result of res.status(error.status || 500).json() to the caller.
    return res.status(error.status || 500).json({ success: false, message: publicErrorMessage(error) });
  }
};
