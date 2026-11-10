# Public hero slides contract

## `GET /api/hero` (inventory entry 259)

**Status: SOURCE-TRACED.** `server/routes/heroRoutes.js` applies tenant resolution and mounts `getHeroSlides` without JWT middleware. The controller requires tenant context and queries `HeroSlide` with `tenantFilter(req)` and `active:true`, sorted by `order` then creation date. No request fields, mutation, upload, or external call. Success 200 `{success:true,slides}` with lean model records. Any exception is caught locally and returned as 500 `{success:false,message:publicErrorMessage(error)}`. No focused handler test or live request was found.
