import express from "express";


import protect
from "../middleware/authMiddleware.js";


import {

createBooking,

getAgentBookings,

updateBookingStatus

}

from "../controllers/agentBookingController.js";



const router =
express.Router();



router.use(protect);



router.post(
"/",
createBooking
);



router.get(
"/",
getAgentBookings
);



router.patch(
"/:id/status",
updateBookingStatus
);



export default router;