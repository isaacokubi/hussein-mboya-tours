# API endpoints: invoices

This guide contains 1 mounted method/path inventory entries in the **invoices** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-315 — GET /api/invoices/:id

**Contract status:** SOURCE-TRACED<br>
**Router:** [invoiceRoutes.js](../../server/routes/invoiceRoutes.js) · [route module explanation](../code-explanations/backend/routes/invoiceRoutes.md)<br>
**Mounted inventory entry:** 315 of 629<br>
**Route declaration pipeline:** `invoiceOwnerOrPrivileged`, `downloadInvoice`
**Router-wide middleware:** resolveTenant; protect
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.

**Source declaration:**

```js
router.get("/:id", invoiceOwnerOrPrivileged, downloadInvoice)
```

**Statically observed handler cues (navigation aid):**

- Request body properties read: none detected by direct property/destructuring scan.
- Path parameters read: `id`; query parameters read: none detected.
- Literal HTTP statuses in handler: `404`.
- JSON envelope keys observed: `success`, `message`.



**Source-traced contract:** See [booking invoice PDF download](../API_DOMAIN_CONTRACTS/invoice-download.md).
