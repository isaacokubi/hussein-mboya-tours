import express from "express";
import { authorize } from "../middleware/permissionMiddleware.js";
import { getSuperAdminRevenue } from "../controllers/superAdminRevenueController.js";

const router = express.Router();
router.get("/", authorize("admin.dashboard"), getSuperAdminRevenue);
export default router;
