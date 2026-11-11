/**
 * Purpose: super Admin Role Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load ../controllers/superAdminRoleController.js so this module can use its exported dependencies.
import {
  getPlatformRoles,
  getPlatformPermissions,
  getPlatformRole,
  updatePlatformRolePermissions,
} from "../controllers/superAdminRoleController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(authorize("roles.manage"));

// Perform the side effect or state update expressed on the following line.
router.get("/", getPlatformRoles);
// Perform the side effect or state update expressed on the following line.
router.get("/permissions/all", getPlatformPermissions);
// Perform the side effect or state update expressed on the following line.
router.get("/:id", getPlatformRole);
// Perform the side effect or state update expressed on the following line.
router.put("/:id/permissions", updatePlatformRolePermissions);

export default router;
