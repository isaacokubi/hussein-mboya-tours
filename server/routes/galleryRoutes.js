/**
 * Purpose: gallery Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";


// Load ../controllers/galleryController.js so this module can use its exported dependencies.
import {

getFeaturedGallery

}

from "../controllers/galleryController.js";



// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);



// Perform the side effect or state update expressed on the following line.
router.get(

"/featured",

getFeaturedGallery

);



export default router;
