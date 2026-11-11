/**
 * Purpose: security Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../controllers/securityController.js so this module can use its exported dependencies.
import {
  getSecurityStatus,
  getSecurityEvents
} from "../controllers/securityController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import {
  protect,
  checkPermission
} from "../middleware/authMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

// Perform the side effect or state update expressed on the following line.
router.get(
  "/status",
  protect,
  checkPermission("system.security"),
  getSecurityStatus
);

// Perform the side effect or state update expressed on the following line.
router.get(
  "/events",
  protect,
  checkPermission("system.security"),
  getSecurityEvents
);

export default router;
