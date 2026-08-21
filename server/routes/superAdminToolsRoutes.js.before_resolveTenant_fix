import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import {
  getDatabase,
  getApiMonitor,
  getSystem,
  getSettings,
} from "../controllers/superAdminToolsController.js";

const router = express.Router();

router.use(resolveTenant);

router.use(protect);
router.use(authorize("system.security"));

router.get("/database", getDatabase);
router.get("/settings", getSettings);

export default router;
