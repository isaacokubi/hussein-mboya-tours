import express from "express";

import {
getDatabase,
getApiMonitor,
getSystem,
getSettings
} from "../controllers/superAdminToolsController.js";


const router=express.Router();


// security endpoint handled by superAdminOperationsRoutes
router.get("/database",getDatabase);
router.get("/settings",getSettings);


export default router;


// RBAC middleware placeholder
