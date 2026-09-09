import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import {
  listSuppliers, createSupplier, updateSupplier,
  listPurchaseOrders, createPurchaseOrder, transitionPurchaseOrder,
  listTourCosts, createTourCost, tourProfitability,
  listSupplierPayables, createSupplierPayable, paySupplierPayable,
  listCorporateAccounts, createCorporateAccount, resourceConflicts,
} from "../controllers/operationsModuleController.js";

const router = express.Router();
router.use(resolveTenant, protect, checkPermission("booking.manage"));
router.get("/suppliers", listSuppliers);
router.post("/suppliers", createSupplier);
router.patch("/suppliers/:id", updateSupplier);
router.get("/purchase-orders", listPurchaseOrders);
router.post("/purchase-orders", createPurchaseOrder);
router.patch("/purchase-orders/:id/status", transitionPurchaseOrder);
router.get("/tour-costs", listTourCosts);
router.post("/tour-costs", createTourCost);
router.get("/tour-costs/profitability/:tourId", tourProfitability);
router.get("/supplier-payables", listSupplierPayables);
router.post("/supplier-payables", createSupplierPayable);
router.post("/supplier-payables/:id/pay", paySupplierPayable);
router.get("/corporate-accounts", listCorporateAccounts);
router.post("/corporate-accounts", createCorporateAccount);
router.get("/resource-conflicts", resourceConflicts);
export default router;
