/**
 * Purpose: ai Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../controllers/aiController.js so this module can use its exported dependencies.
import { askAI } from "../controllers/aiController.js";
// Load ../controllers/aiBookingController.js so this module can use its exported dependencies.
import { completeBooking } from "../controllers/aiBookingController.js";
// Load ../controllers/adminAIController.js so this module can use its exported dependencies.
import { getAIDashboard, adminAIQuery } from "../controllers/adminAIController.js";
// Load ../controllers/adminAIAnalyticsController.js so this module can use its exported dependencies.
import { getAIAnalytics } from "../controllers/adminAIAnalyticsController.js";
// Load ../controllers/adminAIBriefingController.js so this module can use its exported dependencies.
import { getAIBriefing } from "../controllers/adminAIBriefingController.js";
// Load ../middleware/aiRateLimiter.js so this module can use its exported dependencies.
import { aiRateLimiter } from "../middleware/aiRateLimiter.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

// Perform the side effect or state update expressed on the following line.
router.get("/admin/dashboard", protect, getAIDashboard);
// Perform the side effect or state update expressed on the following line.
router.post("/admin/query", protect, adminAIQuery);
// Perform the side effect or state update expressed on the following line.
router.get("/admin/analytics", protect, getAIAnalytics);
// Perform the side effect or state update expressed on the following line.
router.get("/admin/briefing", protect, getAIBriefing);
// Perform the side effect or state update expressed on the following line.
router.post("/assistant", protect, aiRateLimiter, askAI);
// Perform the side effect or state update expressed on the following line.
router.post("/chat", protect, aiRateLimiter, askAI);
// Perform the side effect or state update expressed on the following line.
router.post("/booking/complete", protect, aiRateLimiter, completeBooking);

export default router;
