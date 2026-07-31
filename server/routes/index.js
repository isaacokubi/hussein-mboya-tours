import express from "express";


import authRoutes from "./authRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import tourRoutes from "./tourRoutes.js";
import destinationRoutes from "./destinationRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";
import galleryRoutes from "./galleryRoutes.js";
import heroRoutes from "./heroRoutes.js";


import adminRoutes from "./adminRoutes.js";
import adminTourRoutes from "./adminTourRoutes.js";
import adminBookingRoutes from "./adminBookingRoutes.js";


const router = express.Router();




/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/


router.use(
    "/auth",
    authRoutes
);


router.use(
    "/bookings",
    bookingRoutes
);


router.use(
    "/tours",
    tourRoutes
);


router.use(
    "/destinations",
    destinationRoutes
);


router.use(
    "/reviews",
    reviewRoutes
);


router.use(
    "/wishlist",
    wishlistRoutes
);


router.use(
    "/gallery",
    galleryRoutes
);


router.use(
    "/hero",
    heroRoutes
);






/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/


router.use(
    "/admin",
    adminRoutes
);


router.use(
    "/admin/tours",
    adminTourRoutes
);


router.use(
    "/admin/bookings",
    adminBookingRoutes
);




export default router;