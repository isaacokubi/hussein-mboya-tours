/**
 * Purpose: sitemap server application module. Main declarations: generateSitemap.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// scripts/generateSitemap.js

// Load dotenv so this module can use its exported dependencies.
import dotenv from "dotenv";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load fs so this module can use its exported dependencies.
import fs from "fs";
// Load path so this module can use its exported dependencies.
import path from "path";

// Load sitemap so this module can use its exported dependencies.
import { SitemapStream, streamToPromise } from "sitemap";

// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Declare generateSitemap for use by the surrounding module or function.
const generateSitemap = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    // Declare hostname for use by the surrounding module or function.
    const hostname =
      process.env.CLIENT_URL ||
      (process.env.PLATFORM_HOST ? `https://${String(process.env.PLATFORM_HOST).replace(/^https?:\/\//, "").replace(/\/$/, "")}` : "https://hussein-mboya-tours.vercel.app");

    // Declare sitemap for use by the surrounding module or function.
    const sitemap = new SitemapStream({
      hostname,
    });

    /*
    |--------------------------------------------------------------------------
    | STATIC PAGES
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    sitemap.write({
      url: "/",
      changefreq: "daily",
      priority: 1.0,
    });

    // Perform the side effect or state update expressed on the following line.
    sitemap.write({
      url: "/tours",
      changefreq: "daily",
      priority: 0.9,
    });

    // Perform the side effect or state update expressed on the following line.
    sitemap.write({
      url: "/destinations",
      changefreq: "weekly",
      priority: 0.9,
    });

    // Perform the side effect or state update expressed on the following line.
    sitemap.write({
      url: "/about",
      changefreq: "monthly",
      priority: 0.6,
    });

    // Perform the side effect or state update expressed on the following line.
    sitemap.write({
      url: "/contact",
      changefreq: "monthly",
      priority: 0.5,
    });

    /*
    |--------------------------------------------------------------------------
    | TOURS
    |--------------------------------------------------------------------------
    */

    // Declare tours for use by the surrounding module or function.
    const tours = await Tour.find({
      status: "active",
    });

    // Repeat the enclosed work for each required iteration.
    for (const tour of tours) {
      // Perform the side effect or state update expressed on the following line.
      sitemap.write({
        url: `/tours/${tour.slug}`,
        lastmod: tour.updatedAt,
        changefreq: "weekly",
        priority: 0.8,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | DESTINATIONS
    |--------------------------------------------------------------------------
    */

    // Declare destinations for use by the surrounding module or function.
    const destinations = await Destination.find();

    // Repeat the enclosed work for each required iteration.
    for (const destination of destinations) {
      // Perform the side effect or state update expressed on the following line.
      sitemap.write({
        url: `/destinations/${destination.slug}`,
        lastmod: destination.updatedAt,
        changefreq: "weekly",
        priority: 0.7,
      });
    }

    // Perform the side effect or state update expressed on the following line.
    sitemap.end();

    // Declare xml for use by the surrounding module or function.
    const xml = await streamToPromise(sitemap);

    // Declare outputDir for use by the surrounding module or function.
    const outputDir = path.join(process.cwd(), "public");

    // Check the condition (!fs.existsSync(outputDir)) and run the matching branch.
    if (!fs.existsSync(outputDir)) {
      // Perform the side effect or state update expressed on the following line.
      fs.mkdirSync(outputDir, {
        recursive: true,
      });
    }

    // Perform the side effect or state update expressed on the following line.
    fs.writeFileSync(
      path.join(outputDir, "sitemap.xml"),
      xml.toString()
    );

    // debug removed

    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close();

    // Perform the side effect or state update expressed on the following line.
    process.exit(0);
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error(
      "❌ Sitemap generation failed:",
      error.message
    );

    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});

    // Perform the side effect or state update expressed on the following line.
    process.exit(1);
  }
};

// Perform the side effect or state update expressed on the following line.
generateSitemap();
