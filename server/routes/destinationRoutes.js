// server/routes/destinationRoutes.js

import express from "express";


import {

  getDestinations,

  getDestination,

  getFeaturedDestinations

}

from "../controllers/destinationController.js";



const router = express.Router();




/*
|--------------------------------------------------------------------------
| PUBLIC DESTINATIONS
|--------------------------------------------------------------------------
*/





/**
 * GET /api/destinations/featured
 *
 * Get featured destinations
 */

router.get(

  "/featured",

  getFeaturedDestinations

);






/**
 * GET /api/destinations
 *
 * Get all active destinations
 */

router.get(

  "/",

  getDestinations

);






/**
 * GET /api/destinations/:slug
 *
 * Get single destination by slug
 */

router.get(

  "/:slug",

  getDestination

);






export default router;