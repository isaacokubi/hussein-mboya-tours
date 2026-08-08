// server/routes/aiRoutes.js

import express from "express";

import {
  askAI,
} from "../controllers/aiController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  rateLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AI ASSISTANT
|--------------------------------------------------------------------------
|
| POST /api/ai/assistant
|
| Protected endpoint.
| Applies rate limiting to prevent abuse.
|
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

export default router;