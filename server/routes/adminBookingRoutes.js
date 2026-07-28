import express from "express";


import {

getBookings,
updateBooking

}
from "../controllers/adminBookingController.js";


import authMiddleware 
from "../middleware/authMiddleware.js";


import adminMiddleware 
from "../middleware/adminMiddleware.js";



const router =
express.Router();



router.use(
authMiddleware,
adminMiddleware
);



router.get(
"/",
getBookings
);



router.put(
"/:id",
updateBooking
);



export default router;