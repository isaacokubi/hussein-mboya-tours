import { SitemapStream, streamToPromise } from "sitemap";

import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";

/*
|--------------------------------------------------------------------------
| GENERATE XML SITEMAP
|--------------------------------------------------------------------------
*/

export const generateSitemap = async () => {
  try {
    const sitemap = new SitemapStream({
      hostname: process.env.CLIENT_URL,
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
      priority: 0.5,
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
    }).select("slug updatedAt");

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

    const destinations = await Destination.find().select(
      "slug updatedAt"
    );

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

    return xml.toString();
  } catch (error) {
    console.error(
      "Sitemap generation failed:",
      error.message
    );

    throw error;
  }
};