import { runWithTenant } from "../tenancy/context.js";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import buildPermissions from "../utils/buildPermissions.js";
import { normalizeRole } from "../utils/roleUtils.js";

const PLATFORM_ROLES = new Set(["super_admin", "superadmin"]);
const ADMIN_ROLES = new Set(["admin", "super_admin", "superadmin"]);

const effectiveRole = (user) =>
  normalizeRole(user?.roleId?.name || user?.role || user?.legacyRole);

const isPlatformOwner = (user, role) =>
  PLATFORM_ROLES.has(role) && !user?.tenantId;

export const adminLogin = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Platform SuperAdmins are global accounts and must be resolved outside
    // tenant scope. Tenant admins remain subject to the active tenant context.
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

    let user = platformUser;

    // If this is not a platform account, use the current tenant context so a
    // tenant admin cannot authenticate against another company's account.
    if (!user) {
      user = await User.findOne({ email })
        .select("+password")
        .populate({ path: "roleId", populate: { path: "permissions" } })
        .populate("permissionsOverride");
    }

    if (!user || user.status !== "active" || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const role = effectiveRole(user);
    if (!ADMIN_ROLES.has(role)) {
      return res.status(403).json({ success: false, message: "Administrative access required." });
    }

    const platformOwner = isPlatformOwner(user, role);
    const permissions = buildPermissions(user);
    const token = generateToken({
      _id: user._id,
      roleId: user.roleId,
      role,
      email: user.email,
      permissions,
      tenantId: platformOwner ? null : (user.tenantId || null),
    });

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
    console.error("ADMIN LOGIN ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to complete admin login." });
  }
};
