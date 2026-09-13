import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";

import { protect, checkPermission } from "../middleware/authMiddleware.js";

import {
  getAIDashboard,
  adminAIQuery
} from "../controllers/adminAIController.js";

import {
  getAIAnalytics
} from "../controllers/adminAIAnalyticsController.js";

import {
  getAIBriefing
} from "../controllers/adminAIBriefingController.js";

import {
  getAIIntelligence
} from "../controllers/adminAIIntelligenceController.js";

import {
  getAIAlerts
} from "../controllers/adminAIAlertsController.js";

import {
  generateCustomerReply
} from "../controllers/adminAICustomerSupportController.js";

import {
  getAIRevenueAdvice
} from "../controllers/adminAIRevenueController.js";

import {
  getBookingRiskAnalysis
} from "../controllers/adminAIBookingRiskController.js";

import {
  generateAITasks,
  updateAITask
} from "../controllers/adminAITaskController.js";

import {
  getTourPricingAdvice
} from "../controllers/adminAITourPricingController.js";

import {
  getTourRecommendations
} from "../controllers/adminAITourRecommendationController.js";

import {
  getAIFraudMonitoring
} from "../controllers/adminAIFraudController.js";

import {
  getAISentimentAnalysis
} from "../controllers/adminAISentimentController.js";

import {
  generateAIMarketingCampaign
} from "../controllers/adminAIMarketingController.js";

import {
  getAIFinancialForecast
} from "../controllers/adminAIFinanceForecastController.js";

import {
  getAIOperationsCenter
} from "../controllers/adminAIOperationsController.js";

import {
  getAISalesAssistant
} from "../controllers/adminAISalesController.js";

const router = express.Router();

// Admin AI endpoints are authenticated before tenant resolution so tenant
// context can reliably fall back to the authenticated user's tenantId.
router.use(protect);
router.use(resolveTenant);

router.get("/dashboard", checkPermission("analytics.view"), getAIDashboard);
router.post("/query", checkPermission("analytics.view"), adminAIQuery);
router.get("/analytics", checkPermission("analytics.view"), getAIAnalytics);
router.get("/briefing", checkPermission("analytics.view"), getAIBriefing);
router.get("/intelligence", checkPermission("analytics.view"), getAIIntelligence);
router.get("/alerts", checkPermission("analytics.view"), getAIAlerts);
router.post("/customer-support", checkPermission("analytics.view"), generateCustomerReply);
router.get("/revenue-advice", checkPermission("analytics.view"), getAIRevenueAdvice);
router.get("/booking-risks", checkPermission("analytics.view"), getBookingRiskAnalysis);
router.get("/tasks", checkPermission("analytics.view"), generateAITasks);
router.patch("/tasks/:id", checkPermission("analytics.view"), updateAITask);
router.get("/pricing-advice", checkPermission("analytics.view"), getTourPricingAdvice);
router.get("/recommendations/:customerId", checkPermission("analytics.view"), getTourRecommendations);
router.get("/fraud-monitoring", checkPermission("analytics.view"), getAIFraudMonitoring);
router.get("/sentiment", checkPermission("analytics.view"), getAISentimentAnalysis);
router.get("/marketing-campaigns", checkPermission("analytics.view"), generateAIMarketingCampaign);
router.get("/financial-forecast", checkPermission("analytics.view"), getAIFinancialForecast);
router.get("/operations-center", checkPermission("analytics.view"), getAIOperationsCenter);
router.get("/sales-assistant", checkPermission("analytics.view"), getAISalesAssistant);

export default router;
