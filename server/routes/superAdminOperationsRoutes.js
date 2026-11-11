/**
 * Purpose: super Admin Operations Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../middleware/auditMiddleware.js so this module can use its exported dependencies.
import { auditMiddleware } from "../middleware/auditMiddleware.js";

// Load ../controllers/superAdminOperationsController.js so this module can use its exported dependencies.
import {

getAuditLogs,

getDatabaseStatus,
getSystemHealth,
getApiMonitor

}
from "../controllers/superAdminOperationsController.js";


// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import {
protect,
checkPermission
}
from "../middleware/authMiddleware.js";


// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);


// Perform the side effect or state update expressed on the following line.
router.use(protect);

// Perform the side effect or state update expressed on the following line.
router.use(
  checkPermission("roles.manage")
);


// Perform the side effect or state update expressed on the following line.
router.use(auditMiddleware);

// Perform the side effect or state update expressed on the following line.
router.get("/audit",getAuditLogs);

// Security handled by superAdminRoutes.js

// Perform the side effect or state update expressed on the following line.
router.get("/database",getDatabaseStatus);

// Perform the side effect or state update expressed on the following line.
router.get("/system",getSystemHealth);

export default router;
