/**
 * Purpose: seo Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/sitemapRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";

// Load ../services/sitemapService.js so this module can use its exported dependencies.
import {
  generateSitemap,
} from "../services/sitemapService.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
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

// Perform the side effect or state update expressed on the following line.
router.get(
  "/sitemap.xml",
  async (req, res, next) => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare sitemap for use by the surrounding module or function.
      const sitemap = await generateSitemap();

      // Perform the side effect or state update expressed on the following line.
      res
        .status(200)
        .type("application/xml")
        .send(sitemap);
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      next(error);
    }
  }
);

export default router;
