# API endpoints: sitemap-xml

This guide contains 1 mounted method/path inventory entries in the **sitemap-xml** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-381 — GET /api/sitemap.xml

**Contract status:** SOURCE-TRACED<br>
**Router:** [seoRoutes.js](../../server/routes/seoRoutes.js) · [route module explanation](../code-explanations/backend/routes/seoRoutes.md)<br>
**Mounted inventory entry:** 381 of 629<br>
**Route declaration pipeline:** inline callback
**Router-wide middleware:** resolveTenant
**Authentication and tenant scope:** The router applies `resolveTenant`; no user authentication or role guard is applied. The handler requires a resolved tenant indirectly through `generateSitemap()` and `requireTenantId()`.

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

**Request:** No path parameters, query parameters, custom headers, or body are read by this route. Tenant resolution is performed by `resolveTenant` from the incoming request according to the shared tenant middleware contract.

**Execution path:** The route is mounted from `server/routes/index.js` at `/` under the `/api` router prefix. `server/routes/seoRoutes.js` applies `resolveTenant`, calls `generateSitemap()`, then returns status 200 with `Content-Type: application/xml` and the generated XML string. Errors are passed to Express `next(error)` and handled by the application error middleware; no endpoint-local error envelope or status mapping exists.

`server/services/sitemapService.js` calls `requireTenantId()`, creates a `SitemapStream` with `process.env.CLIENT_URL` as hostname, and adds five fixed links (`/`, `/tours`, `/destinations`, `/about`, `/contact`). It queries active tours with `Tour.find(mergeTenantFilter({status: "active"})).select("slug updatedAt")`, then destinations with `Destination.find(mergeTenantFilter({})).select("slug updatedAt")`; each result becomes a sitemap URL using the slug and `updatedAt`. It ends the stream and returns its XML. Service failures are logged with the error message and rethrown. Database queries are tenant-filtered; no writes, payment operations, or external provider calls occur.

**Success response:** `200 application/xml` containing sitemap XML. The entries include the fixed pages plus tenant-visible active tours and destinations. Exact URLs depend on `CLIENT_URL` and current database contents, so a fixed XML example would be misleading.

**Failure behavior:** Missing tenant context rejects at `requireTenantId`; model/query or stream errors are rethrown and routed to global error handling. No explicit endpoint-specific status or error response is defined. There is no dedicated sitemap route test or frontend API caller found in the repository; search-engine clients are the intended caller.

**Business/security notes:** `resolveTenant` must successfully identify the tenant before route handling; sitemap content is tenant-filtered. The service does not verify that `CLIENT_URL` matches the resolved tenant’s canonical website, so host correctness depends on deployment configuration. No transaction is relevant because the handler performs reads only.

**Example:** A read-only `GET /api/sitemap.xml` request has no body. Live output was not requested or tested.

