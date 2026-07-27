import express from "express";


import {

protect,

authorize

}

from "../middleware/authMiddleware.js";



import {

getVehicles

}

from "../controllers/vehicleController.js";





const router =
express.Router();






router.get(

"/",

protect,

authorize("tour_manager"),

getVehicles

);





export default router;