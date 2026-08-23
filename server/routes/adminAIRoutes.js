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

router.use(resolveTenant);


/*
|--------------------------------------------------------------------------
| ADMIN AI DASHBOARD
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  protect,
  checkPermission("analytics.view"),
  getAIDashboard
);


/*
|--------------------------------------------------------------------------
| AI BUSINESS QUERY
|--------------------------------------------------------------------------
*/

router.post(
  "/query",
  protect,
  checkPermission("analytics.view"),
  adminAIQuery
);


/*
|--------------------------------------------------------------------------
| AI ANALYTICS
|--------------------------------------------------------------------------
*/

router.get(
  "/analytics",
  protect,
  checkPermission("analytics.view"),
  getAIAnalytics
);


/*
|--------------------------------------------------------------------------
| DAILY AI BRIEFING
|--------------------------------------------------------------------------
*/

router.get(
  "/briefing",
  protect,
  checkPermission("analytics.view"),
  getAIBriefing
);



router.get(
  "/intelligence",
  protect,
  checkPermission("analytics.view"),
  getAIIntelligence
);


router.get(
  "/alerts",
  protect,
  checkPermission("analytics.view"),
  getAIAlerts
);


router.post(
  "/customer-support",
  protect,
  checkPermission("analytics.view"),
  generateCustomerReply
);


router.get(
  "/revenue-advice",
  protect,
  checkPermission("analytics.view"),
  getAIRevenueAdvice
);


router.get(
  "/booking-risks",
  protect,
  checkPermission("analytics.view"),
  getBookingRiskAnalysis
);


router.get(
  "/tasks",
  protect,
  checkPermission("analytics.view"),
  generateAITasks
);


router.patch(
  "/tasks/:id",
  protect,
  checkPermission("analytics.view"),
  updateAITask
);


router.get(
  "/pricing-advice",
  protect,
  checkPermission("analytics.view"),
  getTourPricingAdvice
);


router.get(
  "/recommendations/:customerId",
  protect,
  checkPermission("analytics.view"),
  getTourRecommendations
);


router.get(
  "/fraud-monitoring",
  protect,
  checkPermission("analytics.view"),
  getAIFraudMonitoring
);


router.get(
  "/sentiment",
  protect,
  checkPermission("analytics.view"),
  getAISentimentAnalysis
);


router.get(
  "/marketing-campaigns",
  protect,
  checkPermission("analytics.view"),
  generateAIMarketingCampaign
);


router.get(
  "/financial-forecast",
  protect,
  checkPermission("analytics.view"),
  getAIFinancialForecast
);


router.get(
  "/operations-center",
  protect,
  checkPermission("analytics.view"),
  getAIOperationsCenter
);


router.get(
  "/sales-assistant",
  protect,
  checkPermission("analytics.view"),
  getAISalesAssistant
);


export default router;
