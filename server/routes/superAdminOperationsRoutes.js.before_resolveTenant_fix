import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";
import { auditMiddleware } from "../middleware/auditMiddleware.js";

import {

getAuditLogs,

getDatabaseStatus,
getSystemHealth,
getApiMonitor

}
from "../controllers/superAdminOperationsController.js";


import {
protect,
checkPermission
}
from "../middleware/authMiddleware.js";


const router = express.Router();

router.use(resolveTenant);


router.use(protect);

router.use(
  checkPermission("roles.manage")
);


router.use(auditMiddleware);

router.get("/audit",getAuditLogs);

// Security handled by superAdminRoutes.js

router.get("/database",getDatabaseStatus);

router.get("/system",getSystemHealth);

export default router;
