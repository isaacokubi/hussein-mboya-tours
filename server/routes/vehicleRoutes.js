/**
 * Purpose: vehicle Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/vehicleRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";

// Load ../controllers/vehicleController.js so this module can use its exported dependencies.
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

// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/roleMiddleware.js so this module can use its exported dependencies.
import { adminOnly, managerOnly, roleMiddleware } from "../middleware/roleMiddleware.js";
// Load ../middleware/uploadMiddleware.js so this module can use its exported dependencies.
import upload from "../middleware/uploadMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

// Perform the side effect or state update expressed on the following line.
router.use(protect);

// Vehicle management: Admin and Manager.
// Perform the side effect or state update expressed on the following line.
router.post("/", managerOnly, upload.single("image"), createVehicle);
// Perform the side effect or state update expressed on the following line.
router.put("/:id", managerOnly, upload.single("image"), updateVehicle);
// Perform the side effect or state update expressed on the following line.
router.delete("/:id", managerOnly, deleteVehicle);

// Vehicle visibility: Admin, Manager and Guide.
// Declare vehicleReadOnly for use by the surrounding module or function.
const vehicleReadOnly = roleMiddleware("admin", "manager", "guide");
// Perform the side effect or state update expressed on the following line.
router.get("/", vehicleReadOnly, getVehicles);
// Perform the side effect or state update expressed on the following line.
router.get("/:id", vehicleReadOnly, getVehicle);

// Driver assignment and vehicle status: Admin and Manager.
// Perform the side effect or state update expressed on the following line.
router.put("/:id/assign-driver", managerOnly, assignVehicleDriver);
// Perform the side effect or state update expressed on the following line.
router.put("/:id/remove-driver", managerOnly, removeVehicleDriver);
// Perform the side effect or state update expressed on the following line.
router.put("/:id/status", managerOnly, updateVehicleStatus);

// Restore is intentionally restricted to Admin.
// Perform the side effect or state update expressed on the following line.
router.patch("/:id/restore", adminOnly, restoreVehicle);

export default router;
