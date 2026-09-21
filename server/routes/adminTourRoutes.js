import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import express from "express";
import {
  getAllTours,
  getTour,
  restoreTour,
} from "../controllers/adminTourController.js";
import { createTour, updateTour, deleteTour, setPublication } from "../controllers/tourCrudController.js";
import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import validateFutureTourDate from "../middleware/validateFutureTourDate.js";
import validateTourCommand from "../middleware/validateTourCommand.js";
import { assignTourResourcesSafe } from "../controllers/tourResourceAssignmentController.js";

const router = express.Router();
router.use(resolveTenant);
router.use(protect);
router.use(adminMiddleware);
router.use(authorize("tour.manage"));

router.get("/", getAllTours);
router.get("/:id", getTour);
router.post("/", validateFutureTourDate, upload.array("images", 10), createTour);
router.put("/:id", validateTourCommand(), upload.array("images", 10), updateTour);
router.delete("/:id", deleteTour);
router.patch("/:id/publication", setPublication);
router.patch("/:id/restore", restoreTour);
router.patch("/:id/guide", assignTourResourcesSafe);
router.patch("/:id/driver", assignTourResourcesSafe);
router.patch("/:id/vehicle", assignTourResourcesSafe);

export default router;
