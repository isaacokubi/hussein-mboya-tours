import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { getOperationsOverview } from "../controllers/operationsController.js";
const router=express.Router();
router.use(resolveTenant, protect, checkPermission("booking.manage"));
router.get("/", getOperationsOverview);
export default router;
