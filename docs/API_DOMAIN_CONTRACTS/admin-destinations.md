# Admin destination API contracts

## Shared access and upload pipeline

Mounted at /api/admin/destinations. Middleware is resolveTenant → protect → adminMiddleware → authorize("manage_destinations"). POST and PUT additionally run multer array upload for field images, max ten files. Upload middleware allows JPG/JPEG/PNG/WEBP images and PDF only when extension and MIME agree; names are limited to 180 characters and control characters are rejected. Each file is limited to 5 MiB; multipart limits include 30 fields and 256 KiB per field. Configured Cloudinary stores under a tenant-specific folder; image files are transformed to 1200×800 fill/auto quality/format, PDFs use raw resource type. Without Cloudinary, multipart forms without files can still be parsed, but a file upload returns 503. Destination uses tenantPlugin; handlers also require tenant context and apply tenant filters.

## GET /api/admin/destinations

- **Request:** No handler path/query/body fields.
- **Read/response:** Returns all tenant Destination documents newest first, including soft-deleted or inactive records because this admin query has no such filter. HTTP 200 {success:true,count,destinations:[...]}.
- **Failure/frontend:** Database failures pass to centralized handling. Admin destination API wrapper calls this collection route.

## GET /api/admin/destinations/:id

- **Request:** Path ID must be valid ObjectId; no body/query.
- **Read/response:** Tenant lookup returns HTTP 200 {success:true,data:destination,destination}; does not filter isDeleted/status.
- **Errors:** Invalid ID 400; missing/cross-tenant ID 404 with code DESTINATION_NOT_FOUND; other query errors pass to centralized handling.

## POST /api/admin/destinations

- **Request:** Multipart or JSON fields read are name, slug, description, country, city, featured, seo, plus images[] files. Handler requires trimmed nonempty name and slug (400). Slug is trimmed/lowercased. Duplicate check is tenant-scoped against same slug or case-insensitive exact name among non-deleted destinations; conflict returns 409. SEO may be object or JSON string; malformed JSON returns 400. featured is true only for boolean true or string "true".
- **Write/response:** Uses uploaded file path/public ID pairs to set images and first featuredImage; no uploads means empty images and featuredImage. Creates tenant Destination with supplied fields and parsed SEO; model defaults country to Kenya, status active, active true, and other schema defaults. HTTP 201 {success:true,message,destination}.
- **Side effects/failures:** Cloudinary upload happens in multer before controller validation/duplicate checks, so rejected create requests can leave uploaded files without a Destination record; no compensation is shown. Model validation/database errors are forwarded.

## PUT /api/admin/destinations/:id

- **Request:** Multipart or JSON body supports name, slug, description, country, city, featured, status, seo and optional images[]. ID must be valid ObjectId (400). Name/slug are stringified/trimmed; slug is lowercased and cannot be empty. Duplicate slug among other non-deleted tenant destinations returns 409. status is lowercased and limited to active/inactive (400); writes both status and corresponding active boolean. featured accepts only boolean true/string "true". SEO is parsed from JSON string or assigned as object; malformed JSON returns 400.
- **Write/response:** Loads tenant destination, mutates document, then saves. New uploaded files replace the stored images array; featuredImage becomes first new URL, otherwise preserves the old URL. HTTP 200 {success:true,message,destination}.
- **Errors/effects:** Missing/cross-tenant ID 404; malformed ID 400; duplicate slug 409; invalid status/SEO/slug 400; other errors forwarded. Replaced image references are not deleted from Cloudinary, leaving potential orphaned assets. Upload may occur before controller checks and there is no rollback.

## DELETE /api/admin/destinations/:id

- **Request:** Valid ObjectId path required; no body.
- **Behavior:** Tenant-loads destination. If it contains Cloudinary public IDs and Cloudinary is not configured, returns 503 without deleting the database record. Otherwise requests deletion of each image; per-image provider errors are logged and swallowed, then hard-deletes the Destination document.
- **Response/errors:** HTTP 200 {success:true,message}; invalid ID 400; missing destination 404; provider configuration failure 503; database errors forwarded. A failed Cloudinary destroy may leave an orphan asset despite successful database deletion.

## Frontend

The admin destination API wrapper exposes list/detail/create/update/delete operations. Multipart callers must use images[] and field names accepted above.
