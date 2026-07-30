import express from "express";

import {
  getDestinations,
  getDestination,
} from "../controllers/destinationController.js";


const router = express.Router();


/*
|--------------------------------------------------------------------------
| PUBLIC DESTINATIONS
|--------------------------------------------------------------------------
*/


// Get all active destinations
router.get(
  "/",
  getDestinations
);


// Get single destination by slug
router.get(
  "/:slug",
  getDestination
);


export default router;