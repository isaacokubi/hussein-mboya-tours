/**
 * Purpose: staff Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/staffRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";

// Load ../controllers/staffController.js so this module can use its exported dependencies.
import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  getDrivers,
  getGuides,
} from "../controllers/staffController.js";

// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/roleMiddleware.js so this module can use its exported dependencies.
import {
  adminOnly,
  managerOnly,
} from "../middleware/roleMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

// Perform the side effect or state update expressed on the following line.
router.use(protect);

// Operational staff lookup. Managers can read staff needed for assignments.
// Perform the side effect or state update expressed on the following line.
router.get("/guides", managerOnly, getGuides);
// Perform the side effect or state update expressed on the following line.
router.get("/drivers", managerOnly, getDrivers);

// Staff administration is restricted to Admin/SuperAdmin.
// Perform the side effect or state update expressed on the following line.
router.post("/", adminOnly, createStaff);
// Perform the side effect or state update expressed on the following line.
router.get("/", managerOnly, getStaff);
// Perform the side effect or state update expressed on the following line.
router.get("/:id", managerOnly, getStaffById);
// Perform the side effect or state update expressed on the following line.
router.put("/:id/status", adminOnly, updateStaff);
// Perform the side effect or state update expressed on the following line.
router.put("/:id", adminOnly, updateStaff);
// Perform the side effect or state update expressed on the following line.
router.delete("/:id", adminOnly, deleteStaff);

export default router;
