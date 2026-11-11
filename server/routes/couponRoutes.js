/**
 * Purpose: coupon Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/couponRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../controllers/couponController.js so this module can use its exported dependencies.
import { validateCoupon } from "../controllers/couponController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.post("/validate", validateCoupon);

export default router;
