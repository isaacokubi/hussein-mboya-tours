# Multi-Tenancy Production Hardening

The platform uses request-scoped tenant context plus a Mongoose tenant plugin.

## Rules

1. Tenant-scoped model access requires an active tenant context.
2. Platform-wide jobs must explicitly use `runWithTenant({ bypass: true }, ...)`.
3. SuperAdmin operations may use explicit bypass where cross-tenant access is intentional.
4. Provider callbacks must resolve the owning tenant before querying tenant-scoped models.
5. Socket authentication derives tenant identity from the signed token and joins only the authenticated tenant room.
6. Aggregations are tenant-scoped at the root and protected across `$lookup`, `$unionWith`, and `$graphLookup`.
7. `estimatedDocumentCount()` is prohibited in tenant context; use `countDocuments()`.
8. `insertMany()` and `bulkWrite()` receive tenant enforcement.

## Verification

Static checks:

```bash
npm run check:multitenancy
npm run check:multitenancy:code
```

Live database regression:

```bash
npm run check:multitenancy:live
```

The live regression creates temporary tenants and records, validates cross-tenant read/update/delete rejection, tests bulk writes and aggregation lookups, verifies fail-closed behavior without context, and removes its fixtures afterward.
