import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import {
  getPlatformRoles,
  getPlatformPermissions,
  getPlatformRole,
  updatePlatformRolePermissions,
} from "../controllers/superAdminRoleController.js";

const router = express.Router();
router.use(protect);
router.use(authorize("roles.manage"));

router.get("/", getPlatformRoles);
router.get("/permissions/all", getPlatformPermissions);
router.get("/:id", getPlatformRole);
router.put("/:id/permissions", updatePlatformRolePermissions);

export default router;
