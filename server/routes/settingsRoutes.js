import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { uploadSingle } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(resolveTenant);

router.use(protect);
router.use(authorize("settings.manage"));

router.get("/", getSettings);
router.put("/", uploadSingle("logo"), updateSettings);

export default router;
