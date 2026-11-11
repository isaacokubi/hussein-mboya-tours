/**
 * Purpose: hospitality Operations Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, managerOnly } from "../middleware/authMiddleware.js";
// Load ../controllers/hospitalityOperationsController.js so this module can use its exported dependencies.
import { ensureOpsAccess, hospitalityDashboard, hotelCalendar, hotelPerformance, amendHotelBooking, cancelHotelBooking, blockRooms, roomBlocks, releaseRoomBlock, ratePlans, saveRatePlan, supplierContracts, saveSupplierContract, deposits, saveDeposit, transferDispatch, assignTransfer, updateTransferStatus, paymentReconciliation, listDrivers, listVehicles } from "../controllers/hospitalityOperationsController.js";
// Load ../controllers/hospitalityBookingAmendmentController.js so this module can use its exported dependencies.
import { amendHotelBookingProduction } from "../controllers/hospitalityBookingAmendmentController.js";
// Load ../controllers/hospitalityInventoryConcurrencyController.js so this module can use its exported dependencies.
import { createConcurrentSafeRoomBlock } from "../controllers/hospitalityInventoryConcurrencyController.js";
// Load ../controllers/hospitalityCommercialController.js so this module can use its exported dependencies.
import { createCommercialRatePlan, updateCommercialRatePlan, createCommercialSupplierContract, updateCommercialSupplierContract, createCommercialDeposit, updateCommercialDeposit } from "../controllers/hospitalityCommercialController.js";

// Declare router for use by the surrounding module or function.
const router=express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(protect,managerOnly,ensureOpsAccess);
// Perform the side effect or state update expressed on the following line.
router.get("/dashboard",hospitalityDashboard);
// Perform the side effect or state update expressed on the following line.
router.get("/hotels/calendar",hotelCalendar);
// Perform the side effect or state update expressed on the following line.
router.get("/hotels/performance",hotelPerformance);
// Perform the side effect or state update expressed on the following line.
router.patch("/hotels/bookings/:id/amend",amendHotelBookingProduction);
// Perform the side effect or state update expressed on the following line.
router.patch("/hotels/bookings/:id/cancel",cancelHotelBooking);
// Perform the side effect or state update expressed on the following line.
router.get("/hotels/room-blocks",roomBlocks);
// Perform the side effect or state update expressed on the following line.
router.post("/hotels/room-blocks",createConcurrentSafeRoomBlock);
// Perform the side effect or state update expressed on the following line.
router.patch("/hotels/room-blocks/:id/release",releaseRoomBlock);
// Perform the side effect or state update expressed on the following line.
router.get("/rate-plans",ratePlans);
// Perform the side effect or state update expressed on the following line.
router.post("/rate-plans",createCommercialRatePlan);
// Perform the side effect or state update expressed on the following line.
router.patch("/rate-plans/:id",updateCommercialRatePlan);
// Perform the side effect or state update expressed on the following line.
router.get("/suppliers/contracts",supplierContracts);
// Perform the side effect or state update expressed on the following line.
router.post("/suppliers/contracts",createCommercialSupplierContract);
// Perform the side effect or state update expressed on the following line.
router.patch("/suppliers/contracts/:id",updateCommercialSupplierContract);
// Perform the side effect or state update expressed on the following line.
router.get("/deposits",deposits);
// Perform the side effect or state update expressed on the following line.
router.post("/deposits",createCommercialDeposit);
// Perform the side effect or state update expressed on the following line.
router.patch("/deposits/:id",updateCommercialDeposit);
// Perform the side effect or state update expressed on the following line.
router.get("/transfers/dispatch",transferDispatch);
// Perform the side effect or state update expressed on the following line.
router.patch("/transfers/:id/assign",assignTransfer);
// Perform the side effect or state update expressed on the following line.
router.patch("/transfers/:id/status",updateTransferStatus);
// Perform the side effect or state update expressed on the following line.
router.get("/payments/reconciliation",paymentReconciliation);
// Perform the side effect or state update expressed on the following line.
router.get("/drivers",listDrivers);
// Perform the side effect or state update expressed on the following line.
router.get("/vehicles",listVehicles);
export default router;
