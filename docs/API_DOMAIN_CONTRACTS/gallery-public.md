# Public featured gallery contract

## `GET /api/gallery/featured` (inventory entry 252)

**Status: SOURCE-TRACED.** `server/routes/galleryRoutes.js` applies `resolveTenant` and mounts `getFeaturedGallery` without JWT middleware. The API router also resolves tenant context. Handler in `server/controllers/galleryController.js`; data sources are `Gallery` and fallback `Tour`. No request fields or mutation.

The handler loads up to 50 active tenant gallery records, ordered featured-first then newest, projects title/image/category/featured/createdAt, normalizes supported image values (`string`, `url`, `secure_url`, or `path`), removes known placeholder URLs, and returns the first 12 usable images. If none remain, it reads up to 20 tenant tours that are published, available, and not deleted; orders featured/popularity/newest; considers featured image, gallery, images, image, and thumbnail; takes up to four candidate images per tour and returns up to 12 synthetic gallery rows with `source:"tour"`.

Success is 200 `{success:true,count,images,data}`, with `data` duplicating the `images` array. When tenant context is in platform bypass mode, the handler omits tenant filtering; otherwise both model queries are tenant-filtered. All errors are passed to central middleware. No external integration. Placeholder rules and fallback behavior are source-verified; no live gallery result or focused controller test was found.
