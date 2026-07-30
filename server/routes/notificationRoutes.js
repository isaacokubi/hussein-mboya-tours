// routes/notificationRoutes.js


import express from "express";


import {

getNotifications,

getMyNotifications,

markRead

}
from "../controllers/notificationController.js";


import {
protect
}
from "../middleware/authMiddleware.js";



const router =
express.Router();





// ============================================================
// GET ALL USER NOTIFICATIONS
// ============================================================


router.get(
"/",
protect,
getNotifications
);





// ============================================================
// GET MY NOTIFICATIONS
// ============================================================


router.get(
"/mine",
protect,
getMyNotifications
);





// ============================================================
// MARK NOTIFICATION AS READ
// ============================================================


router.put(
"/:id/read",
protect,
markRead
);





export default router;