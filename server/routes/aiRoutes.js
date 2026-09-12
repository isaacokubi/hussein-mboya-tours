import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { askAI } from "../controllers/aiController.js";
import { completeBooking } from "../controllers/aiBookingController.js";
import { getAIDashboard, adminAIQuery } from "../controllers/adminAIController.js";
import { getAIAnalytics } from "../controllers/adminAIAnalyticsController.js";
import { getAIBriefing } from "../controllers/adminAIBriefingController.js";
import { aiRateLimiter } from "../middleware/aiRateLimiter.js";

const router = express.Router();
router.use(resolveTenant);

router.get("/admin/dashboard", protect, getAIDashboard);
router.post("/admin/query", protect, adminAIQuery);
router.get("/admin/analytics", protect, getAIAnalytics);
router.get("/admin/briefing", protect, getAIBriefing);
router.post("/assistant", protect, aiRateLimiter, askAI);
router.post("/chat", protect, aiRateLimiter, askAI);
router.post("/booking/complete", protect, aiRateLimiter, completeBooking);

export default router;
