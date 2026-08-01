import express from "express";

import {
    getDashboard
} from "../controllers/adminDashboardController.js";


import {
    protect
} from "../middleware/authMiddleware.js";


import {
    authorize
} from "../middleware/permissionMiddleware.js";



const router =
express.Router();



router.get(

"/",

protect,


authorize(
"view_reports"
),


getDashboard


);



export default router;