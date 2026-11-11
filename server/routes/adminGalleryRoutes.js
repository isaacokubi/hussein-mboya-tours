/**
 * Purpose: admin Gallery Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/uploadMiddleware.js so this module can use its exported dependencies.
import { uploadSingle } from "../middleware/uploadMiddleware.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/contentManagerMiddleware.js so this module can use its exported dependencies.
import contentManagerMiddleware from "../middleware/contentManagerMiddleware.js";
// Load ../controllers/adminGalleryController.js so this module can use its exported dependencies.
import {
  getAdminGallery,
  createAdminGallery,
  updateAdminGallery,
  deleteAdminGallery,
  uploadGalleryImage,
} from "../controllers/adminGalleryController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant, protect, contentManagerMiddleware);
// Perform the side effect or state update expressed on the following line.
router.post("/upload", uploadSingle("image"), uploadGalleryImage);
// Perform the side effect or state update expressed on the following line.
router.get("/", getAdminGallery);
// Perform the side effect or state update expressed on the following line.
router.post("/", createAdminGallery);
// Perform the side effect or state update expressed on the following line.
router.put("/:id", updateAdminGallery);
// Perform the side effect or state update expressed on the following line.
router.delete("/:id", deleteAdminGallery);

export default router;
