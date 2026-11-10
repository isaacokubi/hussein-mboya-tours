# Route module: kenyaReadinessRoutes.js

**Source:** [server/routes/kenyaReadinessRoutes.js](../../../../server/routes/kenyaReadinessRoutes.js)

No observed mount was found in the main API or app setup; the declarations are not assumed reachable.

## Router-wide middleware

- `router.use(protect);`
- `router.use(authorize("finance.view"));`

Router-wide middleware runs before the route-specific middleware for requests that reach this router. The application-level middleware in server/app.js also runs first.

## Route contracts

### GET / (unmounted declaration)

Declared at source line 10. Route handler pipeline names: inline callback.

```js
router.get("/", async (req, res, next) => {
  try {
    const data = await getKenyaStep2Readiness(req);
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
})
```

**Authentication/authorization:** the route visibly composes authentication/role/permission middleware; confirm its exact behavior in the linked implementation.

**Request/body, success/error response and side effects:** use the extracted handler cues where available, then follow all linked middleware/services/models. Errors may be caught locally or delegated to app error middleware; dynamic responses and provider effects are not inferable from the route declaration alone.

**Curl skeleton:** substitute path parameters. Add the body properties observed above only after confirming their required format in the handler; use a non-production account.

```bash
curl -i -X GET 'http://localhost:5000/'
```

