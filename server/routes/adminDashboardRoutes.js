import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import express from "express";

import {
    getDashboard
} from "../controllers/adminDashboardController.js";


import { protect, adminOnly } from "../middleware/authMiddleware.js";



const router = express.Router();

router.use(resolveTenant);



router.get(

"/",

protect,
adminOnly,

authorize("admin.dashboard"),

getDashboard


);



export default router;
