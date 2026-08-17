// Canonical agent authorization.
import User from "../models/User.js";
import Agent from "../models/Agent.js";
import { getUserRole } from "../utils/roleUtils.js";

const agentMiddleware = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("roleId")
      .lean();

    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    if (user.status !== "active" || user.isActive === false) {
      return res.status(403).json({ success: false, message: "Your account is inactive" });
    }

    if (getUserRole(user) !== "agent") {
      return res.status(403).json({ success: false, message: "Travel Agent access required" });
    }

    let agent = await Agent.findOne({ user: user._id }).lean();

    if (!agent && user.email) {
      agent = await Agent.findOne({ email: String(user.email).trim().toLowerCase() }).lean();
      if (agent) {
        await Agent.updateOne({ _id: agent._id }, { $set: { user: user._id } });
      }
    }

    if (!agent) {
      return res.status(403).json({
        success: false,
        message: "Agent profile not found. Ask an administrator to complete the agent account.",
      });
    }

    req.user = user;
    req.agent = agent;
    req.agentPendingApproval = agent.isApproved === false;
    next();
  } catch (error) {
    console.error("Agent Middleware Error:", error);
    return res.status(500).json({ success: false, message: "Server error while authorizing agent" });
  }
};

export default agentMiddleware;

export const requireApprovedAgent = (req, res, next) => {
  if (req.agentPendingApproval) {
    return res.status(403).json({
      success: false,
      message: "Agent account is pending approval. Ask an administrator to approve the agent account before using operational agent features.",
    });
  }
  next();
};
