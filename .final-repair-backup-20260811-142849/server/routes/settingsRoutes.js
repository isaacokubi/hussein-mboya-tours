import express from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settingsController.js";
import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminMiddleware);

router.get("/", getSettings);
router.put("/", updateSettings);
router.patch("/", updateSettings);

export default router;
