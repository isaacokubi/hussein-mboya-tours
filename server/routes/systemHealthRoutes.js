import { authorize } from "../middleware/permissionMiddleware.js";
import express from "express";


import {
getSystemHealth
}
from "../controllers/systemHealthController.js";


import {
protect
}
from "../middleware/authMiddleware.js";


import adminMiddleware
from "../middleware/adminMiddleware.js";



const router =
express.Router();



router.use(protect);

router.use(adminMiddleware);

router.use(authorize("system.audit"));



router.get(
"/",
getSystemHealth
);



export default router;
