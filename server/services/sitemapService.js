import { getTenantContext, mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { SitemapStream, streamToPromise } from "sitemap";

import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";
import TravelGuide from "../models/TravelGuide.js";

/*
|--------------------------------------------------------------------------
| GENERATE XML SITEMAP
|--------------------------------------------------------------------------
*/

const normalizedOrigin = (value) => {
  try {
    const parsed = new URL(String(value || ""));
    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    return parsed.origin;
  } catch {
    return "";
  }
};

export const resolveSiteOrigin = (req, tenant) => {
  const configuredDomain = String(tenant?.domain || "").trim().toLowerCase();
  if (configuredDomain) {
    const domainOrigin = normalizedOrigin(configuredDomain.includes("://") ? configuredDomain : "https://" + configuredDomain);
    if (domainOrigin) return domainOrigin;
  }

  const websiteOrigin = normalizedOrigin(tenant?.websiteUrl);
  if (websiteOrigin) return websiteOrigin;

  const requestOrigin = normalizedOrigin(req?.get?.("origin"));
  if (requestOrigin) {
    const originHost = new URL(requestOrigin).hostname.toLowerCase();
    const tenantSlug = String(tenant?.slug || "").toLowerCase();
    const vercelTenantHost = originHost.endsWith(".vercel.app") && originHost.split(".")[0] === tenantSlug;
    if (vercelTenantHost) return requestOrigin;
  }

  const forwardedHost = String(req?.get?.("x-forwarded-host") || req?.get?.("host") || "").split(",")[0].trim();
  const forwardedOrigin = normalizedOrigin(forwardedHost.includes("://") ? forwardedHost : "https://" + forwardedHost);
  if (forwardedOrigin) {
    const forwardedName = new URL(forwardedOrigin).hostname.toLowerCase();
    const tenantSlug = String(tenant?.slug || "").toLowerCase();
    if (forwardedName === tenantSlug + ".vercel.app") return forwardedOrigin;
  }

  throw new Error("Tenant website origin is not configured; refusing to publish a shared-domain sitemap.");
};

export const generateSitemap = async (req) => {
  requireTenantId();
  try {
    const { tenant } = getTenantContext();
    const sitemap = new SitemapStream({
      hostname: resolveSiteOrigin(req, tenant),
    });

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

    const tours = await Tour.find(
      mergeTenantFilter({
        published: true,
        available: true,
        isDeleted: false,
      })
    ).select("slug updatedAt");

    for (const tour of tours) {
      sitemap.write({
        url: `/tours/${tour.slug}`,
        lastmod: tour.updatedAt,
        changefreq: "weekly",
        priority: 0.8,
      });
    }

    const destinations = await Destination.find(
      mergeTenantFilter({ active: true })
    ).select("slug updatedAt");

    for (const destination of destinations) {
      sitemap.write({
        url: `/destinations/${destination.slug}`,
        lastmod: destination.updatedAt,
        changefreq: "weekly",
        priority: 0.7,
      });
    }

    const guides = await TravelGuide.find(
      mergeTenantFilter({ status: "published" })
    ).select("slug updatedAt publishedAt");
    for (const guide of guides) {
      sitemap.write({
        url: "/travel-guides/" + guide.slug,
        lastmod: guide.updatedAt || guide.publishedAt,
        changefreq: "monthly",
        priority: 0.6,
      });
    }

    sitemap.write({ url: "/travel-guides", changefreq: "weekly", priority: 0.7 });
    sitemap.end();

    const xml = await streamToPromise(sitemap);

    return xml.toString();
  } catch (error) {
    console.error("Sitemap generation failed:", error.message);
    throw error;
  }
};
