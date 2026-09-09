import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { listTaxRules, initializeTaxRules, upsertTaxRule, calculateTaxQuote } from "../controllers/taxController.js";

const router = express.Router();
router.use(resolveTenant, protect);
router.get("/rules", authorize("finance.view"), listTaxRules);
router.post("/rules/initialize", authorize("finance.manage"), initializeTaxRules);
router.put("/rules/:code", authorize("finance.manage"), (req, res, next) => { req.body = { ...(req.body || {}), code: req.params.code }; return upsertTaxRule(req, res, next); });
router.post("/calculate", authorize("finance.view"), calculateTaxQuote);
export default router;
