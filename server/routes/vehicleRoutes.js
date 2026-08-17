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
import { adminOnly, managerOnly, guideOnly } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

// Vehicle management: Admin and Manager.
router.post("/", managerOnly, upload.single("image"), createVehicle);
router.put("/:id", managerOnly, upload.single("image"), updateVehicle);
router.delete("/:id", managerOnly, deleteVehicle);

// Vehicle visibility: Admin, Manager and Guide.
router.get("/", roleMiddlewareForRead, getVehicles);
router.get("/:id", roleMiddlewareForRead, getVehicle);

// Driver assignment and vehicle status: Admin and Manager.
router.put("/:id/assign-driver", managerOnly, assignVehicleDriver);
router.put("/:id/remove-driver", managerOnly, removeVehicleDriver);
router.put("/:id/status", managerOnly, updateVehicleStatus);

// Restore is intentionally restricted to Admin.
router.patch("/:id/restore", adminOnly, restoreVehicle);

function roleMiddlewareForRead(req, res, next) {
  const role = req.userRole || req.user?.role || req.user?.roleId?.name || req.user?.role?.name;
  const normalized = String(role || "").toLowerCase().replace(/[-\s]/g, "_");
  if (["admin", "manager", "tour_manager", "tourmanager", "guide", "tour_guide", "tourguide", "superadmin", "super_admin"].includes(normalized)) {
    return next();
  }
  return res.status(403).json({ success: false, message: "Access denied. Insufficient role." });
}

export default router;
