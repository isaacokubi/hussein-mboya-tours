import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import contentManagerMiddleware from "../middleware/contentManagerMiddleware.js";
import { createTravelGuide, deleteTravelGuide, listAdminTravelGuides, updateTravelGuide } from "../controllers/travelGuideController.js";

const router = express.Router();
router.use(resolveTenant, protect, contentManagerMiddleware);
router.get("/", listAdminTravelGuides);
router.post("/", createTravelGuide);
router.put("/:id", updateTravelGuide);
router.delete("/:id", deleteTravelGuide);

export default router;
