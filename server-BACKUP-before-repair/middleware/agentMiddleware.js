// server/middleware/agentMiddleware.js

import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| AGENT AUTHORIZATION MIDDLEWARE
|--------------------------------------------------------------------------
|
| Verifies:
| - User is authenticated
| - User exists
| - Account is active
| - User has Travel Agent role
| - Agent profile exists
| - Agent has been approved
|
|--------------------------------------------------------------------------
*/

const agentMiddleware = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | LOAD USER
    |--------------------------------------------------------------------------
    */

    const user = await User.findById(req.user._id)
      .populate("role");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | ACCOUNT STATUS
    |--------------------------------------------------------------------------
    */

    if (
      user.isActive === false ||
      user.status === "inactive" ||
      user.status === "blocked" ||
      user.status === "suspended"
    ) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET ROLE NAME
    |--------------------------------------------------------------------------
    */

    let roleName = "";

    if (
      user.role &&
      typeof user.role === "object" &&
      user.role.name
    ) {
      roleName = user.role.name.toLowerCase();
    } else if (typeof user.role === "string") {
      roleName = user.role.toLowerCase();
    } else if (user.legacyRole) {
      roleName = user.legacyRole.toLowerCase();
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFY AGENT ROLE
    |--------------------------------------------------------------------------
    */

    if (roleName !== "travel_agent") {
      return res.status(403).json({
        success: false,
        message: "Travel Agent access required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFY AGENT PROFILE
    |--------------------------------------------------------------------------
    */

    if (!user.agentProfile) {
      return res.status(403).json({
        success: false,
        message: "Agent profile not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFY APPROVAL
    |--------------------------------------------------------------------------
    */

    if (!user.agentProfile.approved) {
      return res.status(403).json({
        success: false,
        message: "Agent account is pending approval",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | MAKE FULL USER AVAILABLE
    |--------------------------------------------------------------------------
    */

    req.user = user;

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