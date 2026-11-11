/**
 * Purpose: admin AIRoutes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";

// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, checkPermission } from "../middleware/authMiddleware.js";

// Load ../controllers/adminAIController.js so this module can use its exported dependencies.
import {
  getAIDashboard,
  adminAIQuery
} from "../controllers/adminAIController.js";

// Load ../controllers/adminAIAnalyticsController.js so this module can use its exported dependencies.
import {
  getAIAnalytics
} from "../controllers/adminAIAnalyticsController.js";

// Load ../controllers/adminAIBriefingController.js so this module can use its exported dependencies.
import {
  getAIBriefing
} from "../controllers/adminAIBriefingController.js";

// Load ../controllers/adminAIIntelligenceController.js so this module can use its exported dependencies.
import {
  getAIIntelligence
} from "../controllers/adminAIIntelligenceController.js";

// Load ../controllers/adminAIAlertsController.js so this module can use its exported dependencies.
import {
  getAIAlerts
} from "../controllers/adminAIAlertsController.js";

// Load ../controllers/adminAICustomerSupportController.js so this module can use its exported dependencies.
import {
  generateCustomerReply
} from "../controllers/adminAICustomerSupportController.js";

// Load ../controllers/adminAIRevenueController.js so this module can use its exported dependencies.
import {
  getAIRevenueAdvice
} from "../controllers/adminAIRevenueController.js";

// Load ../controllers/adminAIBookingRiskController.js so this module can use its exported dependencies.
import {
  getBookingRiskAnalysis
} from "../controllers/adminAIBookingRiskController.js";

// Load ../controllers/adminAITaskController.js so this module can use its exported dependencies.
import {
  generateAITasks,
  updateAITask
} from "../controllers/adminAITaskController.js";

// Load ../controllers/adminAITourPricingController.js so this module can use its exported dependencies.
import {
  getTourPricingAdvice
} from "../controllers/adminAITourPricingController.js";

// Load ../controllers/adminAITourRecommendationController.js so this module can use its exported dependencies.
import {
  getTourRecommendations
} from "../controllers/adminAITourRecommendationController.js";

// Load ../controllers/adminAIFraudController.js so this module can use its exported dependencies.
import {
  getAIFraudMonitoring
} from "../controllers/adminAIFraudController.js";

// Load ../controllers/adminAISentimentController.js so this module can use its exported dependencies.
import {
  getAISentimentAnalysis
} from "../controllers/adminAISentimentController.js";

// Load ../controllers/adminAIMarketingController.js so this module can use its exported dependencies.
import {
  generateAIMarketingCampaign
} from "../controllers/adminAIMarketingController.js";

// Load ../controllers/adminAIFinanceForecastController.js so this module can use its exported dependencies.
import {
  getAIFinancialForecast
} from "../controllers/adminAIFinanceForecastController.js";

// Load ../controllers/adminAIOperationsController.js so this module can use its exported dependencies.
import {
  getAIOperationsCenter
} from "../controllers/adminAIOperationsController.js";

// Load ../controllers/adminAISalesController.js so this module can use its exported dependencies.
import {
  getAISalesAssistant
} from "../controllers/adminAISalesController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Admin AI endpoints are authenticated before tenant resolution so tenant
// context can reliably fall back to the authenticated user's tenantId.
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

// Perform the side effect or state update expressed on the following line.
router.get("/dashboard", checkPermission("analytics.view"), getAIDashboard);
// Perform the side effect or state update expressed on the following line.
router.post("/query", checkPermission("analytics.view"), adminAIQuery);
// Perform the side effect or state update expressed on the following line.
router.get("/analytics", checkPermission("analytics.view"), getAIAnalytics);
// Perform the side effect or state update expressed on the following line.
router.get("/briefing", checkPermission("analytics.view"), getAIBriefing);
// Perform the side effect or state update expressed on the following line.
router.get("/intelligence", checkPermission("analytics.view"), getAIIntelligence);
// Perform the side effect or state update expressed on the following line.
router.get("/alerts", checkPermission("analytics.view"), getAIAlerts);
// Perform the side effect or state update expressed on the following line.
router.post("/customer-support", checkPermission("analytics.view"), generateCustomerReply);
// Perform the side effect or state update expressed on the following line.
router.get("/revenue-advice", checkPermission("analytics.view"), getAIRevenueAdvice);
// Perform the side effect or state update expressed on the following line.
router.get("/booking-risks", checkPermission("analytics.view"), getBookingRiskAnalysis);
// Perform the side effect or state update expressed on the following line.
router.get("/tasks", checkPermission("analytics.view"), generateAITasks);
// Perform the side effect or state update expressed on the following line.
router.patch("/tasks/:id", checkPermission("analytics.view"), updateAITask);
// Perform the side effect or state update expressed on the following line.
router.get("/pricing-advice", checkPermission("analytics.view"), getTourPricingAdvice);
// Perform the side effect or state update expressed on the following line.
router.get("/recommendations/:customerId", checkPermission("analytics.view"), getTourRecommendations);
// Perform the side effect or state update expressed on the following line.
router.get("/fraud-monitoring", checkPermission("analytics.view"), getAIFraudMonitoring);
// Perform the side effect or state update expressed on the following line.
router.get("/sentiment", checkPermission("analytics.view"), getAISentimentAnalysis);
// Perform the side effect or state update expressed on the following line.
router.get("/marketing-campaigns", checkPermission("analytics.view"), generateAIMarketingCampaign);
// Perform the side effect or state update expressed on the following line.
router.get("/financial-forecast", checkPermission("analytics.view"), getAIFinancialForecast);
// Perform the side effect or state update expressed on the following line.
router.get("/operations-center", checkPermission("analytics.view"), getAIOperationsCenter);
// Perform the side effect or state update expressed on the following line.
router.get("/sales-assistant", checkPermission("analytics.view"), getAISalesAssistant);

export default router;
