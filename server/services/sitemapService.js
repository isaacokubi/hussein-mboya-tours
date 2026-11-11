/**
 * Purpose: sitemap Service business-logic service. Main declarations: generateSitemap.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load sitemap so this module can use its exported dependencies.
import { SitemapStream, streamToPromise } from "sitemap";

// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";

/*
|--------------------------------------------------------------------------
| GENERATE XML SITEMAP
|--------------------------------------------------------------------------
*/

// Declare generateSitemap for use by the surrounding module or function.
export const generateSitemap = async () => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare sitemap for use by the surrounding module or function.
    const sitemap = new SitemapStream({
      hostname: process.env.CLIENT_URL,
    });

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
      priority: 0.5,
    });

    // Perform the side effect or state update expressed on the following line.
    sitemap.write({
      url: "/contact",
      changefreq: "monthly",
      priority: 0.5,
    });

    // Declare tours for use by the surrounding module or function.
    const tours = await Tour.find(
      mergeTenantFilter({
        status: "active",
      })
    ).select("slug updatedAt");

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

    // Declare destinations for use by the surrounding module or function.
    const destinations = await Destination.find(
      mergeTenantFilter({})
    ).select("slug updatedAt");

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

    // Return the result of xml.toString() to the caller.
    return xml.toString();
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("Sitemap generation failed:", error.message);
    // Stop the current operation by raising the value of error.
    throw error;
  }
};
