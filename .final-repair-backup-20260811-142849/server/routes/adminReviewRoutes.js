import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  getAdminReviews,
  approveAdminReview,
  rejectAdminReview,
  deleteAdminReview,
} from "../controllers/adminReviewController.js";

const router = express.Router();
router.use(protect, adminMiddleware);
router.get("/", getAdminReviews);
router.patch("/:id/approve", approveAdminReview);
router.patch("/:id/reject", rejectAdminReview);
router.delete("/:id", deleteAdminReview);

export default router;
