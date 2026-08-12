import express from "express";

import {

getAuditLogs,
getSecurityStatus,
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


router.get("/audit",getAuditLogs);

router.get("/security",getSecurityStatus);

router.get("/database",getDatabaseStatus);

router.get("/system",getSystemHealth);

router.get("/api-monitor",getApiMonitor);


export default router;
