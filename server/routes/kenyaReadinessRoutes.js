/**
 * Purpose: kenya Readiness Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load ../services/kenyaStep2ReadinessService.js so this module can use its exported dependencies.
import { getKenyaStep2Readiness } from "../services/kenyaStep2ReadinessService.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.use(authorize("finance.view"));

// Perform the side effect or state update expressed on the following line.
router.get("/", async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare data for use by the surrounding module or function.
    const data = await getKenyaStep2Readiness(req);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
});

export default router;
