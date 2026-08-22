import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";
import securityService from "../services/securityService.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { getSuperAdminDashboard } from "../controllers/superAdminDashboardController.js";
import {
  getAuditLogs,
  getSecurityStatus,
  getDatabaseStatus,
  getSystemHealth,
  createDatabaseBackup,
  clearSystemCache,
  listDatabaseBackups,
  deleteDatabaseBackup,
  downloadDatabaseBackup
} from "../controllers/superAdminOperationsController.js";
import { getApiMonitor } from "../controllers/apiMonitorController.js";

const router = express.Router();

/* Platform routes must authenticate before tenant resolution. SuperAdmin is global. */
router.use(protect);
router.use(resolveTenant);

router.get("/dashboard", authorize("admin.dashboard"), getSuperAdminDashboard);
router.get("/audit", authorize("system.audit"), getAuditLogs);
router.get("/security", authorize("system.security"), async (req, res) => {
  try {
    const data = await securityService.getSecurityStatus();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/database", authorize("system.database"), getDatabaseStatus);
router.get("/system", authorize("system.security"), getSystemHealth);
router.get("/api-monitor", authorize("system.security"), getApiMonitor);
router.post("/maintenance/backup", authorize("system.backup"), createDatabaseBackup);
router.post("/maintenance/cache", authorize("admin.dashboard"), clearSystemCache);
router.post("/database/backup", authorize("system.backup"), createDatabaseBackup);
router.post("/database/cache-clear", authorize("settings.manage"), clearSystemCache);
router.get("/maintenance/backups", authorize("settings.manage"), listDatabaseBackups);
router.delete("/maintenance/backups/:id", authorize("settings.manage"), deleteDatabaseBackup);
router.get("/database/backup/:id/download", authorize("super_admin"), downloadDatabaseBackup);

export default router;
