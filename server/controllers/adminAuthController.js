/**
 * Purpose: admin Auth Controller HTTP controller. Main declarations: effectiveRole, isPlatformOwner, adminLogin.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { runWithTenant } from "../tenancy/context.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../utils/generateToken.js so this module can use its exported dependencies.
import generateToken from "../utils/generateToken.js";
// Load ../utils/buildPermissions.js so this module can use its exported dependencies.
import buildPermissions from "../utils/buildPermissions.js";
// Load ../utils/roleUtils.js so this module can use its exported dependencies.
import { normalizeRole } from "../utils/roleUtils.js";

// Declare PLATFORM_ROLES for use by the surrounding module or function.
const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);
// Declare ADMIN_ROLES for use by the surrounding module or function.
const ADMIN_ROLES = new Set(["admin", "super_admin", "superadmin"]);

// Declare effectiveRole for use by the surrounding module or function.
const effectiveRole = (user) =>
  normalizeRole(user?.roleId?.name || user?.role || user?.legacyRole);

// Declare isPlatformOwner for use by the surrounding module or function.
const isPlatformOwner = (user, role) =>
  PLATFORM_ROLES.has(role) && !user?.tenantId;

// Declare adminLogin for use by the surrounding module or function.
export const adminLogin = async (req, res) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare email for use by the surrounding module or function.
    const email = String(req.body?.email || "").trim().toLowerCase();
    // Declare password for use by the surrounding module or function.
    const password = String(req.body?.password || "");

    // Check the condition (!email || !password) and run the matching branch.
    if (!email || !password) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Platform SuperAdmins are global accounts and must be resolved outside
    // tenant scope. Tenant admins remain subject to the active tenant context.
    // Declare platformUser for use by the surrounding module or function.
    const platformUser = await runWithTenant(
      { tenantId: null, tenant: null, role: "super_admin", bypass: true },
      async () =>
        User.findOne({
          email,
          role: { $in: ["super_admin", "superadmin"] },
          tenantId: null,
        })
          .select("+password")
          .populate({ path: "roleId", populate: { path: "permissions" } })
          .populate("permissionsOverride")
    );

    // Declare user for use by the surrounding module or function.
    let user = platformUser;

    // If this is not a platform account, use the current tenant context so a
    // tenant admin cannot authenticate against another company's account.
    // Check the condition (!user) and run the matching branch.
    if (!user) {
      // Perform the side effect or state update expressed on the following line.
      user = await User.findOne({ email })
        .select("+password")
        .populate({ path: "roleId", populate: { path: "permissions" } })
        .populate("permissionsOverride");
    }

    // Check the condition (!user || user.status !== "active" || !(await user.matchPassword(passwo) and run the matching branch.
    if (!user || user.status !== "active" || !(await user.matchPassword(password))) {
      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Declare role for use by the surrounding module or function.
    const role = effectiveRole(user);
    // Check the condition (!ADMIN_ROLES.has(role)) and run the matching branch.
    if (!ADMIN_ROLES.has(role)) {
      // Return the result of res.status(403).json() to the caller.
      return res.status(403).json({ success: false, message: "Administrative access required." });
    }

    // Declare platformOwner for use by the surrounding module or function.
    const platformOwner = isPlatformOwner(user, role);
    // Declare permissions for use by the surrounding module or function.
    const permissions = buildPermissions(user);
    // Declare token for use by the surrounding module or function.
    const token = generateToken({
      _id: user._id,
      roleId: user.roleId,
      role,
      email: user.email,
      permissions,
      tenantId: platformOwner ? null : (user.tenantId || null),
    });

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role,
        tenantId: platformOwner ? null : (user.tenantId || null),
        permissions,
        status: user.status,
      },
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("ADMIN LOGIN ERROR:", error);
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({ success: false, message: "Unable to complete admin login." });
  }
};
