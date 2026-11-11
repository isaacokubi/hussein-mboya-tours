/**
 * Purpose: tenant Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, superAdminOnly } from "../middleware/authMiddleware.js";
// Load ../controllers/tenantController.js so this module can use its exported dependencies.
import { listTenants, createTenant, getTenant, updateTenant } from "../controllers/tenantController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(protect, superAdminOnly);
// Perform the side effect or state update expressed on the following line.
router.get("/", listTenants);
// Perform the side effect or state update expressed on the following line.
router.post("/", createTenant);
// Perform the side effect or state update expressed on the following line.
router.get("/:id", getTenant);
// Perform the side effect or state update expressed on the following line.
router.patch("/:id", updateTenant);
export default router;
