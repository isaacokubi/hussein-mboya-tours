import express from "express";
import { protect, managerOnly } from "../middleware/authMiddleware.js";
import { listHotels, getHotel, listAdminHotels, createHotel, updateHotel, createRoomType, updateRoomType, createHotelBooking, listHotelBookings, updateHotelBooking } from "../controllers/hotelController.js";

const router = express.Router();
router.get("/", listHotels);
router.get("/:id", getHotel);
router.get("/admin/catalog", protect, managerOnly, listAdminHotels);
router.post("/admin/catalog", protect, managerOnly, createHotel);
router.patch("/admin/catalog/:id", protect, managerOnly, updateHotel);
router.post("/admin/catalog/:hotelId/rooms", protect, managerOnly, createRoomType);
router.patch("/admin/rooms/:id", protect, managerOnly, updateRoomType);
router.post("/bookings", protect, createHotelBooking);
router.get("/bookings", protect, listHotelBookings);
router.patch("/bookings/:id", protect, updateHotelBooking);
export default router;
