import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { getSystemHealth } from "../controllers/systemHealthController.js";

const router = express.Router();

router.use(resolveTenant);
router.use(protect);
router.use(adminMiddleware);
router.use(authorize("system.security"));

// Both endpoints use the same live health implementation so the dashboard
// cannot fall back to a database-only response that hides integrations.
router.get("/health", getSystemHealth);
router.get("/admin/system-health", getSystemHealth);

export default router;
