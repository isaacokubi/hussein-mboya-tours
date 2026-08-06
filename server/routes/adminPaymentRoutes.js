import express from "express";

import {
getPayments,
getPaymentStats,
getPayment,
updatePaymentStatus,
refundPayment
}
from "../controllers/adminPaymentController.js";

import {protect}
from "../middleware/authMiddleware.js";

import {
getPaymentReconciliation
}
from "../controllers/reconciliationController.js";

import {
exportPaymentsCSV,
exportPaymentsPDF
}
from "../controllers/financeExportController.js";


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
"/reconciliation",
getPaymentReconciliation
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


router.patch(
"/:id/refund",
refundPayment
);



export default router;


router.get(
"/export/csv",
exportPaymentsCSV
);


router.get(
"/export/pdf",
exportPaymentsPDF
);

