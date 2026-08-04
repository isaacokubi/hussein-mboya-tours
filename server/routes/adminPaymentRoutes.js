import express from "express";

import {
getPayments,
getPaymentStats,
getPayment,
updatePaymentStatus
}
from "../controllers/adminPaymentController.js";

import {protect}
from "../middleware/authMiddleware.js";

import adminMiddleware
from "../middleware/adminMiddleware.js";


const router=express.Router();


router.use(protect);

router.use(adminMiddleware);



router.get(
"/",
getPayments
);


router.get(
"/stats",
getPaymentStats
);


router.get(
"/:id",
getPayment
);


router.patch(
"/:id/status",
updatePaymentStatus
);



export default router;
