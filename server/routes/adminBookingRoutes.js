import express from "express";



import {

getBookings,

getBooking,

updateBookingStatus,

assignResources,

updatePaymentStatus

}

from "../controllers/bookingAdminController.js";





import {

protect

}

from "../middleware/authMiddleware.js";





import {

adminMiddleware

}

from "../middleware/adminMiddleware.js";





const router = express.Router();







/*
|--------------------------------------------------------------------------
| ADMIN SECURITY
|--------------------------------------------------------------------------
*/


router.use(

protect

);



router.use(

adminMiddleware

);









/*
|--------------------------------------------------------------------------
| GET ALL BOOKINGS
|--------------------------------------------------------------------------
*/


router.get(

"/",

getBookings

);









/*
|--------------------------------------------------------------------------
| GET SINGLE BOOKING
|--------------------------------------------------------------------------
*/


router.get(

"/:id",

getBooking

);









/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS
|--------------------------------------------------------------------------
|
| Examples:
| pending
| confirmed
| assigned
| ongoing
| completed
| cancelled
|
*/


router.put(

"/:id/status",

updateBookingStatus

);









/*
|--------------------------------------------------------------------------
| ASSIGN GUIDE / DRIVER / VEHICLE
|--------------------------------------------------------------------------
*/


router.put(

"/:id/assign",

assignResources

);









/*
|--------------------------------------------------------------------------
| UPDATE PAYMENT STATUS
|--------------------------------------------------------------------------
*/


router.put(

"/:id/payment",

updatePaymentStatus

);







export default router;