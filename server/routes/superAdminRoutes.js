import express from "express";

import {
getSuperAdminDashboard
}
from "../controllers/superAdminDashboardController.js";

import {
getAuditLogs,
getDatabaseStatus,
getSystemHealth,
getApiMonitor
}
from "../controllers/superAdminOperationsController.js";

import {protect, authorize}
from "../middleware/authMiddleware.js";


const router=express.Router();


router.get(
"/dashboard",
protect,
authorize(
"super_admin",
"superadmin"
),
getSuperAdminDashboard
);


router.get(
"/audit",
protect,
authorize(
"super_admin",
"superadmin"
),
getAuditLogs
);


router.get(
"/security",
protect,
authorize(
"super_admin",
"superadmin"
),
);


router.get(
"/database",
protect,
authorize(
"super_admin",
"superadmin"
),
getDatabaseStatus
);


router.get(
"/system",
protect,
authorize(
"super_admin",
"superadmin"
),
getSystemHealth
);


router.get(
"/api-monitor",
protect,
authorize(
"super_admin",
"superadmin"
),
getApiMonitor
);



router.get("/security",
);

export default router;