// server/routes/staffRoutes.js

import express from "express";

import {
  createStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  getDrivers,
  getGuides,
} from "../controllers/staffController.js";

import { protect } from "../middleware/authMiddleware.js";
import {
  adminOnly,
  managerOnly,
} from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

// Operational staff lookup. Managers can read staff needed for assignments.
router.get("/guides", managerOnly, getGuides);
router.get("/drivers", managerOnly, getDrivers);

// Staff administration is restricted to Admin/SuperAdmin.
router.post("/", adminOnly, createStaff);
router.get("/", managerOnly, getStaff);
router.get("/:id", managerOnly, getStaffById);
router.put("/:id/status", adminOnly, updateStaff);
router.put("/:id", adminOnly, updateStaff);
router.delete("/:id", adminOnly, deleteStaff);

export default router;
