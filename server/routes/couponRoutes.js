// server/routes/couponRoutes.js

import express from "express";
import { validateCoupon } from "../controllers/couponController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/validate", validateCoupon);

export default router;
