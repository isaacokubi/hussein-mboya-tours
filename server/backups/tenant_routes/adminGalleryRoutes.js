import { authorize } from "../middleware/permissionMiddleware.js";
import express from "express";
import { uploadSingle } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  getAdminGallery,
  createAdminGallery,
  updateAdminGallery,
  deleteAdminGallery,
  uploadGalleryImage,
} from "../controllers/adminGalleryController.js";

const router = express.Router();
router.use(protect, adminMiddleware);

router.use(authorize("settings.manage"));
router.post("/upload", uploadSingle("image"), uploadGalleryImage);
router.get("/", getAdminGallery);
router.post("/", createAdminGallery);
router.put("/:id", updateAdminGallery);
router.delete("/:id", deleteAdminGallery);

export default router;
