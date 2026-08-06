import express from "express";

import {
getCommissions,
getAgentCommissions
} from "../controllers/commissionController.js";


import {
protect
} from "../middleware/authMiddleware.js";


const router = express.Router();



router.use(protect);



router.get(
"/",
getCommissions
);



router.get(
"/agent/:agentId",
getAgentCommissions
);



export default router;
