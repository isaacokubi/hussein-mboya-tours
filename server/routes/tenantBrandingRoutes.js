/**
 * Purpose: tenant Branding Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../controllers/tenantBrandingController.js so this module can use its exported dependencies.
import { getBranding, updateBranding } from "../controllers/tenantBrandingController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, requireRoles } from "../middleware/authMiddleware.js";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

// Perform the side effect or state update expressed on the following line.
router.get("/", getBranding);
// Perform the side effect or state update expressed on the following line.
router.put("/", protect, requireRoles("admin", "manager"), updateBranding);

export default router;
