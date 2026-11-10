# Public tour package listing

## `GET /api/packages` (inventory entry 366)

**Status: SOURCE-TRACED.** `server/routes/publicPackageRoutes.js` applies `resolveTenant` and mounts `listPublicPackages` from `server/controllers/adminPackageController.js`. Requires tenant context but no user authentication. No request body/path/query parameters. Reads tenant `TourPackage` records where status active, published true and not deleted; selects public description/pricing/destination/category/media fields; sorts featured first then newest; maps media objects to `{url,caption}`. Returns 200 `{success:true,count,packages}`. Errors go to central middleware. No mutation, external service or focused endpoint test was found. The model reference `destination` is returned as stored and is not populated in this handler.
