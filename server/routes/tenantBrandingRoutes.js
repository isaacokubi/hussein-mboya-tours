import express from "express";
import { getBranding, updateBranding } from "../controllers/tenantBrandingController.js";
import { protect, requireRoles } from "../middleware/authMiddleware.js";
import { resolveTenant } from "../middleware/tenantMiddleware.js";

const router = express.Router();

router.use(resolveTenant);

router.get("/", getBranding);
router.put("/", protect, requireRoles("admin", "manager"), updateBranding);

export default router;
