// server/routes/vehicleRoutes.js

import express from "express";

import {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  restoreVehicle,
  assignVehicleDriver,
  removeVehicleDriver,
  updateVehicleStatus,
} from "../controllers/vehicleController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly, managerOnly, roleMiddleware } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

// Vehicle management: Admin and Manager.
router.post("/", managerOnly, upload.single("image"), createVehicle);
router.put("/:id", managerOnly, upload.single("image"), updateVehicle);
router.delete("/:id", managerOnly, deleteVehicle);

// Vehicle visibility: Admin, Manager and Guide.
const vehicleReadOnly = roleMiddleware("admin", "manager", "guide");
router.get("/", vehicleReadOnly, getVehicles);
router.get("/:id", vehicleReadOnly, getVehicle);

// Driver assignment and vehicle status: Admin and Manager.
router.put("/:id/assign-driver", managerOnly, assignVehicleDriver);
router.put("/:id/remove-driver", managerOnly, removeVehicleDriver);
router.put("/:id/status", managerOnly, updateVehicleStatus);

// Restore is intentionally restricted to Admin.
router.patch("/:id/restore", adminOnly, restoreVehicle);

export default router;
