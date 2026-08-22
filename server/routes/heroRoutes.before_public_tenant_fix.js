import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";


import {
getHeroSlides
}
from "../controllers/heroController.js";


const router = express.Router();

router.use(resolveTenant);



router.get(

"/",

getHeroSlides

);



export default router;