/**
 * Purpose: agent Middleware request middleware. Main declarations: agentMiddleware, requireApprovedAgent.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// Canonical agent authorization.
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";
// Load ../utils/roleUtils.js so this module can use its exported dependencies.
import { getUserRole } from "../utils/roleUtils.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

// Declare agentMiddleware for use by the surrounding module or function.
const agentMiddleware = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Check the condition (!req.user?._id) and run the matching branch.
    if (!req.user?._id) {
      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // Declare user for use by the surrounding module or function.
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("roleId")
      .lean();

    // Check the condition (!user) and run the matching branch.
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    // Check the condition (user.status !== "active" || user.isActive === false) and run the matching branch.
    if (user.status !== "active" || user.isActive === false) {
      // Return the result of res.status(403).json() to the caller.
      return res.status(403).json({ success: false, message: "Your account is inactive" });
    }

    // Check the condition (getUserRole(user) !== "agent") and run the matching branch.
    if (getUserRole(user) !== "agent") {
      // Return the result of res.status(403).json() to the caller.
      return res.status(403).json({ success: false, message: "Travel Agent access required" });
    }

    // Declare agent for use by the surrounding module or function.
    let agent = await Agent.findOne(mergeTenantFilter({ user: user._id })).lean();

    // Check the condition (!agent && user.email) and run the matching branch.
    if (!agent && user.email) {
      // Perform the side effect or state update expressed on the following line.
      agent = await Agent.findOne(mergeTenantFilter({ email: String(user.email).trim().toLowerCase() })).lean();
      // Check the condition (agent) and run the matching branch.
      if (agent) {
        // Perform the side effect or state update expressed on the following line.
        await Agent.updateOne(mergeTenantFilter({ _id: agent._id }), { $set: { user: user._id } });
      }
    }

    // Check the condition (!agent) and run the matching branch.
    if (!agent) {
      // Return the result of res.status(403).json() to the caller.
      return res.status(403).json({
        success: false,
        message: "Agent profile not found. Ask an administrator to complete the agent account.",
      });
    }

    // Perform the side effect or state update expressed on the following line.
    req.user = user;
    // Perform the side effect or state update expressed on the following line.
    req.agent = agent;
    // Perform the side effect or state update expressed on the following line.
    req.agentPendingApproval = agent.isApproved === false;
    // Perform the side effect or state update expressed on the following line.
    next();
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Agent Middleware Error:", error);
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({ success: false, message: "Server error while authorizing agent" });
  }
};

export default agentMiddleware;

// Declare requireApprovedAgent for use by the surrounding module or function.
export const requireApprovedAgent = (req, res, next) => {
  // Check the condition (req.agentPendingApproval) and run the matching branch.
  if (req.agentPendingApproval) {
    // Return the result of res.status(403).json() to the caller.
    return res.status(403).json({
      success: false,
      message: "Agent account is pending approval. Ask an administrator to approve the agent account before using operational agent features.",
    });
  }
  // Check the condition (String(req.agent?.status || "").toLowerCase() !== "active") and run the matching branch.
  if (String(req.agent?.status || "").toLowerCase() !== "active") {
    // Return the result of res.status(403).json() to the caller.
    return res.status(403).json({
      success: false,
      message: `Agent account is ${String(req.agent?.status || "inactive").toLowerCase()}. Ask an administrator to reactivate the account before using operational agent features.`,
    });
  }
  // Perform the side effect or state update expressed on the following line.
  next();
};
