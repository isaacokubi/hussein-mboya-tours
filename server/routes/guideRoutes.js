// server/routes/guideRoutes.js


import express from "express";



import {

guideDashboard,

getAssignedTours,

getTourDetails,

getTourGuests,

updateTourStatus,

submitTourReport

}

from "../controllers/guideController.js";





import {

protect

}

from "../middleware/authMiddleware.js";





import {

authorize

}

from "../middleware/permissionMiddleware.js";







const router = express.Router();









/*
|--------------------------------------------------------------------------
| TOUR GUIDE ROUTES
|--------------------------------------------------------------------------
|
| Guide Portal API
|
| Permissions:
|
| view_assigned_tours
| view_tour_guests
| update_tour_status
| submit_tour_report
|
|--------------------------------------------------------------------------
*/







/*
|--------------------------------------------------------------------------
| GUIDE DASHBOARD
|--------------------------------------------------------------------------
|
| GET /api/guide/dashboard
|
|--------------------------------------------------------------------------
*/


router.get(

"/dashboard",

protect,

authorize(

"view_assigned_tours"

),

guideDashboard

);









/*
|--------------------------------------------------------------------------
| GET ASSIGNED TOURS
|--------------------------------------------------------------------------
|
| GET /api/guide/assigned-tours
|
|--------------------------------------------------------------------------
*/


router.get(

"/assigned-tours",

protect,

authorize(

"view_assigned_tours"

),

getAssignedTours

);









/*
|--------------------------------------------------------------------------
| GET SINGLE TOUR DETAILS
|--------------------------------------------------------------------------
|
| GET /api/guide/tours/:id
|
|--------------------------------------------------------------------------
*/


router.get(

"/tours/:id",

protect,

authorize(

"view_assigned_tours"

),

getTourDetails

);









/*
|--------------------------------------------------------------------------
| GET TOUR GUESTS
|--------------------------------------------------------------------------
|
| GET /api/guide/tours/:id/guests
|
|--------------------------------------------------------------------------
*/


router.get(

"/tours/:id/guests",

protect,

authorize(

"view_tour_guests"

),

getTourGuests

);









/*
|--------------------------------------------------------------------------
| UPDATE TOUR STATUS
|--------------------------------------------------------------------------
|
| PUT /api/guide/tours/:id/status
|
| Body:
|
| {
|   "status":"ongoing"
| }
|
|--------------------------------------------------------------------------
*/


router.put(

"/tours/:id/status",

protect,

authorize(

"update_tour_status"

),

updateTourStatus

);









/*
|--------------------------------------------------------------------------
| SUBMIT TOUR REPORT
|--------------------------------------------------------------------------
|
| POST /api/guide/tours/:id/report
|
|--------------------------------------------------------------------------
*/


router.post(

"/tours/:id/report",

protect,

authorize(

"submit_tour_report"

),

submitTourReport

);









export default router;