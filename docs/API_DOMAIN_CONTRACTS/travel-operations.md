# Tenant travel operations and commercial rule APIs

## Route and authorization boundary

server/routes/index.js mounts travelOperationsRoutes at /operations, yielding /api/operations. The router applies protect globally. GET / and GET /rules/list are available to any authenticated user; POST/PATCH/DELETE operations and all rule mutations additionally require managerOnly (manager/admin/super_admin role aliases). The controller scopes records with req.user.tenantId. The route file does not call resolveTenant itself; the application and parent API router resolve the tenant before this mount, and protect authenticates the user whose tenantId the handlers use.

## GET /api/operations — inventory 606

Handler listOperations. Optional query filters: type, status, bookingId, tourId and assignedTo. The handler constructs {tenantId:req.user.tenantId}, copies supplied filters directly and returns 200 {success:true,data} with all matching OperationalAsset records sorted startAt ascending then createdAt descending. No pagination, projection or explicit query-value validation is applied.

## POST /api/operations — inventory 607

Requires managerOnly. Body type must be one of transfer, vehicle, driver, guide, room, voucher, traveller_document, incident or park_fee; name is required. If both startAt and endAt are supplied, endAt must be after startAt. It calls createScheduledOperation with body spread, tenantId overwritten from req.user.tenantId and createdBy set to req.user._id. The service checks for an overlapping active OperationalAsset assigned to the same assignedTo user/resource (excluding cancelled/completed statuses) when assignedTo/startAt/endAt are all present; conflict throws 409. Success is 201 {success:true,data:item}. The controller does not allowlist body keys before spreading; Mongoose schema controls persisted fields.

## PATCH /api/operations/:id — inventory 608

Requires managerOnly. Finds asset by _id and tenantId; missing returns 404. Only name, code, status, bookingId, tourId, assignedTo, startAt, endAt, metadata and notes are copied from the body; updatedBy is set to current user. updateScheduledOperation checks schedule overlap using merged existing/new assignedTo/startAt/endAt, excluding current record, then assigns and saves. Success is 200 {success:true,data:item}; conflicts return 409 through next(error). Path ID is not explicitly validated before Mongoose lookup.

## DELETE /api/operations/:id — inventory 609

Requires managerOnly. Hard-deletes OperationalAsset by _id and tenantId. Missing record returns 404; success is 200 {success:true}. No soft-delete, linked booking/tour cleanup, audit event or schedule cancellation is declared in this handler.

## GET /api/operations/rules/list — inventory 610

Available to any authenticated user. Optional query type is applied only when it is one of dynamic_price, park_fee, loyalty or referral; an invalid type is silently ignored and all tenant rules are returned. Sorts priority descending then createdAt descending. Success is 200 {success:true,data}; no pagination.

## POST /api/operations/rules — inventory 611

Requires managerOnly. Body type must be dynamic_price, park_fee, loyalty or referral and name is required. Creates TravelCommercialRule from body spread with tenantId overwritten from req.user.tenantId. Success is 201 {success:true,data:rule}. Conditions/actions/priority/active/metadata are not semantically validated by the controller beyond model schema casting.

## PATCH /api/operations/rules/:id — inventory 612

Requires managerOnly. Performs tenant-filtered findOneAndUpdate by _id and tenantId with {$set:req.body}, new:true and runValidators:true. Missing rule returns 404; success 200 {success:true,data:rule}. Unlike updateOperation, this controller does not allowlist body keys; schema and tenant plugin are the remaining constraints. It does not explicitly validate path ObjectId.

## DELETE /api/operations/rules/:id — inventory 613

Requires managerOnly. Hard-deletes TravelCommercialRule by _id and tenantId. Missing rule returns 404; success 200 {success:true}. No soft delete or rule history is maintained.

## Models and service behavior

OperationalAsset is tenant-scoped and stores type/name/code/status, bookingId/tourId/assignedTo, startAt/endAt, Mixed metadata/notes and audit users. It has tenant/type/status/startAt and unique sparse tenant/code indexes. TravelCommercialRule is tenant-scoped and stores type/name/active/priority plus Mixed conditions/action/metadata; index supports tenant/type/active/priority queries. createScheduledOperation and updateScheduledOperation share assertNoScheduleConflict, which rejects overlapping time windows for the same assignedTo when both startAt/endAt are present and ignores cancelled/completed assets. It does not distinguish asset type when checking assignedTo conflicts.

## Test evidence and limitations

No focused travelOperationsRoutes/controller tests were found in the searched paths. No operational asset or commercial rule was created, updated or deleted during this source review.

## Additional integrity and validation findings

- createOperation spreads the request body into OperationalAsset, then overwrites tenantId and createdBy. The model is strict, but the controller does not verify that bookingId, tourId or assignedTo refer to records in the same tenant. updateOperation likewise permits those reference fields without ownership checks. Tenant-scoping the asset document does not validate its referenced records.
- createOperation checks endAt > startAt only when both values are truthy. Invalid date strings can bypass the JavaScript comparison (NaN comparison is false) and are left to Mongoose casting. updateOperation does not repeat the end-after-start check at all.
- updateScheduledOperation uses nullish coalescing when building its conflict-check window. Explicit null values for assignedTo/startAt/endAt fall back to the old values for conflict detection even though Object.assign later clears them; this can falsely reject a request intended to release a resource or clear its schedule.
- assertNoScheduleConflict checks assignedTo across all OperationalAsset types rather than partitioning by type. It ignores only cancelled/completed status; inactive, expired and pending records can still block overlapping assignments.
- createRule and updateRule do not semantically validate Mixed conditions/actions. updateRule applies the entire request body with $set rather than a field allowlist; the tenant plugin still scopes the query and guards foreign tenantId changes, while runValidators provides schema-level validation only.
- listOperations and listRules are unpaginated. listOperations copies type/status/bookingId/tourId/assignedTo query values without validation. listRules silently ignores an unsupported type and returns all tenant rules.
- Operation and rule deletion are hard deletes with no history or audit event in these handlers. No focused travelOperations route/controller tests were found.
