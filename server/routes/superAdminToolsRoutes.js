import express from "express";

import {
getAudit,
getSecurity,
getDatabase,
getApiMonitor,
getSystem,
getSettings
} from "../controllers/superAdminToolsController.js";


const router=express.Router();


router.get("/audit",getAudit);
router.get("/security",getSecurity);
router.get("/database",getDatabase);
router.get("/api-monitor",getApiMonitor);
router.get("/system",getSystem);
router.get("/settings",getSettings);


export default router;
