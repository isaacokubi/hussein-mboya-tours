import express from "express";
import { getSettings, updateSettings, getPublicSettings } from "../controllers/settingsController.js";
import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/public", getPublicSettings);

router.use(protect);
router.use(adminMiddleware);

router.get("/", getSettings);
router.put("/", upload.single("logo"), updateSettings);
router.patch("/", upload.single("logo"), updateSettings);

export default router;
