import express from "express";


import {

  createBooking,

  getMyBookings,

  getBooking,

  cancelBooking,

  getAllBookings


} from "../controllers/bookingController.js";



import {

  protect

} from "../middleware/authMiddleware.js";



import {

  roleMiddleware

} from "../middleware/roleMiddleware.js";





const router = express.Router();








/*
|--------------------------------------------------------------------------
| CUSTOMER BOOKING ROUTES
|--------------------------------------------------------------------------
*/



/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
*/

router.post(

  "/",

  protect,

  createBooking

);








/*
|--------------------------------------------------------------------------
| CUSTOMER BOOKINGS
|--------------------------------------------------------------------------
*/


router.get(

  "/my-bookings",

  protect,

  getMyBookings

);









/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
*/


router.get(

  "/:id",

  protect,

  getBooking

);









/*
|--------------------------------------------------------------------------
| CANCEL BOOKING
|--------------------------------------------------------------------------
*/


router.put(

  "/cancel/:id",

  protect,

  cancelBooking

);









/*
|--------------------------------------------------------------------------
| ADMIN BOOKING ROUTES
|--------------------------------------------------------------------------
*/


router.get(

  "/admin/all",

  protect,

  roleMiddleware("admin"),

  getAllBookings

);









export default router;