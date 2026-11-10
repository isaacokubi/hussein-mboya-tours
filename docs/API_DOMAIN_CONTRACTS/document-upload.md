# Booking document upload contract

## `POST /api/documents/:id` (mounted inventory entry 238)

**Status: SOURCE-TRACED.** Route: `server/routes/documentRoutes.js`; upstream API router supplies tenant resolution, and this router applies `protect` before `upload.single("document")`, then `uploadDocument`. Controller: `server/controllers/documentController.js:uploadDocument`. Upload behavior: `server/middleware/uploadMiddleware.js`; Cloudinary config is in `server/config/cloudinary.js`. The persisted document array is on `Booking`. No focused test for this specific route was identified.

- **Authentication/scope:** JWT required. Controller requires tenant context and finds booking with `mergeTenantFilter(req, {_id})`; no additional owner/role check is present, so any authenticated principal accepted by the router may upload to a booking in the resolved tenant.
- **Path/request:** `:id` must be a valid Mongo ObjectId. Multipart form field name is exactly `document`; there is no request body schema beyond that file. Invalid ID or missing file returns 400; tenant-scoped missing booking returns 404.
- **File checks:** Only `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf` with matching MIME types are accepted. Filename control characters or length over 180 are rejected. Limits: 5 MiB per file, 10 files, 30 fields, 100-byte field names, 256 KiB fields, nesting depth 5. Since the endpoint uses `.single`, only one `document` is accepted.
- **Storage:** Configured Cloudinary storage writes under `global-tours/<tenant id>`; images use a 1200×800 fill transformation with automatic quality/format, PDFs use raw storage. If Cloudinary is not configured, multipart upload handling rejects an otherwise valid file with 503; a non-multipart request can reach the controller and return the missing-file 400.
- **Persistence/response:** Controller appends `{url:req.file.path,publicId:req.file.filename||"",originalName,mimeType,size,uploadedAt}` to `booking.documents`, saves the Booking, and returns 200 `{success:true,message:"Document uploaded successfully.",data:booking.documents}`.
- **Failure/consistency:** Controller errors pass to centralized error handling. Cloudinary upload happens before the booking lookup/save; an unknown booking or DB save failure may leave an uploaded Cloudinary object without a database reference. No cleanup/compensation is implemented here. There is no separate `Document` model write and no external call other than Cloudinary storage.
- **Caller:** No verified frontend caller was identified for this endpoint.

Source inspection establishes these branches; no live upload or Cloudinary provider verification was performed.
