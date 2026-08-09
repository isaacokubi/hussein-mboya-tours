import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  getAdminGallery,
  createAdminGallery,
  updateAdminGallery,
  deleteAdminGallery,
} from "../controllers/adminGalleryController.js";

const router = express.Router();
router.use(protect, adminMiddleware);
router.get("/", getAdminGallery);
router.post("/", createAdminGallery);
router.put("/:id", updateAdminGallery);
router.delete("/:id", deleteAdminGallery);

export default router;
