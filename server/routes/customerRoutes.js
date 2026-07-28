import express from "express";


import {

getCustomers,

getCustomerProfile

}

from "../controllers/customerController.js";


import {

protect

}

from "../middleware/authMiddleware.js";


import {

roleMiddleware

}

from "../middleware/roleMiddleware.js";



const router =
express.Router();





router.get(

"/",

protect,

roleMiddleware(

[
"admin"
]

),

getCustomers

);





router.get(

"/:id",

protect,

roleMiddleware(

[
"admin"
]

),

getCustomerProfile

);




export default router;