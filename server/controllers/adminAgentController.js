import mongoose from "mongoose";
import { mergeTenantFilter, requireTenantId, getTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Agent from "../models/Agent.js";
import User from "../models/User.js";

const extractId = (value) => {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (mongoose.isValidObjectId(value)) return String(value);
  if (value._id != null) return extractId(value._id);
  if (value.id != null) return extractId(value.id);
  if (typeof value.toHexString === "function") return value.toHexString();
  if (typeof value.toString === "function") {
    const stringValue = value.toString();
    if (stringValue && stringValue !== "[object Object]") return stringValue.trim();
  }
  return "";
};

const toObjectId = (value, fieldName) => {
  const id = extractId(value);
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error(`Invalid ${fieldName}.`);
    error.status = 400;
    error.code = "INVALID_OBJECT_ID";
    throw error;
  }
  return new mongoose.Types.ObjectId(id);
};

const getSafeTenantId = () => toObjectId(getTenantId(), "tenant ID");

const tenantScopedFilter = (filter = {}) => ({
  ...filter,
  tenantId: getSafeTenantId(),
});

export const getAgents = async (req, res) => {
  requireTenantId();
  try {
    const agents = await Agent.find(tenantFilter(req))
      .populate("user", "name email phone role status")
      .sort({ createdAt: -1 })
      .lean();
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
    const agent = await Agent.findOne(tenantScopedFilter({ _id: agentId }))
      .populate("user", "name email phone role status")
      .lean();
    if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });
    return res.json({ success: true, data: agent });
  } catch (error) {
    console.error("Admin get agent error:", error);
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const approveAgent = async (req, res) => {
  requireTenantId();
  try {
    // Convert every identifier to a primitive ObjectId before it reaches Mongoose.
    // This prevents hydrated Express/Mongoose objects from being serialized into
    // BSON and causing "Cannot convert circular structure to BSON" failures.
    const agentId = toObjectId(req.params.id, "agent ID");
    const approverId = toObjectId(req.user?._id ?? req.user?.id ?? req.auth?.userId, "approver ID");
    const tenantId = getSafeTenantId();

    const filter = { _id: agentId, tenantId };
    const agent = await Agent.findOne(filter)
      .select("_id tenantId user isApproved status approvedBy approvedAt")
      .lean();

    if (!agent) return res.status(404).json({ success: false, code: "AGENT_NOT_FOUND", message: "Agent not found in the current tenant." });

    const linkedUserId = toObjectId(agent.user, "agent user ID");
    const linkedUser = await User.findOne({ _id: linkedUserId, tenantId })
      .select("_id tenantId name email phone role legacyRole status isActive")
      .lean();

    if (!linkedUser) {
      return res.status(422).json({
        success: false,
        code: "AGENT_USER_NOT_FOUND",
        message: "The agent's linked user account could not be found in this tenant.",
      });
    }

    // Update the linked account first. Both the filter and update values are
    // primitive values, so no request/document object can enter the BSON payload.
    const activatedUser = await User.findOneAndUpdate(
      { _id: linkedUserId, tenantId },
      {
        $set: {
          role: "agent",
          legacyRole: "agent",
          status: "active",
          isActive: true,
        },
      },
      { new: true, runValidators: true }
    )
      .select("_id tenantId name email phone role legacyRole status isActive")
      .lean();

    if (!activatedUser) {
      return res.status(422).json({
        success: false,
        code: "AGENT_USER_ACTIVATION_FAILED",
        message: "The linked agent user account could not be activated.",
      });
    }

    const approvedAt = new Date();
    const updatedAgent = await Agent.findOneAndUpdate(
      filter,
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
      // Best-effort rollback of the user activation if the agent update fails.
      await User.updateOne(
        { _id: linkedUserId, tenantId },
        {
          $set: {
            role: linkedUser.role || "customer",
            legacyRole: linkedUser.legacyRole || linkedUser.role || "customer",
            status: linkedUser.status || "inactive",
            isActive: linkedUser.isActive !== false,
          },
        }
      ).catch((rollbackError) => console.error("Agent approval user rollback failed:", rollbackError));

      return res.status(422).json({
        success: false,
        code: "AGENT_APPROVAL_UPDATE_FAILED",
        message: "The agent approval could not be completed.",
      });
    }

    return res.json({
      success: true,
      message: "Agent approved successfully",
      data: updatedAgent,
    });
  } catch (error) {
    console.error("Admin agent approval failed:", {
      name: error?.name,
      code: error?.code,
      status: error?.status,
      message: error?.message,
      stack: error?.stack,
    });

    const message = error?.status === 400
      ? error.message
      : error?.name === "ValidationError"
        ? Object.values(error.errors || {}).map((item) => item.message).join("; ") || error.message
        : error?.message || "Unable to approve this agent right now. Please try again.";

    return res.status(error.status || 500).json({
      success: false,
      code: error.code || "AGENT_APPROVAL_FAILED",
      message,
    });
  }
};

export const updateAgentStatus = async (req, res) => {
  requireTenantId();
  try {
    const status = String(req.body?.status || "").trim().toLowerCase();
    if (!["active", "inactive", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid agent status" });
    }

    const agentId = toObjectId(req.params.id, "agent ID");
    const agent = await Agent.findOneAndUpdate(
      tenantScopedFilter({ _id: agentId }),
      { $set: { status } },
      { new: true, runValidators: true }
    ).lean();

    if (!agent) return res.status(404).json({ success: false, message: "Agent not found" });
    return res.json({ success: true, message: "Agent status updated", data: agent });
  } catch (error) {
    console.error("Admin agent status update failed:", error);
    return res.status(error.status || 500).json({ success: false, message: error.message });
  }
};
