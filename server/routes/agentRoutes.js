import express from "express";


import {
    getAgentDashboard
}
from "../controllers/agentController.js";


import {
    createAgentTour
}
from "../controllers/agentTourController.js";


import upload from "../middleware/uploadMiddleware.js";


import {
    protect
}
from "../middleware/authMiddleware.js";


import {
    agentMiddleware
}
from "../middleware/agentMiddleware.js";


import {
    authorize
}
from "../middleware/permissionMiddleware.js";



const router = express.Router();





/*
|--------------------------------------------------------------------------
| AGENT DASHBOARD
|--------------------------------------------------------------------------
|
| GET /api/agent/dashboard
|
| Flow:
|
| Login
|   |
|   ↓
| JWT Check
|   |
|   ↓
| Agent Check
|   |
|   ↓
| Permission Check
|   |
|   ↓
| Dashboard Data
|
*/


router.get(

"/dashboard",

protect,

agentMiddleware,

authorize(
"view_agent_dashboard"
),

getAgentDashboard

);







/*
|--------------------------------------------------------------------------
| CREATE AGENT TOUR
|--------------------------------------------------------------------------
|
| POST /api/agent/tours
|
| Agent can create tours.
|
*/


router.post(

"/tours",

protect,

agentMiddleware,

authorize(
"create_agent_tour"
),

upload.array(
"images",
10
),

createAgentTour

);







export default router;