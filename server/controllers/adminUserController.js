/**
 * Purpose: admin User Controller HTTP controller. Main declarations: isDuplicateKeyError, duplicateMessage, canonicalizeUsers, getUsers, createStaffAccount.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { requireTenantId } from "../tenancy/context.js";
// Load mongoose so this module can use its exported dependencies.
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
// Load ../services/onboardingService.js so this module can use its exported dependencies.
import { ensureSystemRoles } from "../services/onboardingService.js";
// Load ../services/tenantIndexRepair.js so this module can use its exported dependencies.
import { createWithTenantIndexRepair, isTenantIndexConflict } from "../services/tenantIndexRepair.js";

// Declare STATUS_VALUES for use by the surrounding module or function.
const STATUS_VALUES = ["active", "inactive", "disabled", "suspended", "blocked"];
// Declare isDuplicateKeyError for use by the surrounding module or function.
const isDuplicateKeyError = (error) => error?.code === 11000;
// Declare duplicateMessage for use by the surrounding module or function.
const duplicateMessage = (error) => { const pattern = error?.keyPattern || {}; const keys = Object.keys(pattern); const key = keys[0]; if (keys.length === 1 && key === "tenantId") return "A legacy tenant index was repaired automatically. Please submit the account creation again."; if (key === "email") return "A user or staff account with this email already exists for this company."; if (key === "phone") return "A user with this phone number already exists for this company."; return "A record with these details already exists."; };

// Declare canonicalizeUsers for use by the surrounding module or function.
const canonicalizeUsers = async (users, tenantId) => {
  // Check the condition (!users.length || !tenantId) and run the matching branch.
  if (!users.length || !tenantId) return users;
  // Declare ids for use by the surrounding module or function.
  const ids = users.map((user) => user._id);
  // Declare [customers, staff, agents] for use by the surrounding module or function.
  const [customers, staff, agents] = await Promise.all([
    Customer.find({ tenantId, user: { $in: ids }, isDeleted: { $ne: true } }).select("user").lean(),
    Staff.find({ tenantId, user: { $in: ids }, isDeleted: { $ne: true } }).select("user").lean(),
    Agent.find({ tenantId, user: { $in: ids } }).select("user").lean(),
  ]);
  // Declare customerIds for use by the surrounding module or function.
  const customerIds = new Set(customers.filter((item) => item.user).map((item) => String(item.user)));
  // Declare operationalIds for use by the surrounding module or function.
  const operationalIds = new Set([...staff, ...agents].filter((item) => item.user).map((item) => String(item.user)));
  // Declare customerRole for use by the surrounding module or function.
  const customerRole = await Role.findOne({ name: "customer" }).select("_id name").lean();

  // Repeat the enclosed work for each required iteration.
  for (const user of users) {
    // Declare id for use by the surrounding module or function.
    const id = String(user._id);
    // Declare hasCustomerProfile for use by the surrounding module or function.
    const hasCustomerProfile = customerIds.has(id);
    // Declare hasOperationalIdentity for use by the surrounding module or function.
    const hasOperationalIdentity = operationalIds.has(id);
    // Declare isProtected for use by the surrounding module or function.
    const isProtected = ["super_admin", "superadmin"].includes(String(user.role || "").toLowerCase());
    // Declare shouldBeCustomer for use by the surrounding module or function.
    const shouldBeCustomer = hasCustomerProfile && !hasOperationalIdentity && !isProtected;
    // Check the condition (shouldBeCustomer) and run the matching branch.
    if (shouldBeCustomer) {
      // Declare needsRepair for use by the surrounding module or function.
      const needsRepair = String(user.role || "").toLowerCase() !== "customer" || String(user.legacyRole || "").toLowerCase() !== "customer" || (customerRole && String(user.roleId || "") !== String(customerRole._id));
      // Check the condition (needsRepair) and run the matching branch.
      if (needsRepair) await User.updateOne({ _id: user._id, tenantId }, { $set: { role: "customer", legacyRole: "customer", ...(customerRole ? { roleId: customerRole._id } : {}) } });
      // Perform the side effect or state update expressed on the following line.
      user.role = "customer";
      // Perform the side effect or state update expressed on the following line.
      user.legacyRole = "customer";
      // Check the condition (customerRole) and run the matching branch.
      if (customerRole) user.roleId = customerRole;
    } else {
      // Perform the side effect or state update expressed on the following line.
      user.role = user.roleId?.name || user.role || user.legacyRole || "customer";
    }
  }
  // Return the value of users to the caller.
  return users;
};

// Declare getUsers for use by the surrounding module or function.
export const getUsers = async (req, res, next) => {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare page for use by the surrounding module or function.
    const page = Math.max(Number(req.query.page) || 1, 1);
    // Declare limit for use by the surrounding module or function.
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    // Declare search for use by the surrounding module or function.
    const search = String(req.query.search || "").trim();
    // Declare query for use by the surrounding module or function.
    const query = { tenantId };
    // Check the condition (search) and run the matching branch.
    if (search) { const regex = { $regex: search, $options: "i" }; query.$or = [{ name: regex }, { email: regex }, { phone: regex }, { role: regex }, { legacyRole: regex }, { status: regex }]; }
    // Declare skip for use by the surrounding module or function.
    const skip = (page - 1) * limit;
    // Declare [users, total] for use by the surrounding module or function.
    const [users, total] = await Promise.all([
      User.find(query).select("-password").populate("roleId", "name displayName permissions").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);
    // Perform the side effect or state update expressed on the following line.
    await canonicalizeUsers(users, tenantId);
    // Declare pages for use by the surrounding module or function.
    const pages = Math.max(1, Math.ceil(total / limit));
    // Declare data for use by the surrounding module or function.
    const data = users.map((user) => ({ ...user, role: user.role || user.roleId?.name || user.legacyRole || "customer", isActive: user.status === "active" }));
    // Return the result of res.json() to the caller.
    return res.json({ success: true, page, limit, total, pages, count: data.length, data, users: data, pagination: { page, limit, total, pages } });
  } catch (error) { next(error); }
};

// Declare createStaffAccount for use by the surrounding module or function.
export const createStaffAccount = async (req, res, next) => {
  // Declare createdUser for use by the surrounding module or function.
  let createdUser = null; let createdStaff = null; let createdAgent = null;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Check the condition (!tenantId) and run the matching branch.
    if (!tenantId) return res.status(400).json({ success: false, message: "Select a company before creating a staff account." });
    // Declare { name, email, phone, password, role } for use by the surrounding module or function.
    const { name, email, phone, password, role } = req.body || {};
    // Declare normalizedRole for use by the surrounding module or function.
    const normalizedRole = String(role || "").toLowerCase().replace(/[\s-]/g, "_");
    // Declare allowed for use by the surrounding module or function.
    const allowed = { admin: "admin", manager: "manager", tour_manager: "manager", guide: "tour_guide", tour_guide: "tour_guide", driver: "driver", agent: "agent", travel_agent: "agent" };
    // Declare canonicalRole for use by the surrounding module or function.
    const canonicalRole = allowed[normalizedRole];
    // Check the condition (!canonicalRole) and run the matching branch.
    if (!canonicalRole) return res.status(400).json({ success: false, message: "Choose admin, manager, agent, guide or driver." });
    // Check the condition (!name?.trim() || !email?.trim() || !/^\d{10}$/.test(String(phone || "") and run the matching branch.
    if (!name?.trim() || !email?.trim() || !/^\d{10}$/.test(String(phone || ""))) return res.status(400).json({ success: false, message: "Name, email and a 10-digit phone are required." });
    // Check the condition (String(password || "").length < 12 || !/[A-Z]/.test(password) || !/\d/) and run the matching branch.
    if (String(password || "").length < 12 || !/[A-Z]/.test(password) || !/\d/.test(password)) return res.status(400).json({ success: false, message: "Password must be at least 12 characters and include an uppercase letter and a number." });
    // Declare agentCompanyName for use by the surrounding module or function.
    const agentCompanyName = String(req.body?.companyName || "").trim();
    // Check the condition (canonicalRole === "agent" && !agentCompanyName) and run the matching branch.
    if (canonicalRole === "agent" && !agentCompanyName) return res.status(400).json({ success: false, message: "Agent company name is required when creating an agent account." });
    // Check the condition (canonicalRole === "agent" && agentCompanyName.length > 150) and run the matching branch.
    if (canonicalRole === "agent" && agentCompanyName.length > 150) return res.status(400).json({ success: false, message: "Agent company name must be 150 characters or fewer." });
    // Declare normalizedEmail for use by the surrounding module or function.
    const normalizedEmail = String(email).trim().toLowerCase(); const normalizedPhone = String(phone).trim();
    // Declare existingUser for use by the surrounding module or function.
    const existingUser = await User.findOne({ tenantId, $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] }).select("_id role email phone tenantId").lean();
    // Check the condition (existingUser) and run the matching branch.
    if (existingUser) { const field = existingUser.email === normalizedEmail ? "email" : "phone number"; return res.status(409).json({ success: false, message: `A user with this ${field} already exists for this company.` }); }
    // Declare existingStaff for use by the surrounding module or function.
    const existingStaff = await Staff.findOne({ tenantId, isDeleted: { $ne: true }, $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] }).select("_id user email phone position tenantId").lean();
    // Check the condition (existingStaff) and run the matching branch.
    if (existingStaff) { const field = existingStaff.email === normalizedEmail ? "email" : "phone number"; return res.status(409).json({ success: false, message: `A staff profile with this ${field} already exists for this company.` }); }
    // Declare permissionNamesByRole for use by the surrounding module or function.
    const permissionNamesByRole = {
      admin: ["admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view", "settings.manage", "roles.manage", "notifications.view", "finance.view", "customer.view", "tour.view", "tour.create", "tour.update", "booking.view", "report.view", "guide.view", "vehicle.view"],
      agent: ["booking.create", "booking.view", "customer.view", "commission.view", "view_agent_dashboard", "view_agent_tours", "create_agent_tour", "edit_agent_tour", "delete_agent_tour"],
      manager: ["tour.view", "tour.create", "tour.update", "booking.view", "booking.cancel", "tour.assign", "tour.availability", "calendar.manage", "customer.view", "guide.view", "vehicle.view", "report.view"],
      tour_guide: ["tour.view", "view_assigned_tours", "view_tour_guests", "update_tour_status", "submit_tour_report"],
      driver: ["tour.view", "view_assigned_tours"],
    };
    // Check the condition (canonicalRole === "admin") and run the matching branch.
    if (canonicalRole === "admin") await ensureSystemRoles();
    // Declare roleDoc for use by the surrounding module or function.
    let roleDoc = await Role.findOne({ name: { $in: [canonicalRole, canonicalRole.replace("tour_", "")] } });
    // Check the condition (!roleDoc) and run the matching branch.
    if (!roleDoc) {
      // Declare permissionIds for use by the surrounding module or function.
      const permissionIds = [];
      // Repeat the enclosed work for each required iteration.
      for (const permissionName of permissionNamesByRole[canonicalRole] || []) { const Permission = (await import("../models/Permission.js")).default; const permission = await Permission.findOneAndUpdate({ name: permissionName }, { $setOnInsert: { name: permissionName, label: permissionName.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), module: permissionName.split(/[._]/)[0], category: "system", isActive: true } }, { upsert: true, new: true }); permissionIds.push(permission._id); }
      // Perform the side effect or state update expressed on the following line.
      roleDoc = await createWithTenantIndexRepair(Role, { name: canonicalRole, displayName: canonicalRole.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), description: `${canonicalRole} access`, permissions: permissionIds, isSystem: ["admin", "manager", "tour_guide", "driver", "agent", "customer"].includes(canonicalRole), level: canonicalRole === "admin" ? 100 : 20 });
    }
    // Check the condition (["super_admin", "superadmin"].includes(roleDoc.name)) and run the matching branch.
    if (["super_admin", "superadmin"].includes(roleDoc.name)) return res.status(403).json({ success: false, message: "SuperAdmin accounts can only be created through the one-time platform bootstrap process." });
    // Perform the side effect or state update expressed on the following line.
    createdUser = await createWithTenantIndexRepair(User, { name: name.trim(), email: normalizedEmail, phone: normalizedPhone, password, role: canonicalRole, legacyRole: canonicalRole, roleId: roleDoc._id, tenantId, status: "active", isVerified: true });
    // Check the condition (canonicalRole === "agent") and run the matching branch.
    if (canonicalRole === "agent") createdAgent = await createWithTenantIndexRepair(Agent, { user: createdUser._id, tenantId, companyName: agentCompanyName, phone: createdUser.phone, email: createdUser.email, commissionRate: 10, isApproved: false, status: "active" });
    // Check the condition (["tour_guide", "driver"].includes(canonicalRole)) and run the matching branch.
    if (["tour_guide", "driver"].includes(canonicalRole)) createdStaff = await createWithTenantIndexRepair(Staff, { user: createdUser._id, tenantId, name: createdUser.name, email: createdUser.email, phone: createdUser.phone, position: canonicalRole === "tour_guide" ? "guide" : "driver", role: canonicalRole === "tour_guide" ? "guide" : "driver", status: "active", isActive: true, availability: "available", createdBy: req.user._id });
    // Check the condition (canonicalRole === "manager") and run the matching branch.
    if (canonicalRole === "manager") createdStaff = await createWithTenantIndexRepair(Staff, { user: createdUser._id, tenantId, name: createdUser.name, email: createdUser.email, phone: createdUser.phone, position: "tour_manager", role: "manager", status: "active", isActive: true, availability: "available", createdBy: req.user._id });
    // Declare safeUser for use by the surrounding module or function.
    const safeUser = await User.findById(createdUser._id).select("-password").populate("roleId", "name displayName permissions").lean();
    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, message: `${canonicalRole.replace("_", " ")} account created successfully.`, user: safeUser, staff: createdStaff, agent: createdAgent });
  } catch (error) {
    // Check the condition (createdUser?._id) and run the matching branch.
    if (createdUser?._id) { try { await Promise.allSettled([createdStaff?._id ? Staff.deleteOne({ _id: createdStaff._id, tenantId }) : Promise.resolve(), createdAgent?._id ? Agent.deleteOne({ _id: createdAgent._id, tenantId }) : Promise.resolve(), User.deleteOne({ _id: createdUser._id, tenantId })]); } catch { /* preserve original error */ } }
    // Check the condition (isDuplicateKeyError(error)) and run the matching branch.
    if (isDuplicateKeyError(error)) return res.status(409).json({ success: false, message: duplicateMessage(error), repaired: isTenantIndexConflict(error) });
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare updateUserStatus for use by the surrounding module or function.
export const updateUserStatus = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare { id } for use by the surrounding module or function.
    const { id } = req.params; const { status } = req.body;
    // Check the condition (!mongoose.Types.ObjectId.isValid(id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid user ID" });
    // Check the condition (!STATUS_VALUES.includes(status)) and run the matching branch.
    if (!STATUS_VALUES.includes(status)) return res.status(400).json({ success: false, message: "Invalid user status" });
    // Declare user for use by the surrounding module or function.
    const user = await User.findOneAndUpdate({ _id: id, tenantId }, { $set: { status } }, { new: true, runValidators: true }).select("-password").lean();
    // Check the condition (!user) and run the matching branch.
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    // Declare result for use by the surrounding module or function.
    const result = { ...user, isActive: user.status === "active" }; return res.status(200).json({ success: true, message: `User status changed to ${status}`, user: result, data: result });
  } catch (error) { next(error); }
};

// Declare deleteUser for use by the surrounding module or function.
export const deleteUser = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare { id } for use by the surrounding module or function.
    const { id } = req.params;
    // Check the condition (!mongoose.Types.ObjectId.isValid(id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid user ID" });
    // Check the condition (String(req.user?._id) === String(id)) and run the matching branch.
    if (String(req.user?._id) === String(id)) return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    // Declare user for use by the surrounding module or function.
    const user = await User.findOne({ _id: id, tenantId }).select("_id role");
    // Check the condition (!user) and run the matching branch.
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    // Check the condition (["super_admin", "superadmin"].includes(String(user.role || "").toLower) and run the matching branch.
    if (["super_admin", "superadmin"].includes(String(user.role || "").toLowerCase())) return res.status(403).json({ success: false, message: "SuperAdmin accounts cannot be deleted." });
    // Perform the side effect or state update expressed on the following line.
    await Promise.all([Staff.deleteMany({ tenantId, user: user._id }), Agent.deleteMany({ tenantId, user: user._id }), User.deleteOne({ _id: user._id, tenantId })]);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, deleted: true, message: "User account deleted successfully." });
  } catch (error) { next(error); }
};