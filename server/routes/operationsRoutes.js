/**
 * Purpose: operations Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, checkPermission } from "../middleware/authMiddleware.js";
// Load ../controllers/operationsController.js so this module can use its exported dependencies.
import { getOperationsOverview } from "../controllers/operationsController.js";
// Load ./operationsModuleRoutes.js so this module can use its exported dependencies.
import operationsModuleRoutes from "./operationsModuleRoutes.js";
// Declare router for use by the surrounding module or function.
const router=express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant, protect, checkPermission("booking.manage"));
// Perform the side effect or state update expressed on the following line.
router.get("/", getOperationsOverview);
// Perform the side effect or state update expressed on the following line.
router.use("/module", operationsModuleRoutes);
export default router;
