// server/app.js

import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import env from "./config/env.js";

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

app.set("trust proxy", 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: process.env.NODE_ENV === "production" ? undefined : false,
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
});
app.use(globalLimiter);

/*
|--------------------------------------------------------------------------
| CORS CONFIGURATION
|--------------------------------------------------------------------------
*/

const allowedOrigins = (
  env.CLIENT_ORIGINS ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

console.log("CORS allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("CORS blocked origin:", origin);

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
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
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,

    limit: "1mb",
  }),
);

app.use(cookieParser());

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

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
