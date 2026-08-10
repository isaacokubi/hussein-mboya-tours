// server/routes/userRoutes.js

import express from "express";

// Controllers
import {
  deleteUser,
  getUserProfile,
  updateUserProfile,
  getGuides,
} from "../controllers/userController.js";

// Middleware
import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  roleMiddleware,
} from "../middleware/roleMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| USER PROFILE
|--------------------------------------------------------------------------
*/

/**
 * GET /api/users/profile
 * Get the authenticated user's profile.
 */
router.get(
  "/profile",
  getUserProfile
);

router.put(
  "/profile",
  updateUserProfile
);

/*
|--------------------------------------------------------------------------
| GUIDES
|--------------------------------------------------------------------------
|
| Available to Admins and Tour Managers.
|
*/

router.get(
  "/guides",
  roleMiddleware("admin", "tour_manager", "tourmanager", "manager"),
  getGuides
);

// DELETE USER
router.delete(
  "/:id",
  roleMiddleware("admin"),
  deleteUser
);

export default router;

