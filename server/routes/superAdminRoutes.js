/**
 * Purpose: super Admin Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load express-rate-limit so this module can use its exported dependencies.
import rateLimit from "express-rate-limit";
// Load ../services/securityService.js so this module can use its exported dependencies.
import securityService from "../services/securityService.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/superAdminOnly.js so this module can use its exported dependencies.
import { superAdminOnly } from "../middleware/superAdminOnly.js";
// Load ../controllers/superAdminDashboardMetricsController.js so this module can use its exported dependencies.
import { getSuperAdminDashboardMetrics } from "../controllers/superAdminDashboardMetricsController.js";
// Load ../controllers/superAdminOperationsController.js so this module can use its exported dependencies.
import { getAuditLogs, getDatabaseStatus, getSystemHealth, clearSystemCache } from "../controllers/superAdminOperationsController.js";
// Load ../controllers/apiMonitorController.js so this module can use its exported dependencies.
import { getApiMonitor } from "../controllers/apiMonitorController.js";
// Load ../controllers/superAdminBackupController.js so this module can use its exported dependencies.
import { createPlatformDatabaseBackup, listPlatformDatabaseBackups, deletePlatformDatabaseBackup, downloadPlatformDatabaseBackup } from "../controllers/superAdminBackupController.js";
// Load ../controllers/superAdminUserController.js so this module can use its exported dependencies.
import { getSuperAdminUsers, createSuperAdminCompanyAccount, updateSuperAdminUserStatus, deleteSuperAdminUser } from "../controllers/superAdminUserController.js";
// Load ../controllers/superAdminTenantController.js so this module can use its exported dependencies.
import { listTenants, getTenant, createTenantWithAdmin, updateTenantStatus, deleteTenant, getTenantPlans } from "../controllers/superAdminTenantController.js";
// Load ../controllers/tenantSubscriptionController.js so this module can use its exported dependencies.
import { approveTenantSubscription, switchTenantSubscription, listSubscriptionPayments } from "../controllers/tenantSubscriptionController.js";
// Load ../controllers/platformBillingController.js so this module can use its exported dependencies.
import { getPlatformBillingConfig, updatePlatformBillingConfig, getPlatformPlanFeatureCatalog } from "../controllers/platformBillingController.js";
// Load ../controllers/settingsController.js so this module can use its exported dependencies.
import { getSettings, updateSettings } from "../controllers/settingsController.js";
// Load ../controllers/superAdminMpesaGatewayController.js so this module can use its exported dependencies.
import { getSuperAdminTenantMpesa, saveSuperAdminTenantMpesa, disableSuperAdminTenantMpesa, validateSuperAdminTenantMpesa } from "../controllers/superAdminMpesaGatewayController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(protect, superAdminOnly);

// Perform the side effect or state update expressed on the following line.
router.get("/dashboard/metrics", getSuperAdminDashboardMetrics);
// Perform the side effect or state update expressed on the following line.
router.get("/dashboard", getSuperAdminDashboardMetrics);
// Perform the side effect or state update expressed on the following line.
router.get("/tenant-plans", getTenantPlans);
// Perform the side effect or state update expressed on the following line.
router.get("/tenants", listTenants);
// Perform the side effect or state update expressed on the following line.
router.post("/tenants", createTenantWithAdmin);
// Perform the side effect or state update expressed on the following line.
router.get("/tenants/:id", getTenant);
// Perform the side effect or state update expressed on the following line.
router.get("/tenants/:tenantId/mpesa", getSuperAdminTenantMpesa);
// Perform the side effect or state update expressed on the following line.
router.put("/tenants/:tenantId/mpesa", saveSuperAdminTenantMpesa);
// Perform the side effect or state update expressed on the following line.
router.post("/tenants/:tenantId/mpesa/validate", rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many configuration checks. Try again later." } }), validateSuperAdminTenantMpesa);
// Perform the side effect or state update expressed on the following line.
router.delete("/tenants/:tenantId/mpesa", disableSuperAdminTenantMpesa);
// Perform the side effect or state update expressed on the following line.
router.patch("/tenants/:id/status", updateTenantStatus);
// Perform the side effect or state update expressed on the following line.
router.post("/tenants/:id/subscription/activate", approveTenantSubscription);
// Perform the side effect or state update expressed on the following line.
router.patch("/tenants/:id/subscription/plan", switchTenantSubscription);
// Perform the side effect or state update expressed on the following line.
router.delete("/tenants/:id", deleteTenant);
// Perform the side effect or state update expressed on the following line.
router.get("/subscription-payments", listSubscriptionPayments);
// Perform the side effect or state update expressed on the following line.
router.get("/billing/config", getPlatformBillingConfig);
// Perform the side effect or state update expressed on the following line.
router.put("/billing/config", updatePlatformBillingConfig);
// Perform the side effect or state update expressed on the following line.
router.get("/billing/features", getPlatformPlanFeatureCatalog);
// Perform the side effect or state update expressed on the following line.
router.get("/users", getSuperAdminUsers);
// Perform the side effect or state update expressed on the following line.
router.post("/users/accounts", createSuperAdminCompanyAccount);
// Perform the side effect or state update expressed on the following line.
router.patch("/users/:id/status", updateSuperAdminUserStatus);
// Perform the side effect or state update expressed on the following line.
router.put("/users/:id/status", updateSuperAdminUserStatus);
// Perform the side effect or state update expressed on the following line.
router.delete("/users/:id", deleteSuperAdminUser);
// Perform the side effect or state update expressed on the following line.
router.get("/audit", getAuditLogs);
// Perform the side effect or state update expressed on the following line.
router.get("/security", async (req, res) => { try { const data = await securityService.getSecurityStatus(); return res.json({ success: true, data }); } catch (error) { console.error("SuperAdmin security status error:", error); return res.status(500).json({ success: false, message: error.message }); } });
// Perform the side effect or state update expressed on the following line.
router.get("/database", getDatabaseStatus);
// Perform the side effect or state update expressed on the following line.
router.get("/system", getSystemHealth);
// Perform the side effect or state update expressed on the following line.
router.get("/api-monitor", getApiMonitor);
// Perform the side effect or state update expressed on the following line.
router.get("/settings", getSettings);
// Perform the side effect or state update expressed on the following line.
router.put("/settings", updateSettings);
// Perform the side effect or state update expressed on the following line.
router.post("/maintenance/backup", createPlatformDatabaseBackup);
// Perform the side effect or state update expressed on the following line.
router.post("/database/backup", createPlatformDatabaseBackup);
// Perform the side effect or state update expressed on the following line.
router.post("/maintenance/cache", clearSystemCache);
// Perform the side effect or state update expressed on the following line.
router.post("/database/cache-clear", clearSystemCache);
// Canonical platform backup read endpoint. Kept under /database so it cannot
// be confused with tenant maintenance routes mounted at /superadmin/maintenance.
// Perform the side effect or state update expressed on the following line.
router.get("/database/backups", listPlatformDatabaseBackups);
// Perform the side effect or state update expressed on the following line.
router.get("/maintenance/backups", listPlatformDatabaseBackups);
// Perform the side effect or state update expressed on the following line.
router.delete("/maintenance/backups/:id", deletePlatformDatabaseBackup);
// Perform the side effect or state update expressed on the following line.
router.delete("/database/backups/:id", deletePlatformDatabaseBackup);
// Perform the side effect or state update expressed on the following line.
router.get("/database/backup/:id/download", downloadPlatformDatabaseBackup);
export default router;
