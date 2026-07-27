import express from "express";


import {

getDashboardStats

}
from "../controllers/adminController.js";


import {

getAllBookings,

updateBookingStatus

}
from "../controllers/adminBookingController.js";


import {
protect
}
from "../middleware/authMiddleware.js";


import {
adminMiddleware
}
from "../middleware/adminMiddleware.js";



const router =
express.Router();



router.get(

"/dashboard",

protect,

adminMiddleware,

getDashboardStats

);



router.get(

"/bookings",

protect,

adminMiddleware,

getAllBookings

);



router.put(

"/bookings/:id",

protect,

adminMiddleware,

updateBookingStatus

);



export default router;