/**
 * Purpose: admin Review Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/adminMiddleware.js so this module can use its exported dependencies.
import adminMiddleware from "../middleware/adminMiddleware.js";
// Load ../controllers/adminReviewController.js so this module can use its exported dependencies.
import {
  getAdminReviews,
  approveAdminReview,
  rejectAdminReview,
  deleteAdminReview,
} from "../controllers/adminReviewController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(protect, adminMiddleware);
// Perform the side effect or state update expressed on the following line.
router.use(authorize("review.manage"));
// Perform the side effect or state update expressed on the following line.
router.get("/", getAdminReviews);
// Perform the side effect or state update expressed on the following line.
router.patch("/:id/approve", approveAdminReview);
// Perform the side effect or state update expressed on the following line.
router.patch("/:id/reject", rejectAdminReview);
// Perform the side effect or state update expressed on the following line.
router.delete("/:id", deleteAdminReview);

export default router;
