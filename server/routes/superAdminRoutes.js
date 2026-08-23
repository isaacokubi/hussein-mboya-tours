import express from "express";
import securityService from "../services/securityService.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { getSuperAdminDashboard } from "../controllers/superAdminDashboardController.js";
import { getAuditLogs, getDatabaseStatus, getSystemHealth, clearSystemCache } from "../controllers/superAdminOperationsController.js";
import { getApiMonitor } from "../controllers/apiMonitorController.js";
import { createPlatformDatabaseBackup, listPlatformDatabaseBackups, deletePlatformDatabaseBackup, downloadPlatformDatabaseBackup } from "../controllers/superAdminBackupController.js";
import { getSuperAdminUsers, createSuperAdminCompanyAccount, updateSuperAdminUserStatus, deleteSuperAdminUser } from "../controllers/superAdminUserController.js";
import { deleteTenant } from "../controllers/superadminTenantController.js";
import { getSettings, updateSettings } from "../controllers/settingsController.js";

const router = express.Router();
router.use(protect);

router.get("/dashboard", authorize("admin.dashboard"), getSuperAdminDashboard);
router.get("/users", authorize("user.manage"), getSuperAdminUsers);
router.post("/users/accounts", authorize("user.manage"), createSuperAdminCompanyAccount);
router.patch("/users/:id/status", authorize("user.manage"), updateSuperAdminUserStatus);
router.put("/users/:id/status", authorize("user.manage"), updateSuperAdminUserStatus);
router.delete("/users/:id", authorize("user.manage"), deleteSuperAdminUser);
router.delete("/tenants/:id", authorize("user.manage"), deleteTenant);

router.get("/audit", authorize("system.audit"), getAuditLogs);
router.get("/security", authorize("system.security"), async (req, res) => {
  try { return res.json({ success: true, data: await securityService.getSecurityStatus() }); }
  catch (error) { console.error("SuperAdmin security status error:", error); return res.status(500).json({ success: false, message: error.message }); }
});
router.get("/database", authorize("system.database"), getDatabaseStatus);
router.get("/system", authorize("system.security"), getSystemHealth);
router.get("/api-monitor", authorize("system.security"), getApiMonitor);
router.get("/settings", authorize("settings.manage"), getSettings);
router.put("/settings", authorize("settings.manage"), updateSettings);
router.post("/maintenance/backup", authorize("system.backup"), createPlatformDatabaseBackup);
router.post("/database/backup", authorize("system.backup"), createPlatformDatabaseBackup);
router.post("/maintenance/cache", authorize("admin.dashboard"), clearSystemCache);
router.post("/database/cache-clear", authorize("settings.manage"), clearSystemCache);
router.get("/maintenance/backups", authorize("settings.manage"), listPlatformDatabaseBackups);
router.delete("/maintenance/backups/:id", authorize("settings.manage"), deletePlatformDatabaseBackup);
router.get("/database/backup/:id/download", authorize("system.backup"), downloadPlatformDatabaseBackup);

export default router;
