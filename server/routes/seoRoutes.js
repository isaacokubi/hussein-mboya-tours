import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/sitemapRoutes.js

import express from "express";

import {
  generateSitemap,
} from "../services/sitemapService.js";

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

router.get(
  "/sitemap.xml",
  async (req, res, next) => {
    try {
      const sitemap = await generateSitemap();

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
