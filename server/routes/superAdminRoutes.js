import express from "express";
import securityService from "../services/securityService.js";

import {
  protect,
  authorize
} from "../middleware/authMiddleware.js";

import {
  getSuperAdminDashboard
} from "../controllers/superAdminDashboardController.js";

import {
  getAuditLogs,
  getSecurityStatus,
  getDatabaseStatus,
  getSystemHealth,
  getApiMonitor,
  createDatabaseBackup,
  clearSystemCache,
  listDatabaseBackups,
  deleteDatabaseBackup
  ,downloadDatabaseBackup
} from "../controllers/superAdminOperationsController.js";


const router = express.Router();












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
async (req,res)=>{
  try {

    const data = await securityService.getSecurityStatus();

    res.json({
      success:true,
      data
    });

  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message
    });

  }
});


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



router.post(
"/maintenance/backup",
protect,
authorize(
"super_admin",
"superadmin"
),
createDatabaseBackup
);



router.post(
"/maintenance/cache",
protect,
authorize(
"super_admin",
"superadmin"
),
clearSystemCache
);





// ===============================
// DATABASE MANAGEMENT
// ===============================

router.post(
  "/database/backup",
  protect,
  authorize("super_admin","superadmin"),
  createDatabaseBackup
);


router.post(
  "/database/cache-clear",
  protect,
  authorize("super_admin","superadmin"),
  clearSystemCache
);


router.get(
  "/maintenance/backups",
  protect,
  authorize("super_admin","superadmin"),
  listDatabaseBackups
);


router.delete(
  "/maintenance/backups/:id",
  protect,
  authorize("super_admin","superadmin"),
  deleteDatabaseBackup
);





// DOWNLOAD DATABASE BACKUP

router.get(
  "/database/backup/:id/download",
  protect,
  authorize(
    "super_admin",
    "superadmin"
  ),
  downloadDatabaseBackup
);


export default router;