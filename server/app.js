// server/app.js

import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";

import apiRoutes from "./routes/index.js";

const app = express();

/*
|--------------------------------------------------------------------------
| Legacy Destination Images
|--------------------------------------------------------------------------
*/

app.use("/api/security", securityRoutes);

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

const allowedOrigins = (
  process.env.CLIENT_ORIGINS ||
  process.env.CLIENT_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
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
  "/api/health",
  async (req, res) => {
    const dbReady = mongoose.connection.readyState === 1;

    res.status(dbReady ? 200 : 503).json({
      success: dbReady,
      status: dbReady ? "healthy" : "degraded",
      database: dbReady ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  },
);

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

  let status = Number(err.statusCode) || 500;
  let message = err.message || "Internal server error";

  if (err.name === "ValidationError" || err.name === "CastError") {
    status = 400;
  }

  if (err.code === 11000) {
    status = 409;
    const duplicateField = Object.keys(err.keyPattern || err.keyValue || {})[0];
    message = duplicateField
      ? `A record with this ${duplicateField} already exists.`
      : "A record with these unique details already exists.";
  }

  res.status(status).json({
    success: false,
    message,
    ...(err.name === "ValidationError" ? {
      errors: Object.fromEntries(
        Object.entries(err.errors || {}).map(([key, value]) => [key, value.message])
      )
    } : {}),
  });
});

export default app;
