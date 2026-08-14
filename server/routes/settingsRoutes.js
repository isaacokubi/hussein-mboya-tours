import express from "express";
import {
  getSettings,
  updateSettings
} from "../controllers/settingsController.js";

const router = express.Router();


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
