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
| ROUTE TEST
|--------------------------------------------------------------------------
|
| GET /api/bookings/test
|
| Purpose:
| Confirm booking routes are mounted correctly.
|
*/

router.get(

    "/test",

    (req, res) => {

        res.status(200).json({

            success: true,

            message: "Booking routes are loaded"

        });

    }

);








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
| Protected:
| Customer must be logged in
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
| Returns bookings belonging to logged-in customer
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
| Get booking details by ID
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
| Customer cancels own booking
|
*/

router.put(

    "/cancel/:id",

    protect,

    cancelBooking

);










/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
|
| Admin can view all bookings
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