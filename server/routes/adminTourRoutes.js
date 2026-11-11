/**
 * Purpose: admin Tour Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../controllers/adminTourController.js so this module can use its exported dependencies.
import {
  getAllTours,
  getTour,
  restoreTour,
} from "../controllers/adminTourController.js";
// Load ../controllers/tourCrudController.js so this module can use its exported dependencies.
import { createTour, updateTour, deleteTour, setPublication } from "../controllers/tourCrudController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/adminMiddleware.js so this module can use its exported dependencies.
import adminMiddleware from "../middleware/adminMiddleware.js";
// Load ../middleware/uploadMiddleware.js so this module can use its exported dependencies.
import upload from "../middleware/uploadMiddleware.js";
// Load ../middleware/validateFutureTourDate.js so this module can use its exported dependencies.
import validateFutureTourDate from "../middleware/validateFutureTourDate.js";
// Load ../middleware/validateTourCommand.js so this module can use its exported dependencies.
import validateTourCommand from "../middleware/validateTourCommand.js";
// Load ../controllers/tourResourceAssignmentController.js so this module can use its exported dependencies.
import { assignTourResourcesSafe } from "../controllers/tourResourceAssignmentController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(adminMiddleware);
// Perform the side effect or state update expressed on the following line.
router.use(authorize("tour.manage"));

// Perform the side effect or state update expressed on the following line.
router.get("/", getAllTours);
// Perform the side effect or state update expressed on the following line.
router.get("/:id", getTour);
// Perform the side effect or state update expressed on the following line.
router.post("/", validateFutureTourDate, upload.array("images", 10), createTour);
// Perform the side effect or state update expressed on the following line.
router.put("/:id", validateTourCommand(), upload.array("images", 10), updateTour);
// Perform the side effect or state update expressed on the following line.
router.delete("/:id", deleteTour);
// Perform the side effect or state update expressed on the following line.
router.patch("/:id/publication", setPublication);
// Perform the side effect or state update expressed on the following line.
router.patch("/:id/restore", restoreTour);
// Perform the side effect or state update expressed on the following line.
router.patch("/:id/guide", assignTourResourcesSafe);
// Perform the side effect or state update expressed on the following line.
router.patch("/:id/driver", assignTourResourcesSafe);
// Perform the side effect or state update expressed on the following line.
router.patch("/:id/vehicle", assignTourResourcesSafe);

export default router;
