import express from "express";


import {

assignTourResources

}
from "../controllers/tourAssignmentController.js";



import {

protect

}
from "../middleware/authMiddleware.js";


import {

roleMiddleware

}
from "../middleware/roleMiddleware.js";



const router =
express.Router();




router.put(

"/:id/assign",

protect,

roleMiddleware(

[
"admin",
"tour_manager"

]

),

assignTourResources

);



export default router;