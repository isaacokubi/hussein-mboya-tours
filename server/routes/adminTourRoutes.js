import express from "express";


import upload
from "../middleware/uploadMiddleware.js";


import {

createTour,

getAdminTours,

updateTour,

deleteTour

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



const router =
express.Router();



router.post(

"/",

protect,

adminMiddleware,

upload.array(
"images",
10
),

createTour

);



router.get(

"/",

protect,

adminMiddleware,

getAdminTours

);



router.put(

"/:id",

protect,

adminMiddleware,

upload.array(
"images",
10
),

updateTour

);



router.delete(

"/:id",

protect,

adminMiddleware,

deleteTour

);



export default router;