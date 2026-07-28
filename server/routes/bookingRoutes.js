// server/routes/bookingRoutes.js


import express from "express";



import {

    createBooking,

    getMyBookings,

    getBooking,

    cancelBooking,

    getAllBookings,

    getConfirmedBookings,

    updateBookingStatus


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
*/

router.get(

    "/test",

    (req,res)=>{


        res.status(200).json({

            success:true,

            message:
            "Booking routes are loaded"

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
| TOUR MANAGER + ADMIN
|--------------------------------------------------------------------------
|
| GET /api/bookings/confirmed
|
| Returns:
| - Paid bookings
| - Confirmed tours
|
*/

router.get(

    "/confirmed",

    protect,

    roleMiddleware(

        [

            "admin",

            "tour_manager"

        ]

    ),

    getConfirmedBookings

);









/*
|--------------------------------------------------------------------------
| ADMIN BOOKING MANAGEMENT
|--------------------------------------------------------------------------
|
| GET /api/bookings/admin
|
| Admin + Tour Manager view all bookings
|
|--------------------------------------------------------------------------
*/


router.get(

    "/admin",

    protect,

    roleMiddleware(

        [

            "admin",

            "tour_manager"

        ]

    ),

    getAllBookings

);








/*
|--------------------------------------------------------------------------
| UPDATE BOOKING STATUS
|--------------------------------------------------------------------------
|
| PUT /api/bookings/:id/status
|
| Admin updates:
| - booking status
| - payment status
| - assignment status
|
|--------------------------------------------------------------------------
*/


router.put(

    "/:id/status",

    protect,

    roleMiddleware(

        [

            "admin"

        ]

    ),

    updateBookingStatus

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
| CUSTOMER CANCEL BOOKING
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
| LEGACY ADMIN ROUTE
|--------------------------------------------------------------------------
|
| GET /api/bookings/admin/all
|
| Kept for compatibility
|
|--------------------------------------------------------------------------
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