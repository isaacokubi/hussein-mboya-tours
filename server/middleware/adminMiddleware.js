/**
 * Purpose: admin Middleware request middleware. Main declarations: adminMiddleware.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// Canonical administrator authorization.
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../utils/roleUtils.js so this module can use its exported dependencies.
import { getUserRole } from "../utils/roleUtils.js";

// Declare adminMiddleware for use by the surrounding module or function.
const adminMiddleware = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!req.user?._id) and run the matching branch.
    if (!req.user?._id) {
      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // Declare user for use by the surrounding module or function.
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate({ path: "roleId", populate: { path: "permissions" } })
      .populate("permissionsOverride");

    // Check the condition (!user) and run the matching branch.
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    // Check the condition (user.isActive === false || ["inactive", "disabled", "blocked", "suspen) and run the matching branch.
    if (
      user.isActive === false ||
      ["inactive", "disabled", "blocked", "suspended"].includes(String(user.status || "").toLowerCase())
    ) {
      // Return the result of res.status(403).json() to the caller.
      return res.status(403).json({ success: false, message: "Your account is inactive" });
    }

    // Declare roleName for use by the surrounding module or function.
    const roleName = getUserRole(user);
    // Check the condition (!["admin", "super_admin"].includes(roleName)) and run the matching branch.
    if (!["admin", "super_admin"].includes(roleName)) {
      // Return the result of res.status(403).json() to the caller.
      return res.status(403).json({ success: false, message: "Admin access required", role: roleName });
    }

    // Perform the side effect or state update expressed on the following line.
    req.user = user;
    // Perform the side effect or state update expressed on the following line.
    req.userRole = roleName;
    // Perform the side effect or state update expressed on the following line.
    next();
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Admin Middleware Error:", error);
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({ success: false, message: "Server error while authorizing user" });
  }
};

export default adminMiddleware;
