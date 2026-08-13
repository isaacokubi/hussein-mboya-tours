import express from "express";
import {
  getSecurityStatus,
  getSecurityEvents
} from "../controllers/securityController.js";

const router = express.Router();

router.get("/status", getSecurityStatus);
router.get("/events", getSecurityEvents);

export default router;
