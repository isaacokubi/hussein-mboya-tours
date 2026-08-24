import mongoose from "mongoose";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Agent from "../models/Agent.js";
import User from "../models/User.js";

const toObjectId = (value, fieldName) => {
  const id = String(value ?? "").trim();
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error(`Invalid ${fieldName}.`);
    error.status = 400;
    error.code = "INVALID_OBJECT_ID";
    throw error;
  }
  return new mongoose.Types.ObjectId(id);
};

export const getAgents = async (req, res) => {
  requireTenantId();
  try {
    const agents = await Agent.find(tenantFilter(req)).populate("user", "name email phone role status").sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: agents });
  } catch (error) {
    console.error("Admin get agents error:", error);
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const getAgentById = async (req, res) => {
  requireTenantId();
  try {
    const agentId = toObjectId(req.params.id, "agent ID");
    const agent = await Agent.findOne(mergeTenantFilter(req, { _id: agentId })).populate("user", "name email phone role status").lean();
    if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });
    return res.json({ success: true, data: agent });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const approveAgent = async (req, res) => {
  requireTenantId();
  try {
    const agentId = toObjectId(req.params.id, "agent ID");
    const approverId = toObjectId(req.user?._id || req.user?.id || req.auth?.userId, "approver ID");
    const agent = await Agent.findOne(mergeTenantFilter(req, { _id: agentId })).select("_id tenantId user isApproved status approvedBy approvedAt").lean();

    if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });

    const updatedAgent = await Agent.findOneAndUpdate(
      mergeTenantFilter(req, { _id: agentId }),
      { $set: { isApproved: true, status: "active", approvedBy: approverId, approvedAt: new Date() } },
      { new: true, runValidators: true }
    ).populate("user", "name email phone role status").lean();

    if (!updatedAgent) return res.status(404).json({ success: false, message: "Agent could not be approved" });

    if (agent.user) {
      const userId = toObjectId(agent.user, "agent user ID");
      const linkedUser = await User.findOneAndUpdate(
        mergeTenantFilter(req, { _id: userId }),
        { $set: { role: "agent", legacyRole: "agent", status: "active", isActive: true } },
        { new: true, runValidators: true }
      ).select("_id name email phone role status isActive").lean();

      if (!linkedUser) {
        // Roll back the approval if the linked account is missing from the same tenant.
        await Agent.updateOne(mergeTenantFilter(req, { _id: agentId }), { $set: { isApproved: false, status: agent.status, approvedBy: agent.approvedBy || null, approvedAt: agent.approvedAt || null } });
        return res.status(422).json({ success: false, code: "AGENT_USER_NOT_FOUND", message: "The agent's linked user account could not be found in this tenant." });
      }
    } else {
      await Agent.updateOne(mergeTenantFilter(req, { _id: agentId }), { $set: { isApproved: false, status: agent.status, approvedBy: agent.approvedBy || null, approvedAt: agent.approvedAt || null } });
      return res.status(422).json({ success: false, code: "AGENT_USER_NOT_LINKED", message: "The agent is not linked to a user account." });
    }

    return res.json({ success: true, message: "Agent approved successfully", data: updatedAgent });
  } catch (error) {
    console.error("Admin agent approval failed:", error);
    return res.status(error.status || 500).json({
      success: false,
      code: error.code || "AGENT_APPROVAL_FAILED",
      message: error.status === 400 ? error.message : (error.message || "Unable to approve this agent right now. Please try again."),
    });
  }
};

export const updateAgentStatus = async (req, res) => {
  requireTenantId();
  try {
    const { status } = req.body;
    if (!["active", "inactive", "suspended"].includes(status)) return res.status(400).json({ success: false, message: "Invalid agent status" });
    const agentId = toObjectId(req.params.id, "agent ID");
    const agent = await Agent.findOneAndUpdate(mergeTenantFilter(req, { _id: agentId }), { $set: { status } }, { new: true, runValidators: true }).lean();
    if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });
    return res.json({ success: true, message: "Agent status updated", data: agent });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};
