import express from "express";


import {

getDestinations,

getDestination

}
from "../controllers/destinationController.js";


const router =
express.Router();



router.get(
"/",
getDestinations
);



router.get(
"/:slug",
getDestination
);



export default router;