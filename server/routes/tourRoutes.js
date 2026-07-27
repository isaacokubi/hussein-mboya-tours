import express from "express";



import {

    createTour,
    getTours,
    getTourById,
    getManagerTours,
    updateTour,
    deleteTour,
    assignGuide,
    assignVehicle,
    removeVehicle,
    getReports

} from "../controllers/tourController.js";



import {

    getTourAvailability,
    updateTourAvailability

} from "../controllers/tourAvailabilityController.js";



import {

    protect

} from "../middleware/authMiddleware.js";



import {

    tourManagerOnly

} from "../middleware/tourManagerMiddleware.js";





const router = express.Router();









/*
|--------------------------------------------------------------------------
| GET ALL TOURS
|--------------------------------------------------------------------------
*/


router.get(

    "/",

    protect,

    getTours

);









/*
|--------------------------------------------------------------------------
| GET TOURS CREATED BY TOUR MANAGER
|--------------------------------------------------------------------------
*/


router.get(

    "/manager",

    protect,

    tourManagerOnly,

    getManagerTours

);









/*
|--------------------------------------------------------------------------
| TOUR REPORTS
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| This MUST come before:
|
| router.get("/:id")
|
| Otherwise Express treats:
|
| /reports
|
| as:
|
| id = reports
|
|--------------------------------------------------------------------------
*/


router.get(

    "/reports",

    protect,

    tourManagerOnly,

    getReports

);









/*
|--------------------------------------------------------------------------
| GET SINGLE TOUR
|--------------------------------------------------------------------------
*/


router.get(

    "/:id",

    protect,

    getTourById

);









/*
|--------------------------------------------------------------------------
| CREATE TOUR
|--------------------------------------------------------------------------
*/


router.post(

    "/",

    protect,

    tourManagerOnly,

    createTour

);









/*
|--------------------------------------------------------------------------
| UPDATE TOUR
|--------------------------------------------------------------------------
*/


router.put(

    "/:id",

    protect,

    tourManagerOnly,

    updateTour

);









/*
|--------------------------------------------------------------------------
| DELETE TOUR
|--------------------------------------------------------------------------
*/


router.delete(

    "/:id",

    protect,

    tourManagerOnly,

    deleteTour

);









/*
|--------------------------------------------------------------------------
| TOUR AVAILABILITY
|--------------------------------------------------------------------------
*/


router.get(

    "/:id/availability",

    protect,

    tourManagerOnly,

    getTourAvailability

);








router.patch(

    "/:id/availability",

    protect,

    tourManagerOnly,

    updateTourAvailability

);









/*
|--------------------------------------------------------------------------
| ASSIGN GUIDE
|--------------------------------------------------------------------------
*/


router.patch(

    "/:id/guide",

    protect,

    tourManagerOnly,

    assignGuide

);









/*
|--------------------------------------------------------------------------
| ASSIGN VEHICLE
|--------------------------------------------------------------------------
*/


router.patch(

    "/:id/vehicle",

    protect,

    tourManagerOnly,

    assignVehicle

);









/*
|--------------------------------------------------------------------------
| REMOVE VEHICLE
|--------------------------------------------------------------------------
*/


router.patch(

    "/:id/remove-vehicle",

    protect,

    tourManagerOnly,

    removeVehicle

);









export default router;