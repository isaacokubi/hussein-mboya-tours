/**
 * Purpose: super Admin Revenue Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load ../controllers/superAdminRevenueController.js so this module can use its exported dependencies.
import { getSuperAdminRevenue } from "../controllers/superAdminRevenueController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.get("/", authorize("admin.dashboard"), getSuperAdminRevenue);
export default router;
