import express from "express";


// Controllers

import {
    getUserProfile,
    getGuides
}
from "../controllers/userController.js";




// Middleware

import {
    protect,
    authorize
}
from "../middleware/authMiddleware.js";





const router = express.Router();







/*
|--------------------------------------------------------------------------
| USER PROFILE
|--------------------------------------------------------------------------
*/


router.get(

    "/profile",

    protect,

    getUserProfile

);










/*
|--------------------------------------------------------------------------
| TOUR MANAGER - GET GUIDES
|--------------------------------------------------------------------------
*/


router.get(

    "/guides",

    protect,

    authorize("tour_manager"),

    getGuides

);








export default router;