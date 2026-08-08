// server/app.js

import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import apiRoutes from "./routes/index.js";

const app = express();

/*
|--------------------------------------------------------------------------
| Legacy Destination Images
|--------------------------------------------------------------------------
*/

app.use(
  "/destinations",
  express.static("uploads/destinations")
);


/*
|--------------------------------------------------------------------------
| SECURITY MIDDLEWARE
|--------------------------------------------------------------------------
*/

app.use(helmet());

/*
|--------------------------------------------------------------------------
| CORS CONFIGURATION
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",

    credentials: true,
  }),
);

/*
|--------------------------------------------------------------------------
| GENERAL MIDDLEWARE
|--------------------------------------------------------------------------
*/

app.use(compression());

app.use(
  express.json({
    limit: "10mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,

    limit: "10mb",
  }),
);

app.use(cookieParser());

app.use(morgan("dev"));

/*
|--------------------------------------------------------------------------
| API ROUTES
|--------------------------------------------------------------------------
|
| All routes are centralized inside:
|
| server/routes/index.js
|
| Example:
|
| /api/auth
| /api/bookings
| /api/tours
| /api/destinations
| /api/reviews
| /api/gallery
| /api/hero
| etc.
|
*/

app.use("/api", apiRoutes);

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get(
  "/",

  (req, res) => {
    res.status(200).json({
      success: true,

      message: "Travel API running successfully",
    });
  },
);

/*
|--------------------------------------------------------------------------
| 404 HANDLER
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  res.status(404).json({
    success: false,

    message: "Route not found",
  });
});

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,

    message: err.message || "Internal server error",
  });
});

export default app;
