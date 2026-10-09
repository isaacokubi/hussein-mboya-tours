import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/sitemapRoutes.js

import express from "express";

import { generateSitemap, resolveSiteOrigin } from "../services/sitemapService.js";
import { getTenantContext } from "../tenancy/context.js";

const router = express.Router();

router.use(resolveTenant);

/*
|--------------------------------------------------------------------------
| XML SITEMAP
|--------------------------------------------------------------------------
|
| GET /sitemap.xml
|
| Public route used by search engines.
|
|--------------------------------------------------------------------------
*/

router.get("/robots.txt", (req, res, next) => {
  try {
    const { tenant } = getTenantContext();
    const siteOrigin = resolveSiteOrigin(req, tenant);
    return res.status(200).type("text/plain").send("User-agent: *\\nAllow: /\\nSitemap: " + siteOrigin + "/sitemap.xml\\n");
  } catch (error) {
    return next(error);
  }
});

router.get(
  "/sitemap.xml",
  async (req, res, next) => {
    try {
      const sitemap = await generateSitemap(req);

      res
        .status(200)
        .type("application/xml")
        .send(sitemap);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
