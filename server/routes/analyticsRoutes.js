import express from "express";


import {

    getAnalytics,
    dashboardAnalytics

}

from "../controllers/analyticsController.js";



import {

    protect

}

from "../middleware/authMiddleware.js";



import {

    roleMiddleware

}

from "../middleware/roleMiddleware.js";



import {

    adminMiddleware

}

from "../middleware/adminMiddleware.js";




const router = express.Router();





// ============================================================
// FULL ADMIN ANALYTICS
// ============================================================

router.get(

"/",

protect,

roleMiddleware(

[
"admin"
]

),

getAnalytics

);







// ============================================================
// ADMIN DASHBOARD ANALYTICS
// ============================================================

router.get(

"/dashboard",

protect,

adminMiddleware,

dashboardAnalytics

);







export default router;