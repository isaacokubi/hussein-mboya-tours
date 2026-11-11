/**
 * Purpose: super Admin Tools Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load ../controllers/superAdminToolsController.js so this module can use its exported dependencies.
import {
  getDatabase,
  getApiMonitor,
  getSystem,
  getSettings,
} from "../controllers/superAdminToolsController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(authorize("system.security"));

// Perform the side effect or state update expressed on the following line.
router.get("/database", getDatabase);
// Perform the side effect or state update expressed on the following line.
router.get("/settings", getSettings);

export default router;
