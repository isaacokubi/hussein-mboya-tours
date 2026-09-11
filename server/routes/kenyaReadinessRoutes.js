import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { getKenyaStep2Readiness } from "../services/kenyaStep2ReadinessService.js";

const router = express.Router();
router.use(protect);
router.use(authorize("finance.view"));

router.get("/", async (req, res, next) => {
  try {
    const data = await getKenyaStep2Readiness(req);
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

export default router;
