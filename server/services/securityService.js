import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import SecurityLog from "../models/SecurityLog.js";
import mongoose from "mongoose";

const PLATFORM_ADMIN_ROLES = ["admin", "administrator", "super_admin", "superadmin"];

const securityService = {
  async getSecurityEvents() {
    return SecurityLog.find({}).sort({ createdAt: -1 }).limit(100).lean();
  },

  async getSecurityStatus() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [totalUsers, adminsByRole, adminsByLegacyRole, adminsByRoleId, roles, permissions, failedAttempts, criticalEvents] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: PLATFORM_ADMIN_ROLES } }),
      User.countDocuments({ legacyRole: { $in: PLATFORM_ADMIN_ROLES } }),
      User.countDocuments({ roleId: { $in: await Role.find({ name: { $in: PLATFORM_ADMIN_ROLES } }).distinct("_id") } }),
      Role.countDocuments(),
      Permission.countDocuments({ isActive: { $ne: false } }),
      SecurityLog.countDocuments({ status: "failed", createdAt: { $gte: since } }),
      SecurityLog.countDocuments({ severity: "critical", createdAt: { $gte: since } }),
    ]);

    const admins = new Set([...adminsByRole, ...adminsByLegacyRole, ...adminsByRoleId]);
    const threatLevel = criticalEvents > 0 || failedAttempts > 200 ? "high" : failedAttempts > 50 ? "medium" : "low";
    const securityScore = Math.max(0, Math.min(100, 100 - (threatLevel === "high" ? 40 : threatLevel === "medium" ? 20 : 0) - Math.min(20, criticalEvents * 5)));
    const database = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

    return {
      securityScore,
      threatLevel,
      authentication: { status: "Active", jwt: "active" },
      authorization: { status: "Active", roles, permissions, admins: admins.size },
      users: totalUsers,
      failedAttempts24h: failedAttempts,
      criticalEvents24h: criticalEvents,
      database,
      controls: [
        { name: "JWT Authentication", status: "active" },
        { name: "Role Based Access Control", status: roles > 0 && permissions > 0 ? "active" : "warning" },
        { name: "Audit Logging", status: "active" },
        { name: "Session Monitoring", status: "active" },
        { name: "API Protection", status: "active" },
        { name: "Database Security", status: database === "Connected" ? "active" : "warning" },
      ],
    };
  },
};

export default securityService;
