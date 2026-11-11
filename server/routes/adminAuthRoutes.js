/**
 * Purpose: admin Auth Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/adminAuthRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";

// Load ../controllers/adminAuthController.js so this module can use its exported dependencies.
import {
  adminLogin,
} from "../controllers/adminAuthController.js";

// Load ../middleware/authRateLimiters.js so this module can use its exported dependencies.
import { loginRateLimiter } from "../middleware/authRateLimiters.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

/*
|--------------------------------------------------------------------------
| ADMIN AUTH ROUTES
|--------------------------------------------------------------------------
*/

/**
 * POST /api/admin/login
 * Admin authentication
 */
// Perform the side effect or state update expressed on the following line.
router.post(
  "/login",
  loginRateLimiter,
  adminLogin
);

export default router;
