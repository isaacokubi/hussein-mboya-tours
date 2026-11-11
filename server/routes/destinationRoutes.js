/**
 * Purpose: destination Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/routes/destinationRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";


// Load ../controllers/destinationController.js so this module can use its exported dependencies.
import {

  getDestinations,

  getDestination,

  getFeaturedDestinations

}

from "../controllers/destinationController.js";



// Declare router for use by the surrounding module or function.
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

// Perform the side effect or state update expressed on the following line.
router.get(

  "/featured",

  getFeaturedDestinations

);






/**
 * GET /api/destinations
 *
 * Get all active destinations
 */

// Perform the side effect or state update expressed on the following line.
router.get(

  "/",

  getDestinations

);






/**
 * GET /api/destinations/:slug
 *
 * Get single destination by slug
 */

// Perform the side effect or state update expressed on the following line.
router.get(

  "/:slug",

  getDestination

);

// Perform the side effect or state update expressed on the following line.
router.get(

  "/slug/:slug",

  getDestination

);






export default router;
