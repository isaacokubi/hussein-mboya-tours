import express from "express";

import {
  protect
} from "../middleware/authMiddleware.js";

import {
  askAI
} from "../controllers/aiController.js";


const rateLimiter = (req, res, next) => {
  next();
};


const router = express.Router();


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


export default router;
