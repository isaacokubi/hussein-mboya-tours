import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { getPublicTravelGuide, listPublicTravelGuides } from "../controllers/travelGuideController.js";

const router = express.Router();
router.use(resolveTenant);
router.get("/", listPublicTravelGuides);
router.get("/:slug", getPublicTravelGuide);

export default router;
