/**
 * Purpose: security Service business-logic service. Main declarations: normalizeRoleName.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import User from "../models/User.js";
// Load ../models/Role.js so this module can use its exported dependencies.
import Role from "../models/Role.js";
// Load ../models/Permission.js so this module can use its exported dependencies.
import Permission from "../models/Permission.js";
// Load ../models/SecurityLog.js so this module can use its exported dependencies.
import SecurityLog from "../models/SecurityLog.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";

// Declare PLATFORM_ADMIN_ROLES for use by the surrounding module or function.
const PLATFORM_ADMIN_ROLES = ["admin", "administrator", "super_admin", "superadmin"];
// Declare normalizeRoleName for use by the surrounding module or function.
const normalizeRoleName = (value = "") => String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");

// Declare securityService for use by the surrounding module or function.
const securityService = {
  // Implement the getSecurityEvents method for this class.
  async getSecurityEvents() {
    // Return the result of SecurityLog.find({}).sort({ createdAt: -1 }).limit(100).lean() to the caller.
    return SecurityLog.find({}).sort({ createdAt: -1 }).limit(100).lean();
  },

  // Implement the getSecurityStatus method for this class.
  async getSecurityStatus() {
    // Declare since for use by the surrounding module or function.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // Declare adminRoleIds for use by the surrounding module or function.
    const adminRoleIds = await Role.find({ name: { $in: PLATFORM_ADMIN_ROLES } }).distinct("_id");

    // Declare [totalUsers, adminsByRole, adminsByLegacyRole, adminsByRoleId, roleDocs, permissionCount, failedAttempts, criticalEvents] for use by the surrounding module or function.
    const [totalUsers, adminsByRole, adminsByLegacyRole, adminsByRoleId, roleDocs, permissionCount, failedAttempts, criticalEvents] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: PLATFORM_ADMIN_ROLES } }),
      User.countDocuments({ legacyRole: { $in: PLATFORM_ADMIN_ROLES } }),
      adminRoleIds.length ? User.countDocuments({ roleId: { $in: adminRoleIds } }) : Promise.resolve(0),
      Role.find({}).select("name").lean(),
      Permission.countDocuments({ isActive: { $ne: false } }),
      SecurityLog.countDocuments({ status: "failed", createdAt: { $gte: since } }),
      SecurityLog.countDocuments({ severity: "critical", createdAt: { $gte: since } }),
    ]);

    // Declare admins for use by the surrounding module or function.
    const admins = Math.max(adminsByRole, adminsByLegacyRole, adminsByRoleId);
    // Declare uniqueRoleNames for use by the surrounding module or function.
    const uniqueRoleNames = new Set(roleDocs.map((role) => normalizeRoleName(role.name)).filter(Boolean));
    // Declare roles for use by the surrounding module or function.
    const roles = uniqueRoleNames.size;
    // Declare threatLevel for use by the surrounding module or function.
    const threatLevel = criticalEvents > 0 || failedAttempts > 200 ? "high" : failedAttempts > 50 ? "medium" : "low";
    // Declare securityScore for use by the surrounding module or function.
    const securityScore = Math.max(0, Math.min(100, 100 - (threatLevel === "high" ? 40 : threatLevel === "medium" ? 20 : 0) - Math.min(20, criticalEvents * 5)));
    // Declare database for use by the surrounding module or function.
    const database = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    // Declare authorizationActive for use by the surrounding module or function.
    const authorizationActive = roles > 0 && permissionCount > 0;

    // Return the object assembled below to the caller.
    return {
      securityScore,
      threatLevel,
      authentication: { status: "Active", jwt: "active" },
      authorization: { status: authorizationActive ? "Active" : "Warning", roles, permissions: permissionCount, admins },
      users: totalUsers,
      failedAttempts24h: failedAttempts,
      criticalEvents24h: criticalEvents,
      database,
      controls: [
        { name: "JWT Authentication", status: "active" },
        { name: "Role Based Access Control", status: authorizationActive ? "active" : "warning" },
        { name: "Audit Logging", status: "active" },
        { name: "Session Monitoring", status: "active" },
        { name: "API Protection", status: "active" },
        { name: "Database Security", status: database === "Connected" ? "active" : "warning" },
      ],
    };
  },
};

export default securityService;
