# Admin gallery API contracts

## Shared access and upload behavior

Mounted at /api/admin/gallery. Router middleware is resolveTenant → protect → contentManagerMiddleware; the role gate permits active admin, super_admin, manager, tour_manager and tourmanager accounts and does not add a separate permission check. Gallery uses tenantPlugin. POST /upload applies uploadSingle("image"): one JPG/JPEG/PNG/WEBP/PDF file, matching extension/MIME, max 5 MiB, Cloudinary-backed when configured. Image transformations and tenant folders are described in the upload middleware; missing Cloudinary makes file uploads return 503.

## POST /api/admin/gallery/upload

- Requires one uploaded file in multipart field image; missing file is 400. Upload middleware errors include invalid file 4xx handling or 503 when Cloudinary is unavailable.
- Success is HTTP 200 {success:true,image:{url,publicId}}. This uploads media only; it does not create a Gallery document.
- Frontend AdminGallery posts multipart data directly to this endpoint, then places returned URL/publicId in the form.

## GET /api/admin/gallery

- No handler request fields. Requires tenant context and lists tenant Gallery records newest first, with no active filter.
- HTTP 200 {success:true,count,gallery:[...]}. Read-only. Frontend getAdminGallery unwraps gallery/images/data aliases.

## POST /api/admin/gallery

- JSON body reads title, category, featured, active, imageUrl, publicId. Trimmed title and imageUrl are required (400). Category defaults Safari; featured uses Boolean(value), so a nonempty string "false" becomes true; active defaults true and only literal false disables it.
- Creates tenant Gallery with image:{url,publicId}; model category enum is Safari/Beach/Culture/Adventure/Vehicle. HTTP 201 {success:true,gallery:item}. Schema/database errors go to centralized handling.
- The handler trusts supplied imageUrl/publicId; it does not verify that the media came from the upload endpoint.

## PUT /api/admin/gallery/:id

- Optional JSON fields title/category/featured/active/imageUrl/publicId. Text fields stringify/trim; featured/active use Boolean(value) when provided, so string "false" is true. Image is replaced only when imageUrl is truthy; then publicId defaults empty.
- Tenant-filtered findOneAndUpdate with validators. HTTP 200 {success:true,gallery}; missing/cross-tenant item is 404. Invalid ID or enum/database errors pass to centralized handling. No local ID validation.
- Replacing image metadata does not delete the previous Cloudinary asset.

## DELETE /api/admin/gallery/:id

- No body; tenant-filtered findOneAndDelete. HTTP 200 {success:true,message:"Gallery item deleted"}; missing/cross-tenant item 404; other errors centralized.
- This handler hard-deletes the document but does not delete its Cloudinary asset.

## Frontend

client/src/api/adminGalleryApi.js calls list/create/update/delete. AdminGallery.jsx calls the standalone upload endpoint before saving form metadata.
