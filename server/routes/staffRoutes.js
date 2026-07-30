import express from "express";

import {

createStaff,
getStaff,
getStaffById,
updateStaff,
deleteStaff,
getDrivers

} from "../controllers/staffController.js";


import protect from "../middleware/authMiddleware.js";

import roleMiddleware from "../middleware/roleMiddleware.js";



const router = express.Router();





/*
|--------------------------------------------------------------------------
| STAFF MANAGEMENT ROUTES
|--------------------------------------------------------------------------
*/


// CREATE STAFF
// Admin only
router.post(

"/",

protect,

roleMiddleware(
[
"admin"
]
),

createStaff

);






// GET ALL STAFF
// Admin and Tour Manager

router.get(

"/",

protect,

roleMiddleware(
[
"admin",
"tour_manager"
]
),

getStaff

);






// GET SINGLE STAFF MEMBER

router.get(

"/:id",

protect,

roleMiddleware(
[
"admin",
"tour_manager"
]
),

getStaffById

);






// UPDATE STAFF

router.put(

"/:id",

protect,

roleMiddleware(
[
"admin"
]
),

updateStaff

);







// DELETE STAFF

router.delete(

"/:id",

protect,

roleMiddleware(
[
"admin"
]
),

deleteStaff

);







/*
|--------------------------------------------------------------------------
| DRIVER MANAGEMENT
|--------------------------------------------------------------------------
|
| Used when assigning vehicles/tours
|
| Example:
| GET /api/staff/drivers
|
*/


router.get(

"/drivers",

protect,

roleMiddleware(
[
"admin",
"tour_manager"
]
),

getDrivers

);






export default router;