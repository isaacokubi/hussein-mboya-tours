# Admin hero slide contracts

## Shared pipeline

Mounted at `/api/admin/hero` from `server/routes/index.js`. Router middleware runs `resolveTenant` → `protect` → `contentManagerMiddleware`. The role middleware reloads the user, rejects missing/inactive users, and accepts `admin`, `super_admin`, `manager`, `tour_manager`, or `tourmanager`; failures return JSON 401/403 (middleware lookup errors return 500). No branch restriction is applied. Tenant context is required by the controller and every database query is constrained by `tenantId`; HeroSlide's tenant plugin also applies tenant scoping.

The controller's `payload` maps flat request fields into nested image/video/button subdocuments. `title`/`subtitle`/text/link/URLs are converted to strings and trimmed. Defaults are badge `Discover Africa`, button one `Explore Tours` → `/tours`, button two `Book Now` → `/contact`, active `true` (only boolean false disables it), and order `Number(body.order || 0)`. No explicit request validator runs. Mongoose requires title and trims it; other schema defaults apply. Non-numeric order can become `NaN` and fail persistence/validation.

## GET /api/admin/hero

- No path, query, header, or body fields beyond shared tenant/auth context.
- Reads HeroSlide for the resolved tenant, sorted `order: 1, createdAt: 1`, returns lean documents.
- HTTP 200 `{success:true,slides:[...]}`. Query errors go to centralized Express error handling.
- Frontend caller: `client/src/api/adminHeroApi.js`; used by `TenantHeroManager.jsx`.

## POST /api/admin/hero

- JSON body fields consumed: `title`, `subtitle`, `badge`, `imageUrl`, `imagePublicId`, `videoUrl`, `videoPublicId`, `buttonOneText`, `buttonOneLink`, `buttonTwoText`, `buttonTwoLink`, `active`, and `order`. Only schema-required title is explicitly required by Mongoose; no manual 400 validation exists.
- Creates a HeroSlide with tenant ID and mapped payload. HTTP 201 `{success:true,slide}`. Invalid/missing title and persistence errors use centralized error handling; no upload occurs here and media URLs are trusted.
- Frontend caller: `createAdminHeroSlide` in `client/src/api/adminHeroApi.js`, via `TenantHeroManager.jsx`.

## PUT /api/admin/hero/:id

- `id` must be a valid Mongo ObjectId or returns HTTP 400 `{success:false,message:"Invalid hero slide id"}`. Body uses the same full payload mapping as POST; omitted properties are reset to mapping defaults/empty strings rather than preserved.
- Tenant-filtered `findOneAndUpdate({_id,tenantId}, payload, {new:true,runValidators:true}).lean()`. Missing or cross-tenant ID returns HTTP 404 `{success:false,message:"Hero slide not found"}`. Success HTTP 200 `{success:true,slide}`. Schema/database failures go to centralized handling.
- Frontend caller: `updateAdminHeroSlide` in `client/src/api/adminHeroApi.js`, via `TenantHeroManager.jsx`.

## DELETE /api/admin/hero/:id

- `id` is passed to a tenant-filtered `findOneAndDelete`; unlike PUT, there is no explicit ObjectId validation. Missing or cross-tenant record returns HTTP 404 `{success:false,message:"Hero slide not found"}`; success HTTP 200 `{success:true,message:"Hero slide deleted"}`. Invalid IDs or database errors are delegated to centralized handling.
- Hard-deletes the document; referenced media is not removed. Frontend caller: `deleteAdminHeroSlide` in `client/src/api/adminHeroApi.js`, via `TenantHeroManager.jsx`.

## Public hero endpoint distinction

The public `GET /api/hero` is a separate router/controller, mounted without `protect`; it is not the admin contract. `client/src/api/heroApi.js` accepts `slides`, array, or `data` response shapes and falls back to a static slide on request failure or empty results. This fallback is frontend behavior, not an admin API response guarantee.
