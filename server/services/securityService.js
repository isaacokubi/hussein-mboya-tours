import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import SecurityLog from "../models/SecurityLog.js";
import mongoose from "mongoose";

const PLATFORM_ADMIN_ROLES = ["admin", "administrator", "super_admin", "superadmin"];
const normalizeRoleName = (value = "") => String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");

const securityService = {
  async getSecurityEvents() {
    return SecurityLog.find({}).sort({ createdAt: -1 }).limit(100).lean();
  },

  async getSecurityStatus() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const adminRoleIds = await Role.find({ name: { $in: PLATFORM_ADMIN_ROLES } }).distinct("_id");

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

    const admins = Math.max(adminsByRole, adminsByLegacyRole, adminsByRoleId);
    const uniqueRoleNames = new Set(roleDocs.map((role) => normalizeRoleName(role.name)).filter(Boolean));
    const roles = uniqueRoleNames.size;
    const threatLevel = criticalEvents > 0 || failedAttempts > 200 ? "high" : failedAttempts > 50 ? "medium" : "low";
    const securityScore = Math.max(0, Math.min(100, 100 - (threatLevel === "high" ? 40 : threatLevel === "medium" ? 20 : 0) - Math.min(20, criticalEvents * 5)));
    const database = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    const authorizationActive = roles > 0 && permissionCount > 0;

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
