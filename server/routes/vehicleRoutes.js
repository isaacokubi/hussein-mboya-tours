import express from "express";



import {

    createVehicle,

    getVehicles,

    getVehicle,

    updateVehicle,

    deleteVehicle,

    restoreVehicle,

    assignVehicleDriver,

    removeVehicleDriver


} from "../controllers/vehicleController.js";





import {

    protect

} from "../middleware/authMiddleware.js";





import {

    roleMiddleware

} from "../middleware/roleMiddleware.js";





import upload from "../middleware/uploadMiddleware.js";







const router = express.Router();









/*
|--------------------------------------------------------------------------
| VEHICLE MANAGEMENT ROUTES
|--------------------------------------------------------------------------
|
| Roles:
|
| admin        -> Full access
| tour_manager -> Fleet management
| guide        -> View assigned vehicles
|
|--------------------------------------------------------------------------
*/










/*
|--------------------------------------------------------------------------
| CREATE VEHICLE
|--------------------------------------------------------------------------
|
| POST /api/vehicles
|
| Upload:
| image
|
| Cloudinary folder:
| hussein-tours/vehicles
|
|--------------------------------------------------------------------------
*/


router.post(

    "/",

    protect,


    roleMiddleware(

        [

            "admin",

            "tour_manager"

        ]

    ),


    upload.single("image"),


    createVehicle

);









/*
|--------------------------------------------------------------------------
| GET ALL VEHICLES
|--------------------------------------------------------------------------
*/


router.get(

    "/",

    protect,


    roleMiddleware(

        [

            "admin",

            "tour_manager",

            "guide"

        ]

    ),


    getVehicles

);









/*
|--------------------------------------------------------------------------
| GET SINGLE VEHICLE
|--------------------------------------------------------------------------
*/


router.get(

    "/:id",

    protect,


    roleMiddleware(

        [

            "admin",

            "tour_manager",

            "guide"

        ]

    ),


    getVehicle

);









/*
|--------------------------------------------------------------------------
| UPDATE VEHICLE
|--------------------------------------------------------------------------
|
| Allows replacing vehicle image
|
|--------------------------------------------------------------------------
*/


router.put(

    "/:id",

    protect,


    roleMiddleware(

        [

            "admin",

            "tour_manager"

        ]

    ),


    upload.single("image"),


    updateVehicle

);









/*
|--------------------------------------------------------------------------
| DRIVER ASSIGNMENT
|--------------------------------------------------------------------------
*/





// ASSIGN DRIVER TO VEHICLE

router.put(

    "/:id/assign-driver",

    protect,


    roleMiddleware(

        [

            "admin",

            "tour_manager"

        ]

    ),


    assignVehicleDriver

);








// REMOVE DRIVER FROM VEHICLE

router.put(

    "/:id/remove-driver",

    protect,


    roleMiddleware(

        [

            "admin",

            "tour_manager"

        ]

    ),


    removeVehicleDriver

);









/*
|--------------------------------------------------------------------------
| DELETE VEHICLE
|--------------------------------------------------------------------------
|
| Soft delete
|
|--------------------------------------------------------------------------
*/


router.delete(

    "/:id",

    protect,


    roleMiddleware(

        [

            "admin"

        ]

    ),


    deleteVehicle

);









/*
|--------------------------------------------------------------------------
| RESTORE VEHICLE
|--------------------------------------------------------------------------
*/


router.patch(

    "/:id/restore",

    protect,


    roleMiddleware(

        [

            "admin"

        ]

    ),


    restoreVehicle

);









export default router;