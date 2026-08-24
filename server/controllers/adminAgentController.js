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

/*
|--------------------------------------------------------------------------
| GET ALL AGENTS
|--------------------------------------------------------------------------
*/
export const getAgents = async (req, res) => {
  requireTenantId();
  try {
    const agents = await Agent.find(tenantFilter(req))
      .populate("user", "name email phone role")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: agents });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE AGENT
|--------------------------------------------------------------------------
*/
export const getAgentById = async (req, res) => {
  requireTenantId();
  try {
    const agentId = toObjectId(req.params.id, "agent ID");
    const agent = await Agent.findOne(
      mergeTenantFilter(req, { _id: agentId })
    )
      .populate("user", "name email phone role")
      .lean();

    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    res.json({ success: true, data: agent });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| APPROVE AGENT
|--------------------------------------------------------------------------
*/
export const approveAgent = async (req, res) => {
  requireTenantId();
  try {
    // Never pass Express/Mongoose request objects or hydrated documents into a
    // MongoDB filter/update. Convert both IDs to primitive ObjectIds first.
    const agentId = toObjectId(req.params.id, "agent ID");
    const approverId = toObjectId(req.user?._id, "approver ID");

    const agent = await Agent.findOne(
      mergeTenantFilter(req, { _id: agentId })
    ).select("_id tenantId user isApproved status approvedBy approvedAt").lean();

    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    const approvedAt = new Date();
    const updatedAgent = await Agent.findOneAndUpdate(
      mergeTenantFilter(req, { _id: agentId }),
      {
        $set: {
          isApproved: true,
          status: "active",
          approvedBy: approverId,
          approvedAt,
        },
      },
      { new: true, runValidators: true }
    )
      .populate("user", "name email phone role status")
      .lean();

    if (!updatedAgent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    // Approval must also activate the linked account so the approved agent can
    // actually sign in and use agent operations. Keep this update tenant-scoped.
    if (agent.user) {
      const userId = toObjectId(agent.user, "agent user ID");
      await User.findOneAndUpdate(
        mergeTenantFilter(req, { _id: userId }),
        {
          $set: {
            role: "agent",
            legacyRole: "agent",
            status: "active",
          },
        },
        { new: true, runValidators: true }
      ).select("_id name email phone role status").lean();
    }

    return res.json({
      success: true,
      message: "Agent approved successfully",
      data: updatedAgent,
    });
  } catch (error) {
    console.error("Admin agent approval failed:", error);
    return res.status(error.status || 500).json({
      success: false,
      code: error.code || "AGENT_APPROVAL_FAILED",
      message: error.status === 400
        ? error.message
        : "Unable to approve this agent right now. Please try again.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE AGENT STATUS
|--------------------------------------------------------------------------
*/
export const updateAgentStatus = async (req, res) => {
  requireTenantId();
  try {
    const { status } = req.body;
    const allowedStatuses = ["active", "inactive", "suspended"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid agent status",
      });
    }

    const agentId = toObjectId(req.params.id, "agent ID");
    const agent = await Agent.findOneAndUpdate(
      mergeTenantFilter(req, { _id: agentId }),
      { $set: { status } },
      { new: true, runValidators: true }
    ).lean();

    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    res.json({
      success: true,
      message: "Agent status updated",
      data: agent,
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};
