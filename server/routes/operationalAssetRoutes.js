/**
 * Purpose: operational Asset Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../controllers/operationalAssetController.js so this module can use its exported dependencies.
import { listOperationalAssets, createOperationalAsset, updateOperationalAsset, deleteOperationalAsset } from "../controllers/operationalAssetController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.get("/", listOperationalAssets);
// Perform the side effect or state update expressed on the following line.
router.post("/", createOperationalAsset);
// Perform the side effect or state update expressed on the following line.
router.patch("/:id", updateOperationalAsset);
// Perform the side effect or state update expressed on the following line.
router.delete("/:id", deleteOperationalAsset);
export default router;
