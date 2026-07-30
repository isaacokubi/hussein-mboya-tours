import express from "express";


import {

createReview,

getTourReviews,

voteHelpful

}

from "../controllers/reviewController.js";


import {
protect
}
from "../middleware/authMiddleware.js";


const router =
express.Router();



router.post(
"/",
protect,
createReview
);



router.get(
"/tour/:id",
getTourReviews
);



router.put(
"/:id/helpful",
voteHelpful
);



export default router;