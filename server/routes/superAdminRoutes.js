import express from "express";

import {
getSuperAdminDashboard
}
from "../controllers/superAdminDashboardController.js";

import {authorize}
from "../middleware/authMiddleware.js";


const router=express.Router();


router.get(
"/dashboard",
authorize(
"super_admin",
"superadmin"
),
getSuperAdminDashboard
);


export default router;
