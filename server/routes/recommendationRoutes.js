/**
 * Purpose: recommendation Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/recommendationRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";

// Load ../controllers/recommendationController.js so this module can use its exported dependencies.
import {
  getRecommendations,
} from "../controllers/recommendationController.js";

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
| AUTHORIZATION
|--------------------------------------------------------------------------
|
| Recommendation routes require authentication.
|
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
router.use(protect);

/*
|--------------------------------------------------------------------------
| RECOMMENDATIONS
|--------------------------------------------------------------------------
*/

/**
 * POST /api/recommendations
 * Generate personalized tour recommendations
 * for the authenticated user.
 */
// Perform the side effect or state update expressed on the following line.
router.post(
  "/",
  getRecommendations
);

export default router;
