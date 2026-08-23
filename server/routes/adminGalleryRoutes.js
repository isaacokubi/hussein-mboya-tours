import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { uploadSingle } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import contentManagerMiddleware from "../middleware/contentManagerMiddleware.js";
import {
  getAdminGallery,
  createAdminGallery,
  updateAdminGallery,
  deleteAdminGallery,
  uploadGalleryImage,
} from "../controllers/adminGalleryController.js";

const router = express.Router();

router.use(resolveTenant, protect, contentManagerMiddleware);
router.post("/upload", uploadSingle("image"), uploadGalleryImage);
router.get("/", getAdminGallery);
router.post("/", createAdminGallery);
router.put("/:id", updateAdminGallery);
router.delete("/:id", deleteAdminGallery);

export default router;
