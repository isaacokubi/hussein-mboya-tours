import express from "express";


import protect from "../middleware/authMiddleware.js";


import {

getAgentPackages,

getPackageDetails

}

from "../controllers/agentPackageController.js";



const router =
express.Router();



router.use(protect);



router.get(
"/",
getAgentPackages
);



router.get(
"/:id",
getPackageDetails
);



export default router;