/**
 * Purpose: hotel Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, managerOnly } from "../middleware/authMiddleware.js";
// Load ../controllers/hotelController.js so this module can use its exported dependencies.
import { listHotels, getHotel, updateHotel, createRoomType, updateRoomType, createHotelBooking, updateHotelBooking } from "../controllers/hotelController.js";
// Load ../controllers/adminHotelCreationController.js so this module can use its exported dependencies.
import { createAdminHotel } from "../controllers/adminHotelCreationController.js";
// Load ../controllers/hotelAvailabilityController.js so this module can use its exported dependencies.
import { checkHotelAvailability } from "../controllers/hotelAvailabilityController.js";
// Load ../controllers/hospitalityAdminController.js so this module can use its exported dependencies.
import { listAdminHotelsSafe, listHotelBookingsSafe } from "../controllers/hospitalityAdminController.js";
// Load ../controllers/hospitalityInventorySyncController.js so this module can use its exported dependencies.
import { syncAccommodationInventoryToHotelPms } from "../controllers/hospitalityInventorySyncController.js";
// Load ../controllers/hospitalityInventoryConcurrencyController.js so this module can use its exported dependencies.
import { createConcurrentSafeHotelBooking } from "../controllers/hospitalityInventoryConcurrencyController.js";
// Load ../middleware/paymentMutationGuard.js so this module can use its exported dependencies.
import { paymentMutationGuard } from "../middleware/paymentMutationGuard.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.get("/", listHotels);
// Perform the side effect or state update expressed on the following line.
router.get("/availability", checkHotelAvailability);
// Perform the side effect or state update expressed on the following line.
router.get("/admin/catalog", protect, managerOnly, listAdminHotelsSafe);
// Perform the side effect or state update expressed on the following line.
router.post("/admin/catalog", protect, managerOnly, createAdminHotel);
// Perform the side effect or state update expressed on the following line.
router.patch("/admin/catalog/:id", protect, managerOnly, updateHotel);
// Perform the side effect or state update expressed on the following line.
router.post("/admin/catalog/:hotelId/rooms", protect, managerOnly, createRoomType);
// Perform the side effect or state update expressed on the following line.
router.patch("/admin/rooms/:id", protect, managerOnly, updateRoomType);
// Perform the side effect or state update expressed on the following line.
router.post("/admin/sync-inventory", protect, managerOnly, syncAccommodationInventoryToHotelPms);
// Perform the side effect or state update expressed on the following line.
router.post("/bookings", protect, createConcurrentSafeHotelBooking);
// Perform the side effect or state update expressed on the following line.
router.get("/bookings", protect, listHotelBookingsSafe);
// Perform the side effect or state update expressed on the following line.
router.patch("/bookings/:id", protect, paymentMutationGuard, updateHotelBooking);
// Perform the side effect or state update expressed on the following line.
router.get("/:id", getHotel);
export default router;
