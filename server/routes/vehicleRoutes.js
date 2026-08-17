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

// Vehicle management is available to Admin and Manager.
router.post("/", managerOnly, upload.single("image"), createVehicle);
router.get("/", role => role);
router.get("/", (req, res, next) => next());

export default router;
