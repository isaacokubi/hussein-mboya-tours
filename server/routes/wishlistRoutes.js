/**
 * Purpose: wishlist Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/wishlistRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";

// Load ../controllers/wishlistController.js so this module can use its exported dependencies.
import {
  getWishlist,
  addWishlist,
  removeWishlist,
} from "../controllers/wishlistController.js";

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
| All wishlist routes require authentication.
|
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
router.use(protect);

/*
|--------------------------------------------------------------------------
| WISHLIST
|--------------------------------------------------------------------------
*/

/**
 * GET /api/wishlist
 * Get the authenticated user's wishlist.
 */
// Perform the side effect or state update expressed on the following line.
router.get(
  "/",
  getWishlist
);

/**
 * POST /api/wishlist
 * Add a tour to the authenticated user's wishlist.
 *
 * Body:
 * {
 *   "tourId": "..."
 * }
 */
// Perform the side effect or state update expressed on the following line.
router.post(
  "/",
  addWishlist
);

/**
 * DELETE /api/wishlist/:tourId
 * Remove a tour from the authenticated user's wishlist.
 */
// Perform the side effect or state update expressed on the following line.
router.delete(
  "/:tourId",
  removeWishlist
);

export default router;
