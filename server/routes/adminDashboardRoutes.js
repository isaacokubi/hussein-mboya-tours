import express from "express";


import {
dashboardStats
}
from "../controllers/adminDashboardController.js";


import authMiddleware
from "../middleware/authMiddleware.js";


import adminMiddleware
from "../middleware/adminMiddleware.js";



const router =
express.Router();



router.get(

"/stats",

authMiddleware,

adminMiddleware,

dashboardStats

);



export default router;