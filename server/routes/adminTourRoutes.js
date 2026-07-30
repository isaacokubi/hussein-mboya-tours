import express from "express";


import upload from "../middleware/uploadMiddleware.js";



import {

createTour,

getAllTours,

getTour,

updateTour,

deleteTour,

assignGuide,

assignDriver,

assignVehicle,

restoreTour

}
from "../controllers/adminTourController.js";



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
| CREATE TOUR
|--------------------------------------------------------------------------
*/


router.post(

"/",

upload.array(
"images",
10
),

createTour

);









/*
|--------------------------------------------------------------------------
| GET ALL TOURS
|--------------------------------------------------------------------------
*/


router.get(

"/",

getAllTours

);









/*
|--------------------------------------------------------------------------
| GET SINGLE TOUR
|--------------------------------------------------------------------------
*/


router.get(

"/:id",

getTour

);









/*
|--------------------------------------------------------------------------
| UPDATE TOUR
|--------------------------------------------------------------------------
*/


router.put(

"/:id",

upload.array(
"images",
10
),

updateTour

);









/*
|--------------------------------------------------------------------------
| DELETE TOUR (SOFT DELETE)
|--------------------------------------------------------------------------
*/


router.delete(

"/:id",

deleteTour

);









/*
|--------------------------------------------------------------------------
| RESTORE TOUR
|--------------------------------------------------------------------------
*/


router.patch(

"/:id/restore",

restoreTour

);









/*
|--------------------------------------------------------------------------
| ASSIGN GUIDE
|--------------------------------------------------------------------------
*/


router.patch(

"/:id/guide",

assignGuide

);









/*
|--------------------------------------------------------------------------
| ASSIGN DRIVER
|--------------------------------------------------------------------------
*/


router.patch(

"/:id/driver",

assignDriver

);









/*
|--------------------------------------------------------------------------
| ASSIGN VEHICLE
|--------------------------------------------------------------------------
*/


router.patch(

"/:id/vehicle",

assignVehicle

);







export default router;