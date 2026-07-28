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
| CUSTOMER ROUTES
|--------------------------------------------------------------------------
*/



/*
|--------------------------------------------------------------------------
| CREATE BOOKING
|--------------------------------------------------------------------------
|
| POST /api/bookings
|
*/

router.post(

    "/",

    protect,

    createBooking

);









/*
|--------------------------------------------------------------------------
| GET LOGGED USER BOOKINGS
|--------------------------------------------------------------------------
|
| GET /api/bookings/my-bookings
|
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
|
| GET /api/bookings/:id
|
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
|
| PUT /api/bookings/cancel/:id
|
*/

router.put(

    "/cancel/:id",

    protect,

    cancelBooking

);









/*
|--------------------------------------------------------------------------
| ADMIN / MANAGER ROUTES
|--------------------------------------------------------------------------
|
| GET /api/bookings/admin/all
|
*/


router.get(

    "/admin/all",

    protect,

    roleMiddleware(

        "admin"

    ),

    getAllBookings

);








export default router;