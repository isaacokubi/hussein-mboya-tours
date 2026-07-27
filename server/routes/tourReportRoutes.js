import express from "express";


import {

protect,

authorize

}

from "../middleware/authMiddleware.js";


import {

getTourReports

}

from "../controllers/tourReportController.js";




const router =
express.Router();





router.get(

"/",

protect,

authorize("tour_manager"),

getTourReports

);





export default router;