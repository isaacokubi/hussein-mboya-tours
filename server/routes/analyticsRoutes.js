import express from "express";


import {

dashboardAnalytics

}

from "../controllers/analyticsController.js";


import {

protect

}

from "../middleware/authMiddleware.js";


import {

adminMiddleware

}

from "../middleware/adminMiddleware.js";



const router =
express.Router();



router.get(

"/dashboard",

protect,

adminMiddleware,

dashboardAnalytics

);



export default router;