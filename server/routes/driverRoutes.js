// server/routes/driverRoutes.js
import express from "express";
import { driverDashboard } from "../controllers/driverController.js";
import { protect } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(roleMiddleware("driver", "admin", "super_admin", "superadmin", "tour_manager", "tourmanager", "manager"));

router.get("/dashboard", driverDashboard);

export default router;
