/**
 * Purpose: admin User Profile Controller HTTP controller. Main declarations: normalizeRole, updateUserProfile.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Role.js so this module can use its exported dependencies.
import Role from "../models/Role.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { requireTenantId } from "../tenancy/context.js";

// Declare normalizeRole for use by the surrounding module or function.
const normalizeRole = (value) => String(value || "").toLowerCase().replace(/[\s-]/g, "_");
// Declare roleMap for use by the surrounding module or function.
const roleMap = { customer: "customer", admin: "admin", manager: "manager", tour_manager: "manager", guide: "tour_guide", tour_guide: "tour_guide", driver: "driver", agent: "agent" };

// Declare updateUserProfile for use by the surrounding module or function.
export const updateUserProfile = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare { id } for use by the surrounding module or function.
    const { id } = req.params;
    // Check the condition (!mongoose.Types.ObjectId.isValid(id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid user ID." });
    // Declare user for use by the surrounding module or function.
    const user = await User.findOne({ _id: id, tenantId });
    // Check the condition (!user) and run the matching branch.
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    // Check the condition (["super_admin", "superadmin"].includes(String(user.role || "").toLower) and run the matching branch.
    if (["super_admin", "superadmin"].includes(String(user.role || "").toLowerCase())) return res.status(403).json({ success: false, message: "SuperAdmin accounts cannot be edited here." });

    // Declare name for use by the surrounding module or function.
    const name = String(req.body?.name ?? user.name).trim();
    // Declare email for use by the surrounding module or function.
    const email = String(req.body?.email ?? user.email).trim().toLowerCase();
    // Declare phone for use by the surrounding module or function.
    const phone = String(req.body?.phone ?? user.phone).trim();
    // Check the condition (!name || !email || !/^\d{10}$/.test(phone)) and run the matching branch.
    if (!name || !email || !/^\d{10}$/.test(phone)) return res.status(400).json({ success: false, message: "Name, email and a 10-digit phone are required." });
    // Declare duplicate for use by the surrounding module or function.
    const duplicate = await User.findOne({ tenantId, _id: { $ne: user._id }, $or: [{ email }, { phone }] }).select("email phone").lean();
    // Check the condition (duplicate) and run the matching branch.
    if (duplicate) return res.status(409).json({ success: false, message: `Another user with this ${duplicate.email === email ? "email" : "phone number"} already exists for this company.` });

    // Declare [customerProfile, staffProfile, agentProfile] for use by the surrounding module or function.
    const [customerProfile, staffProfile, agentProfile] = await Promise.all([
      Customer.findOne({ tenantId, user: user._id, isDeleted: { $ne: true } }).select("_id").lean(),
      Staff.findOne({ tenantId, user: user._id, isDeleted: { $ne: true } }).select("_id").lean(),
      Agent.findOne({ tenantId, user: user._id }).select("_id").lean(),
    ]);
    // Declare customerOnly for use by the surrounding module or function.
    const customerOnly = Boolean(customerProfile && !staffProfile && !agentProfile);

    // Perform the side effect or state update expressed on the following line.
    user.name = name; user.email = email; user.phone = phone;
    // Check the condition (req.body?.role !== undefined) and run the matching branch.
    if (req.body?.role !== undefined) {
      // Declare requested for use by the surrounding module or function.
      const requested = normalizeRole(req.body.role);
      // Check the condition (customerOnly && requested !== "customer") and run the matching branch.
      if (customerOnly && requested !== "customer") return res.status(409).json({ success: false, message: "This account is linked to a customer profile. Keep the role as Customer or convert the customer through the dedicated customer workflow." });
      // Declare canonicalRole for use by the surrounding module or function.
      const canonicalRole = customerOnly ? "customer" : roleMap[requested];
      // Check the condition (!canonicalRole) and run the matching branch.
      if (!canonicalRole) return res.status(400).json({ success: false, message: "Invalid role." });
      // Declare roleDoc for use by the surrounding module or function.
      const roleDoc = await Role.findOne({ name: canonicalRole }).select("_id name");
      // Check the condition (!roleDoc) and run the matching branch.
      if (!roleDoc) return res.status(400).json({ success: false, message: "The selected role is not configured." });
      // Perform the side effect or state update expressed on the following line.
      user.role = canonicalRole; user.legacyRole = canonicalRole; user.roleId = roleDoc._id;
      // Declare staff for use by the surrounding module or function.
      const staff = await Staff.findOne({ tenantId, user: user._id, isDeleted: { $ne: true } });
      // Check the condition (staff && ["guide", "driver", "admin", "manager", "tour_manager"].inclu) and run the matching branch.
      if (staff && ["guide", "driver", "admin", "manager", "tour_manager"].includes(requested)) {
        // Perform the side effect or state update expressed on the following line.
        staff.position = requested === "guide" ? "guide" : requested === "driver" ? "driver" : requested === "manager" || requested === "tour_manager" ? "tour_manager" : "admin";
        // Perform the side effect or state update expressed on the following line.
        staff.role = requested === "guide" ? "guide" : requested === "driver" ? "driver" : requested === "manager" || requested === "tour_manager" ? "manager" : "admin";
        // Perform the side effect or state update expressed on the following line.
        staff.name = name; staff.email = email; staff.phone = phone;
        // Perform the side effect or state update expressed on the following line.
        await staff.save();
      }
    }
    // Perform the side effect or state update expressed on the following line.
    await user.save();
    // Declare safe for use by the surrounding module or function.
    const safe = await User.findById(user._id).select("-password").populate("roleId", "name displayName permissions").lean();
    // Declare result for use by the surrounding module or function.
    const result = { ...safe, role: safe.roleId?.name || safe.role || safe.legacyRole, isActive: safe.status === "active" };
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "User updated successfully.", user: result, data: result });
  } catch (error) {
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "A user or staff account with these details already exists for this company." });
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};