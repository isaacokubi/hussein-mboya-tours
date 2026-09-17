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

    const configuredHostname = String(process.env.CLIENT_URL || process.env.PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
    if (!/^https:\/\//i.test(configuredHostname)) {
      throw new Error("CLIENT_URL or PUBLIC_SITE_URL must be configured as an HTTPS public site URL before generating a production sitemap.");
    }

    const sitemap = new SitemapStream({ hostname: configuredHostname });

    sitemap.write({ url: "/", changefreq: "daily", priority: 1.0 });
    sitemap.write({ url: "/tours", changefreq: "daily", priority: 0.9 });
    sitemap.write({ url: "/destinations", changefreq: "weekly", priority: 0.9 });
    sitemap.write({ url: "/about", changefreq: "monthly", priority: 0.6 });
    sitemap.write({ url: "/contact", changefreq: "monthly", priority: 0.5 });

    const tours = await Tour.find({ status: "active" }).select("slug updatedAt").lean();
    for (const tour of tours) {
      if (tour.slug) sitemap.write({ url: `/tours/${tour.slug}`, lastmod: tour.updatedAt, changefreq: "weekly", priority: 0.8 });
    }

    const destinations = await Destination.find({}).select("slug updatedAt").lean();
    for (const destination of destinations) {
      if (destination.slug) sitemap.write({ url: `/destinations/${destination.slug}`, lastmod: destination.updatedAt, changefreq: "weekly", priority: 0.7 });
    }

    sitemap.end();
    const xml = await streamToPromise(sitemap);
    const outputDir = path.join(process.cwd(), "public");
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, "sitemap.xml"), xml.toString());
    await mongoose.connection.close();
  } catch (error) {
    console.error("Sitemap generation failed:", error.message);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

generateSitemap();
