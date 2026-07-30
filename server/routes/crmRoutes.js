import express from "express";


import {
getCRMStats
}
from "../controllers/crmController.js";


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

"/stats",

protect,

adminMiddleware,

getCRMStats

);



export default router;