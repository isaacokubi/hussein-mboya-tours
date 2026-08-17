// Driver operational routes.
import express from "express";
import { driverDashboard } from "../controllers/driverController.js";
import { protect, driverOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(driverOnly);

router.get("/dashboard", driverDashboard);

export default router;
