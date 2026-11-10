# Agent-created tour API contracts

## Shared route chain

`GET /api/agents/tours`, `GET /api/agents/tours/:id`, POST/PUT/DELETE equivalents have singular `/api/agent` aliases (entries 149–158). `server/routes/index.js` mounts `agentRoutes.js` under both prefixes. Chain: `protect` → `resolveTenant` → `agentMiddleware` → `requireApprovedAgent` → route-specific `authorize(permission)`; create/update add `upload.array("images",10)` before the controller. Requests require an active authenticated agent User, a tenant Agent profile that is approved and active, and the named permission (`view_agent_tours`, `create_agent_tour`, `edit_agent_tour`, `delete_agent_tour`). No branch restriction. Upload middleware errors occur before controller. `authorize` permission denial prevents handlers; exact middleware response is defined by `server/middleware/permissionMiddleware.js`.

## GET list (entries 149–150)

Optional query `status` is copied directly into the filter without enum validation. Finds tenant-visible, non-deleted Tour records with `createdBy` equal to authenticated User, sorts newest first, returns 200 `{success:true,count,tours}` as lean records. Requires valid authenticated User ID; absent/invalid ID returns 401. No pagination. Errors forwarded.

## GET detail (entries 151–152)

Path `id` must be a valid ObjectId or 400 `{success:false,message:"Invalid tour ID."}`. Reads by ID, creator, tenant, and non-deleted flag. Success 200 `{success:true,tour}`; missing/unowned record 404. No mutation.

## POST create (entries 153–154)

Multipart `images` allows at most 10 files. Body accepts allowlisted Tour keys: `title`, `description`, `shortDescription`, `destination`, `country`, `location`, `category`, `duration`, `difficulty`, `capacity`, `maxGuests`, `price`, `agentPrice`, `discount`, `startDate`, `endDate`, `tourStatus`, `status`, `featured`, `available`, `included`, `excluded`, `itinerary`, `highlights`. Controller requires title, destination, and either price or agentPrice; title is whitespace-normalized and slugified. It rejects an existing non-deleted same-tenant slug (409). Missing price is copied from agentPrice and vice versa. Uploaded files become image `{url:file.path,publicId:file.filename||""}` entries. It sets tenantId, createdBy, `agentCreated:true`, `isDeleted:false`, and defaults status to draft, then Mongoose creates the Tour. Success 201 `{success:true,message,tour}`; missing/invalid user 401, missing profile 404, unapproved/inactive 403, required fields 400, duplicate slug 409, schema/DB failures forwarded. Images are uploaded before DB create; failure can orphan uploaded cloud assets (no cleanup here). No booking/capacity operation.

## PUT update (entries 155–156)

Multipart `images` max 10; same body allowlist. Finds non-deleted tour by ID/tenant/creator or 404; invalid ID 400. Copies supplied allowlisted properties, normalizes title when truthy and regenerates a unique slug if title modified (suffix loop), converts supplied price/agentPrice to Number, replaces images if files supplied, sets updatedBy and saves with schema validation. It does not separately re-check Agent approval inside controller (middleware does), and does not remove old Cloudinary images when replacing them. Success 200 `{success:true,message,tour}`. No per-field validation middleware; Mongoose save validation handles schema rules.

## DELETE soft delete (entries 157–158)

Path ID validation 400. Finds same-tenant creator-owned, non-deleted Tour or 404. Sets `isDeleted`, `deletedAt`, `updatedBy` and saves. Success 200 `{success:true,message}`. It does not cancel dependent bookings, release inventory, refund payments, or delete media. Errors forwarded.

## Dependencies and test boundary

Route/controller: `server/routes/agentRoutes.js`, `server/controllers/agentTourController.js`; middleware `authMiddleware.js`, `tenantMiddleware.js`, `agentMiddleware.js`, `permissionMiddleware.js`, `uploadMiddleware.js`; data `server/models/Tour.js`, tenant plugin; UI API wrappers are not consistently used by agent pages. No dedicated agent-tour HTTP/controller test was found in the searched backend suite. Behavior is source-inspected, not live-tested.
