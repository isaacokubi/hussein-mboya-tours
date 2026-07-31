// server/routes/wishlistRoutes.js

import express from "express";

import {
  getWishlist,
  addWishlist,
  removeWishlist,
} from "../controllers/wishlistController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHORIZATION
|--------------------------------------------------------------------------
|
| All wishlist routes require authentication.
|
|--------------------------------------------------------------------------
*/

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
router.post(
  "/",
  addWishlist
);

/**
 * DELETE /api/wishlist/:tourId
 * Remove a tour from the authenticated user's wishlist.
 */
router.delete(
  "/:tourId",
  removeWishlist
);

export default router;