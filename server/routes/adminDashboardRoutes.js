import express from "express";

import {
    getDashboard
} from "../controllers/adminDashboardController.js";


import { protect, adminOnly } from "../middleware/authMiddleware.js";



const router =
express.Router();



router.get(

"/",

protect,
adminOnly,


getDashboard


);



export default router;