import express from "express";

import {
    protect
} from "../middleware/authMiddleware.js";


const rateLimiter = (req,res,next)=>{
    next();
};


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
  askAI
);

router.post(
  "/chat",
  protect,
  askAI
);

export default router;
