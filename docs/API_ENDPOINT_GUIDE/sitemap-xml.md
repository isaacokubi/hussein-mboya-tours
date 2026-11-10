# API endpoints: sitemap-xml

This guide contains 1 mounted method/path inventory entries in the **sitemap-xml** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-381 — GET /api/sitemap.xml

**Contract status:** PARTIALLY VERIFIED<br>
**Router:** [seoRoutes.js](../../server/routes/seoRoutes.js) · [route module explanation](../code-explanations/backend/routes/seoRoutes.md)<br>
**Mounted inventory entry:** 381 of 629<br>
**Route declaration pipeline:** inline callback
**Router-wide middleware:** resolveTenant
**Authentication evidence:** No standard `protect` guard is visible in route/router middleware. This alone does not prove public access; inspect handler-level checks and global middleware.

**Source declaration:**

```js
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
)
```

**Unverified contract details:** PARTIALLY VERIFIED. The route declaration proves the method, mounted path, middleware order and handler pipeline only. The route guide may expose request keys/status/envelope cues, but those cues do not prove requiredness, types, nested schema constraints, authorization inside the controller, all success/error branches, exact response fields, service/model side effects, transaction boundaries or idempotency. Those facts require tracing the linked handler and every service/model it calls; no successful curl example is provided until that trace is complete.

**Example:** No curl command is supplied for this entry unless its contract is source-traced above. Substitute-safe examples are not useful when required fields or authentication are unknown.

