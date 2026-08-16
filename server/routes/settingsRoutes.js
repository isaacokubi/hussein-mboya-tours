import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import {
  getSettings,
  updateSettings
} from "../controllers/settingsController.js";

const router = express.Router();

router.use(protect);
router.use(authorize("settings.manage"));


// Get system settings
router.get(
  "/",
  getSettings
);


// Update system settings
router.put(
  "/",
  updateSettings
);


export default router;


// RBAC middleware placeholder
