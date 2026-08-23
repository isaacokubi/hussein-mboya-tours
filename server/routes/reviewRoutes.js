import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/reviewRoutes.js

import express from "express";

import {
  createReview,
  getTourReviews,
  voteHelpful,
} from "../controllers/reviewController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(resolveTenant);

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

/**
 * GET /api/reviews/tour/:id
 * Get all approved reviews for a tour.
 */
router.get(
  "/tour/:id",
  getTourReviews
);

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

/**
 * POST /api/reviews
 * Create a review for a completed booking.
 */
router.post(
  "/",
  protect,
  createReview
);

/**
 * PUT /api/reviews/:id/helpful
 * Vote a review as helpful.
 */
router.put(
  "/:id/helpful",
  protect,
  voteHelpful
);

export default router;
