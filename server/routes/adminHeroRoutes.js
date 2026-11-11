/**
 * Purpose: admin Hero Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/contentManagerMiddleware.js so this module can use its exported dependencies.
import contentManagerMiddleware from "../middleware/contentManagerMiddleware.js";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../controllers/adminHeroController.js so this module can use its exported dependencies.
import { listHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide } from "../controllers/adminHeroController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant, protect, contentManagerMiddleware);
// Perform the side effect or state update expressed on the following line.
router.get("/", listHeroSlides);
// Perform the side effect or state update expressed on the following line.
router.post("/", createHeroSlide);
// Perform the side effect or state update expressed on the following line.
router.put("/:id", updateHeroSlide);
// Perform the side effect or state update expressed on the following line.
router.delete("/:id", deleteHeroSlide);
export default router;
