# API endpoints: database

This guide contains 1 mounted method/path inventory entries in the **database** domain. The authoritative mount and route expression are in the linked route module. Contract status describes documentation evidence, not route availability at a live deployment.

## endpoint-225 — GET /api/database

**Contract status:** SOURCE-TRACED<br>
**Router:** [databaseRoutes.js](../../server/routes/databaseRoutes.js) · [route module explanation](../code-explanations/backend/routes/databaseRoutes.md)<br>
**Mounted inventory entry:** 225 of 629<br>
**Route declaration pipeline:** inline callback
**Router-wide middleware:** resolveTenant; protect; authorize("system.database")
**Authentication evidence:** A JWT/authentication guard is visible in route/router middleware.
**Role/permission middleware evidence:** authorize("system.database"

**Source declaration:**

```js
router.get("/", async (req, res) => {
  res.json({
    success: true,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
})
```


**Source-traced contract:** See [customer and destination contracts](../API_DOMAIN_CONTRACTS/customer-directory.md) for the verified request, response and behavior.