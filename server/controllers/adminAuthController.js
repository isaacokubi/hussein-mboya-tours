import { mergeTenantFilter } from "../tenancy/context.js";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import buildPermissions from "../utils/buildPermissions.js";
import { normalizeRole } from "../utils/roleUtils.js";

export const adminLogin = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    const user = await User.findOne({ email })
      .select("+password")
      .populate({ path: "roleId", populate: { path: "permissions" } })
      .populate("permissionsOverride");

    if (!user || user.status !== "active" || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const role = normalizeRole(user.roleId?.name || user.role || user.legacyRole);
    if (!["admin", "super_admin"].includes(role)) {
      return res.status(403).json({ success: false, message: "Administrative access required." });
    }

    const permissions = buildPermissions(user);
    const token = generateToken({
      _id: user._id,
      roleId: user.roleId,
      role,
      email: user.email,
      permissions,
      tenantId: user.tenantId,
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
        permissions,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to complete admin login." });
  }
};
