import express from "express";

import {

getWishlist,

addWishlist,

removeWishlist

}
from "../controllers/wishlistController.js";


import {
protect
}
from "../middleware/authMiddleware.js";



const router =
express.Router();




/*
|--------------------------------------------------------------------------
| GET USER WISHLIST
|--------------------------------------------------------------------------
*/

router.get(

"/",

protect,

getWishlist

);





/*
|--------------------------------------------------------------------------
| ADD TOUR
|--------------------------------------------------------------------------
*/

router.post(

"/",

protect,

addWishlist

);





/*
|--------------------------------------------------------------------------
| REMOVE TOUR
|--------------------------------------------------------------------------
*/

router.delete(

"/:tourId",

protect,

removeWishlist

);





export default router;