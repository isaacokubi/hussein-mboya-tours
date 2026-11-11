/**
 * Purpose: review Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/reviewRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";

// Load ../controllers/reviewController.js so this module can use its exported dependencies.
import {
  createReview,
  getTourReviews,
  voteHelpful,
} from "../controllers/reviewController.js";

// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import {
  protect,
} from "../middleware/authMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
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
// Perform the side effect or state update expressed on the following line.
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
// Perform the side effect or state update expressed on the following line.
router.post(
  "/",
  protect,
  createReview
);

/**
 * PUT /api/reviews/:id/helpful
 * Vote a review as helpful.
 */
// Perform the side effect or state update expressed on the following line.
router.put(
  "/:id/helpful",
  protect,
  voteHelpful
);

export default router;
