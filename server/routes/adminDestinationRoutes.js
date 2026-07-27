import express from "express";


import upload
from "../middleware/uploadMiddleware.js";


import {

createDestination,

getAdminDestinations,

deleteDestination

}
from "../controllers/adminDestinationController.js";


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

createDestination

);



router.get(

"/",

protect,

adminMiddleware,

getAdminDestinations

);



router.delete(

"/:id",

protect,

adminMiddleware,

deleteDestination

);



export default router;