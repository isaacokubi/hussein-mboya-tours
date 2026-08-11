// server/middleware/agentMiddleware.js
//
// Canonical agent authorization:
// - authenticated active User
// - role: agent / travel_agent
// - linked Agent profile
// - approved Agent profile

import User from "../models/User.js";
import Agent from "../models/Agent.js";

const normalizeRole = (role) =>
  String(
    typeof role === "object"
      ? role?.name || role?.role || ""
      : role || ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const agentMiddleware = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("roleId")
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      user.status !== "active" ||
      user.isActive === false
    ) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    const roleName = normalizeRole(
      user.roleId?.name || user.role || user.legacyRole
    );

    if (!["agent", "travelagent"].includes(roleName)) {
      return res.status(403).json({
        success: false,
        message: "Travel Agent access required",
      });
    }

    let agent = await Agent.findOne({ user: user._id }).lean();

    // Legacy agent records were sometimes created before the User reference
    // was stored. Resolve by email and self-heal the link.
    if (!agent && user.email) {
      agent = await Agent.findOne({
        email: String(user.email).toLowerCase(),
      }).lean();
      if (agent) {
        await Agent.updateOne(
          { _id: agent._id },
          { $set: { user: user._id } }
        );
      }
    }

    if (!agent) {
      return res.status(403).json({
        success: false,
        message: "Agent profile not found. Ask an administrator to complete the agent account.",
      });
    }

    if (!agent.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Agent account is pending approval",
      });
    }

    req.user = user;
    req.agent = agent;

    next();
  } catch (error) {
    console.error("Agent Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while authorizing agent",
    });
  }
};

export default agentMiddleware;
