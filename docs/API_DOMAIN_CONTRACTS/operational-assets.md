# Operational asset API contracts

## Entries 339–342

**Status: SOURCE-TRACED.** `server/routes/operationalAssetRoutes.js` applies only `protect` and maps list/create/update/delete to `server/controllers/operationalAssetController.js`. Model: `server/models/OperationalAsset.js`. No focused endpoint tests were identified.

All handlers take tenant from `req.user.tenantId`; the route does not declare a manager/admin/permission gate. Source therefore allows any authenticated account with a tenant to reach these CRUD handlers unless upstream role controls exist outside this router. The controller does not perform a role check. This is a source-visible authorization concern for operational records.

- `GET /api/operational-assets`: optional query `type`, `status`, `bookingId`, `tourId`. `type` is applied only if in the model's nine allowed types; invalid type is silently ignored. Other query values are passed as filters. Returns 200 `{success:true,data}` sorted by start date then newest.
- `POST /api/operational-assets`: body `type` and `name` required; supported types: vehicle, driver, guide, room, transfer, park_fee, voucher, traveller_document, incident. Optional code/status/bookingId/tourId/assignedTo/startAt/endAt/metadata/notes. If both dates are provided, endAt must be later (400). Creates tenant-stamped record with createdBy and returns 201 `{success:true,data}`. Schema validates status enum/default and references are Mongoose refs, not cross-record integrity checks. Duplicate `(tenantId,code)` can fail via unique sparse index and is handled by central error middleware.
- `PATCH /api/operational-assets/:id`: tenant-scoped record (404 if missing); updates only name/code/status/bookingId/tourId/assignedTo/startAt/endAt/metadata/notes, not type. Enforces endAt after startAt if both are set; saves with updatedBy; success 200 `{success:true,data}`. Schema validation supplies enum/type checks.
- `DELETE /api/operational-assets/:id`: hard-deletes tenant record; no soft-delete/archive. Missing record 404; success 200 `{success:true}`.

No external integration or booking capacity side effect is performed. The model's ObjectId references do not prove referenced booking/tour/user belongs to the same tenant; the controllers accept those IDs without validating cross-tenant ownership. Treat this as a data-integrity/security risk. No live mutation was performed.
