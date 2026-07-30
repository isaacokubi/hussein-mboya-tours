import express from "express";

import protect from "../middleware/authMiddleware.js";


import {

createQuotation,

getAgentQuotations,

updateQuotationStatus

}

from "../controllers/quotationController.js";


const router =
express.Router();



router.use(protect);



router.post(
"/",
createQuotation
);



router.get(
"/",
getAgentQuotations
);



router.patch(
"/:id/status",
updateQuotationStatus
);



export default router;