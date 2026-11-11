/**
 * Purpose: operations Module Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, checkPermission } from "../middleware/authMiddleware.js";
// Load ../controllers/operationsModuleController.js so this module can use its exported dependencies.
import {
  listSuppliers, createSupplier, updateSupplier,
  listPurchaseOrders, createPurchaseOrder, transitionPurchaseOrder,
  listTourCosts, createTourCost, tourProfitability,
  listSupplierPayables, createSupplierPayable, paySupplierPayable,
  listCorporateAccounts, createCorporateAccount, reconcileCorporateAccount, resourceConflicts,
} from "../controllers/operationsModuleController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant, protect, checkPermission("booking.manage"));
// Perform the side effect or state update expressed on the following line.
router.get("/suppliers", listSuppliers);
// Perform the side effect or state update expressed on the following line.
router.post("/suppliers", createSupplier);
// Perform the side effect or state update expressed on the following line.
router.patch("/suppliers/:id", updateSupplier);
// Perform the side effect or state update expressed on the following line.
router.get("/purchase-orders", listPurchaseOrders);
// Perform the side effect or state update expressed on the following line.
router.post("/purchase-orders", createPurchaseOrder);
// Perform the side effect or state update expressed on the following line.
router.patch("/purchase-orders/:id/status", transitionPurchaseOrder);
// Perform the side effect or state update expressed on the following line.
router.get("/tour-costs", listTourCosts);
// Perform the side effect or state update expressed on the following line.
router.post("/tour-costs", createTourCost);
// Perform the side effect or state update expressed on the following line.
router.get("/tour-costs/profitability/:tourId", tourProfitability);
// Perform the side effect or state update expressed on the following line.
router.get("/supplier-payables", listSupplierPayables);
// Perform the side effect or state update expressed on the following line.
router.post("/supplier-payables", createSupplierPayable);
// Perform the side effect or state update expressed on the following line.
router.post("/supplier-payables/:id/pay", paySupplierPayable);
// Perform the side effect or state update expressed on the following line.
router.get("/corporate-accounts", listCorporateAccounts);
// Perform the side effect or state update expressed on the following line.
router.post("/corporate-accounts", createCorporateAccount);
// Perform the side effect or state update expressed on the following line.
router.post("/corporate-accounts/:id/reconcile", reconcileCorporateAccount);
// Perform the side effect or state update expressed on the following line.
router.get("/resource-conflicts", resourceConflicts);
export default router;
