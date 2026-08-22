import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";

import {
  protect
} from "../middleware/authMiddleware.js";

import {
  askAI
} from "../controllers/aiController.js";

import {
  completeBooking
} from "../controllers/aiBookingController.js";


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


const rateLimiter = (req, res, next) => {
  next();
};


const router = express.Router();

router.use(resolveTenant);


router.get(
  "/admin/dashboard",
  protect,
  getAIDashboard
);


router.post(
  "/admin/query",
  protect,
  adminAIQuery
);


router.get(
  "/admin/analytics",
  protect,
  getAIAnalytics
);


router.get(
  "/admin/briefing",
  protect,
  getAIBriefing
);


/*
|--------------------------------------------------------------------------
| AI ASSISTANT
|--------------------------------------------------------------------------
*/


router.post(
  "/assistant",
  protect,
  rateLimiter,
  askAI
);


router.post(
  "/chat",
  protect,
  rateLimiter,
  askAI
);



router.post(
  "/booking/complete",
  protect,
  rateLimiter,
  completeBooking
);


export default router;
