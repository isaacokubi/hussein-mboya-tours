# Agent tour package API contracts

## Shared mounts and access

`server/routes/index.js` mounts `agentPackageRoutes.js` at `/api/agents/packages` and `/api/agent/packages`; both aliases share `resolveTenant` → `protect` → `agentMiddleware`. The middleware requires an active authenticated User with canonical agent role and a tenant-visible Agent profile. It does not enforce Agent approval or active profile status. There is no branch guard. The list controller calls `requireTenantId`; detail does not, but both query TourPackage and rely on the model tenant plugin for tenant scoping. These endpoints only expose `status: active` packages.

## GET `/api/agents/packages` and `/api/agent/packages` (entries 135–136)

Optional query fields: `search`, `category`, `destination`, `featured`, `page`, `limit`, `sort`. Page is `Math.max(Number(page),1)` (default 1); limit is numeric and clamped 1–100 (default 12). There is no explicit invalid-number fallback beyond JavaScript numeric coercion. `category` is equality; destination and search use case-insensitive regular expressions without escaping or length bounds. `featured` filters only when the exact string is `true`. Sort values are `price-low` by `agentPrice` ascending, `price-high` descending, `popular` by `views` descending, and `latest` or unknown values by `createdAt` descending.

The query filters active TourPackage records, applies tenant model scope, selects title/slug/destination/category/duration/coverImage/gallery/agentPrice/basePrice/currency/availableSeats/maxGuests/featured/views/createdAt, then paginates and counts in parallel. HTTP 200 `{success:true,pagination:{total,page,limit,pages,hasNext,hasPrev},count,packages}`. No specific controller-level 4xx response; errors including malformed regex are passed to centralized handling. List is read-only. Client callers are `getPackages` in `client/src/services/packageService.js` and direct `api.get` in `client/src/pages/agent/AgentQuotes.jsx`.

## GET `/api/agents/packages/:id` and `/api/agent/packages/:id` (entries 137–138)

Path `id` must be a valid Mongoose ObjectId or returns 400 `{success:false,message:"Invalid package ID."}`. It atomically finds an active tenant-scoped package and increments `views` by one in `findOneAndUpdate`; returns the updated lean document with HTTP 200 `{success:true,package}`. Missing, inactive, or cross-tenant package returns 404 `{success:false,message:"Tour package not found."}`. This detail request mutates analytics state. The increment has no separate deduplication, so repeat requests each count as views. Client caller `getPackageDetails` in `client/src/services/packageService.js`.

## Data and tests

Source: `server/routes/agentPackageRoutes.js`, `server/controllers/agentPackageController.js` (`getAgentPackages`, `getPackageDetails`), `server/models/TourPackage.js` (tenant plugin, status enum, view field and indexes), `server/middleware/agentMiddleware.js`, `server/tenancy/tenantPlugin.js`. The selected list fields expose both `agentPrice` and `basePrice`; pricing display policy belongs to the client/business flow, not this handler. No focused package endpoint test was found in `server/tests`. This contract reflects source inspection; no live API calls were made.
