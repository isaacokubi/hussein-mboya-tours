import express from "express";


import {

getFeaturedGallery

}

from "../controllers/galleryController.js";



const router = express.Router();



router.get(

"/featured",

getFeaturedGallery

);



export default router;