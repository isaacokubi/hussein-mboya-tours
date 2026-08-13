import { getSecurityStatus } from "../controllers/securityController.js";
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
authorize
}
from "../middleware/authMiddleware.js";


const router=express.Router();


router.use(protect);

router.use(
authorize(
"super_admin",
"superadmin"
)
);


router.use(auditMiddleware);

router.get("/audit",getAuditLogs);

router.get("/security",getSecurityStatus);

router.get("/database",getDatabaseStatus);

router.get("/system",getSystemHealth);

