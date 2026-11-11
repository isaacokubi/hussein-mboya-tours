/**
 * Purpose: tax Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load ../controllers/taxController.js so this module can use its exported dependencies.
import { listTaxRules, initializeTaxRules, upsertTaxRule, calculateTaxQuote } from "../controllers/taxController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant, protect);
// Perform the side effect or state update expressed on the following line.
router.get("/rules", authorize("finance.view"), listTaxRules);
// Perform the side effect or state update expressed on the following line.
router.post("/rules/initialize", authorize("finance.manage"), initializeTaxRules);
// Perform the side effect or state update expressed on the following line.
router.put("/rules/:code", authorize("finance.manage"), (req, res, next) => { req.body = { ...(req.body || {}), code: req.params.code }; return upsertTaxRule(req, res, next); });
// Perform the side effect or state update expressed on the following line.
router.post("/calculate", authorize("finance.view"), calculateTaxQuote);
export default router;
