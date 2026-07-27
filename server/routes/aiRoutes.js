import express from "express";

import { askAI } from "../controllers/aiController.js";

const router = express.Router();

router.post("/assistant", askAI);

export default router;
