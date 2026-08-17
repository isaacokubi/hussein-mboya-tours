import express from "express";
import {getApiMonitor} from "../controllers/apiMonitorController.js";

const router = express.Router();

router.get("/", getApiMonitor);

export default router;
