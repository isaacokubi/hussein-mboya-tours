import mongoose from "mongoose";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Staff from "../models/Staff.js";
import { requireTenantId } from "../tenancy/context.js";

const normalizeRole = (value) => String(value || "").toLowerCase().replace(/[\s-]/g, "_");
const roleMap = { admin: "admin", manager: "manager", tour_manager: "manager", guide: "tour_guide", tour_guide: "tour_guide", driver: "driver", agent: "agent" };

export const updateUserProfile = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid user ID." });

    const user = await User.findOne({ _id: id, tenantId });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    if (["super_admin", "superadmin"].includes(String(user.role || "").toLowerCase())) return res.status(403).json({ success: false, message: "SuperAdmin accounts cannot be edited here." });

    const name = String(req.body?.name ?? user.name).trim();
    const email = String(req.body?.email ?? user.email).trim().toLowerCase();
    const phone = String(req.body?.phone ?? user.phone).trim();
    if (!name || !email || !/^\d{10}$/.test(phone)) return res.status(400).json({ success: false, message: "Name, email and a 10-digit phone are required." });

    const duplicate = await User.findOne({ tenantId, _id: { $ne: user._id }, $or: [{ email }, { phone }] }).select("email phone").lean();
    if (duplicate) return res.status(409).json({ success: false, message: `Another user with this ${duplicate.email === email ? "email" : "phone number"} already exists for this company.` });

    user.name = name;
    user.email = email;
    user.phone = phone;

    if (req.body?.role !== undefined) {
      const requested = normalizeRole(req.body.role);
      const canonicalRole = roleMap[requested];
      if (!canonicalRole) return res.status(400).json({ success: false, message: "Choose admin, manager, agent, guide or driver." });
      const roleDoc = await Role.findOne({ name: canonicalRole }).select("_id name");
      if (!roleDoc) return res.status(400).json({ success: false, message: "The selected role is not configured." });
      user.role = canonicalRole;
      user.legacyRole = canonicalRole;
      user.roleId = roleDoc._id;

      const staff = await Staff.findOne({ tenantId, user: user._id, isDeleted: { $ne: true } });
      if (staff) {
        const position = requested === "guide" ? "guide" : requested === "driver" ? "driver" : requested === "manager" || requested === "tour_manager" ? "tour_manager" : requested === "admin" ? "admin" : staff.position;
        if (["admin", "manager", "guide", "driver"].includes(requested) || requested === "tour_manager") {
          staff.position = position;
          staff.role = requested === "guide" ? "guide" : requested === "driver" ? "driver" : requested === "manager" || requested === "tour_manager" ? "manager" : "admin";
          staff.name = name;
          staff.email = email;
          staff.phone = phone;
          await staff.save();
        }
      }
    }

    await user.save();
    const safe = await User.findById(user._id).select("-password").populate("roleId", "name displayName permissions").lean();
    const result = { ...safe, role: safe.roleId?.name || safe.role || safe.legacyRole, isActive: safe.status === "active" };
    return res.json({ success: true, message: "User updated successfully.", user: result, data: result });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "A user or staff account with these details already exists for this company." });
    next(error);
  }
};