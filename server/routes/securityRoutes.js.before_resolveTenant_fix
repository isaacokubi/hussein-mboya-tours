import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";
import {
  getSecurityStatus,
  getSecurityEvents
} from "../controllers/securityController.js";
import {
  protect,
  checkPermission
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(resolveTenant);

router.get(
  "/status",
  protect,
  checkPermission("system.security"),
  getSecurityStatus
);

router.get(
  "/events",
  protect,
  checkPermission("system.security"),
  getSecurityEvents
);

export default router;
