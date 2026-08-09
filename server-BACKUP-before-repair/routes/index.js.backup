import express from "express";
import commissionRoutes from "./commissionRoutes.js";
import tourManagerRoutes from "./tourManagerRoutes.js";
import staffRoutes from "./staffRoutes.js";
import userRoutes from "./userRoutes.js";
import vehicleRoutes from "./vehicleRoutes.js";

import authRoutes from "./authRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import tourRoutes from "./tourRoutes.js";
import destinationRoutes from "./destinationRoutes.js";
import adminDestinationRoutes from "./adminDestinationRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";
import galleryRoutes from "./galleryRoutes.js";
import heroRoutes from "./heroRoutes.js";

import mpesaRoutes from "./mpesaRoutes.js";

import adminRoutes from "./adminRoutes.js";
import adminTourRoutes from "./adminTourRoutes.js";
import adminBookingRoutes from "./adminBookingRoutes.js";
import adminPaymentRoutes from "./adminPaymentRoutes.js";
import adminRoleRoutes from "./adminRoleRoutes.js";
import systemHealthRoutes from "./systemHealthRoutes.js";

import categoryRoutes from "./categoryRoutes.js";
import adminDashboardRoutes from "./adminDashboardRoutes.js";


const router = express.Router();



/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/


router.use(
  "/categories",
  categoryRoutes
);


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
  "/admin/destinations",
  adminDestinationRoutes
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
| MPESA ROUTES
|--------------------------------------------------------------------------
*/

router.use(
  "/mpesa",
  mpesaRoutes
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


router.use(
  "/admin/payments",
  adminPaymentRoutes
);


router.use(
  "/admin/roles",
  adminRoleRoutes
);


router.use(
  "/admin/system-health",
  systemHealthRoutes
);


router.use(
  "/admin/dashboard",
  adminDashboardRoutes
);



router.use(
"/tourmanager",
tourManagerRoutes
);

router.use(
"/commissions",
commissionRoutes
);

export default router;

router.use("/vehicles", vehicleRoutes);

router.use("/users", userRoutes);


// Staff Management
router.use("/staff", staffRoutes);
