# API endpoints: documents

This guide contains 1 mounted method/path inventory entries in the **documents** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-238 — POST /api/documents/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [documentRoutes.js](../../server/routes/documentRoutes.js) · [route module explanation](../code-explanations/backend/routes/documentRoutes.md)<br>
**Mounted inventory entry:** 238 of 629<br>
**Route declaration pipeline:** `uploadDocument`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.post(
  "/:id",
  upload.single("document"),
  uploadDocument
)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `400`, `404`, `200`.
- JSON envelope keys observed: `success`, `message`, `data`.



**Source-traced contract:** See [booking document upload](../API_DOMAIN_CONTRACTS/document-upload.md) for request, storage, authorization and failure behavior.
