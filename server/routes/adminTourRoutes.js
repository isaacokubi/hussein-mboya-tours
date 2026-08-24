import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import express from "express";
import {
  createTour,
  getAllTours,
  getTour,
  updateTour,
  deleteTour,
  restoreTour,
  assignGuide,
  assignDriver,
  assignVehicle,
} from "../controllers/adminTourController.js";
import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import validateFutureTourDate from "../middleware/validateFutureTourDate.js";

const router = express.Router();
router.use(resolveTenant);
router.use(protect);
router.use(adminMiddleware);
router.use(authorize("tour.manage"));

router.get("/", getAllTours);
router.get("/:id", getTour);
router.post("/", validateFutureTourDate, upload.array("images", 10), createTour);
router.put("/:id", upload.array("images", 10), updateTour);
router.delete("/:id", deleteTour);
router.patch("/:id/restore", restoreTour);
router.patch("/:id/guide", assignGuide);
router.patch("/:id/driver", assignDriver);
router.patch("/:id/vehicle", assignVehicle);

export default router;
