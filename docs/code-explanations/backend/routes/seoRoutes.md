# Route module: seoRoutes.js

**Source:** [server/routes/seoRoutes.js](../../../../server/routes/seoRoutes.js)

Observed mount prefixes include `/api/sitemap.xml`.

## Router-wide middleware

- `router.use(resolveTenant);`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET /sitemap.xml → `/api/sitemap.xml`

Declared at source line 26. Route handler pipeline names: inline callback.

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

**Authentication/authorization:** no authentication guard was identified by its route-level symbol name; confirm router-wide/app middleware and handler behavior before treating it as public.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/api/sitemap.xml'
```

