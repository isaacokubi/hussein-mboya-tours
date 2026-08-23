import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import contentManagerMiddleware from "../middleware/contentManagerMiddleware.js";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { listHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide } from "../controllers/adminHeroController.js";

const router = express.Router();
router.use(resolveTenant, protect, contentManagerMiddleware);
router.get("/", listHeroSlides);
router.post("/", createHeroSlide);
router.put("/:id", updateHeroSlide);
router.delete("/:id", deleteHeroSlide);
export default router;
