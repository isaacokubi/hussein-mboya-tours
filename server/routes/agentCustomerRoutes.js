import express from "express";

import protect from "../middleware/authMiddleware.js";


import {

createCustomer,

getCustomers,

getCustomer,

updateCustomer,

deleteCustomer

}

from "../controllers/agentCustomerController.js";


const router =
express.Router();



router.use(protect);



router.post(
"/",
createCustomer
);



router.get(
"/",
getCustomers
);



router.get(
"/:id",
getCustomer
);



router.put(
"/:id",
updateCustomer
);



router.delete(
"/:id",
deleteCustomer
);



export default router;