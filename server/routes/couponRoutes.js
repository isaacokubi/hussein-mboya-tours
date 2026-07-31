// server/routes/couponRoutes.js

import express from "express";

import {
  validateCoupon,
} from "../controllers/couponController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| COUPONS
|--------------------------------------------------------------------------
*/

/**
 * POST /api/coupons/validate
 * Validate a coupon code for the authenticated user.
 */
router.post(
  "/validate",
  validateCoupon
);

export default router;