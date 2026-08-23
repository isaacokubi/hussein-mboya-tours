import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/tourReportRoutes.js

import express from "express";
import { getTourReports } from "../controllers/tourReportController.js";
import { protect } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(resolveTenant);

router.use(protect);
router.get("/", roleMiddleware("admin", "manager", "super_admin"), getTourReports);

export default router;
