/**
 * Purpose: user Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/userRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";

// Controllers
// Load ../controllers/userController.js so this module can use its exported dependencies.
import {
  deleteUser,
  getUserProfile,
  updateUserProfile,
  getGuides,
} from "../controllers/userController.js";

// Middleware
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import {
  protect,
} from "../middleware/authMiddleware.js";

// Load ../middleware/roleMiddleware.js so this module can use its exported dependencies.
import {
  roleMiddleware,
} from "../middleware/roleMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
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
// Perform the side effect or state update expressed on the following line.
router.get(
  "/profile",
  getUserProfile
);

// Perform the side effect or state update expressed on the following line.
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

// Perform the side effect or state update expressed on the following line.
router.get(
  "/guides",
  roleMiddleware("admin", "tour_manager", "tourmanager", "manager"),
  getGuides
);

// DELETE USER
// Perform the side effect or state update expressed on the following line.
router.delete(
  "/:id",
  roleMiddleware("admin"),
  deleteUser
);

export default router;
