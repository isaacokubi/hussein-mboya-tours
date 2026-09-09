import express from "express";
import { listOperationalAssets, createOperationalAsset, updateOperationalAsset, deleteOperationalAsset } from "../controllers/operationalAssetController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", listOperationalAssets);
router.post("/", createOperationalAsset);
router.patch("/:id", updateOperationalAsset);
router.delete("/:id", deleteOperationalAsset);
export default router;
