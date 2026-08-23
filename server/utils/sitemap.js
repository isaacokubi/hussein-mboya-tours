// scripts/generateSitemap.js

import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import { SitemapStream, streamToPromise } from "sitemap";

import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";

dotenv.config();

const generateSitemap = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    const hostname =
      process.env.CLIENT_URL ||
      "https://husseinmboyatours.com";

    const sitemap = new SitemapStream({
      hostname,
    });

    /*
    |--------------------------------------------------------------------------
    | STATIC PAGES
    |--------------------------------------------------------------------------
    */

    sitemap.write({
      url: "/",
      changefreq: "daily",
      priority: 1.0,
    });

    sitemap.write({
      url: "/tours",
      changefreq: "daily",
      priority: 0.9,
    });

    sitemap.write({
      url: "/destinations",
      changefreq: "weekly",
      priority: 0.9,
    });

    sitemap.write({
      url: "/about",
      changefreq: "monthly",
      priority: 0.6,
    });

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

    const tours = await Tour.find({
      status: "active",
    });

    for (const tour of tours) {
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

    const destinations = await Destination.find();

    for (const destination of destinations) {
      sitemap.write({
        url: `/destinations/${destination.slug}`,
        lastmod: destination.updatedAt,
        changefreq: "weekly",
        priority: 0.7,
      });
    }

    sitemap.end();

    const xml = await streamToPromise(sitemap);

    const outputDir = path.join(process.cwd(), "public");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {
        recursive: true,
      });
    }

    fs.writeFileSync(
      path.join(outputDir, "sitemap.xml"),
      xml.toString()
    );

    // debug removed

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Sitemap generation failed:",
      error.message
    );

    await mongoose.connection.close().catch(() => {});

    process.exit(1);
  }
};

generateSitemap();
