import express from "express";


import {
  getAssignedTours,
  getTourDetails,
  getTourGuests,
  updateTourStatus,
  submitTourReport
} from "../controllers/guideController.js";


import {
  protect
} from "../middleware/authMiddleware.js";


import {
  authorize
} from "../middleware/permissionMiddleware.js";



const router = express.Router();





/*
|--------------------------------------------------------------------------
| TOUR GUIDE ROUTES
|--------------------------------------------------------------------------
*/





// Get assigned tours

router.get(

  "/assigned-tours",

  protect,

  authorize(
    "view_assigned_tours"
  ),

  getAssignedTours

);






// Get single tour details

router.get(

  "/tours/:id",

  protect,

  authorize(
    "view_assigned_tours"
  ),

  getTourDetails

);







// View guests for a tour

router.get(

  "/tours/:id/guests",

  protect,

  authorize(
    "view_tour_guests"
  ),

  getTourGuests

);







// Update tour status

router.put(

  "/tours/:id/status",

  protect,

  authorize(
    "update_tour_status"
  ),

  updateTourStatus

);







// Submit tour report

router.post(

  "/tours/:id/report",

  protect,

  authorize(
    "submit_tour_report"
  ),

  submitTourReport

);





export default router;