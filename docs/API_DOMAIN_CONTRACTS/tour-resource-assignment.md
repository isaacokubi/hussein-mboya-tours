# Tenant-safe tour resource assignment API contract

## PUT /api/tour-assignments/:id/assign — inventory 515

### Route and authorization

server/routes/index.js mounts tourAssignmentRoutes at /tour-assignments. The router applies resolveTenant, protect and managerOnly to all requests. The route then runs validateTourAssignmentTenant before assignTourResourcesSafe. The active tenant context is required; both middleware and controller fail closed when no tenant ID exists.

### Request

Path parameter id is the Tour ObjectId. Optional body fields are guideId, driverId and vehicleId. Omitted fields preserve the current assignment; null or empty string clears that resource. Non-empty values must be valid Mongo ObjectIds. The pre-handler middleware verifies the tour belongs to the tenant and is not deleted, then verifies each supplied guide/driver/vehicle exists in the same tenant and is not deleted. Staff resources must have the requested position (guide/driver). The controller applies stricter active/availability checks.

### Controller behavior and resource conflict protection

The handler opens a Mongo session and performs assignment in withTransaction. It re-validates tour ID, loads the tenant-owned non-deleted Tour, resolves next resource IDs from supplied fields/current assignments, and checks each resource:
- Staff must belong to the tenant, be active/not deleted, have the correct position, and be available unless already assigned to this same tour.
- Vehicle must belong to the tenant, be active/not deleted, and be available unless already assigned to this same tour.
- It searches other tenant tours that are not deleted and whose status is scheduled/upcoming/confirmed/active/ongoing. Date windows are calculated from startDate/date plus duration days. Any overlapping assignment of the same guide/driver/vehicle returns 409 with code RESOURCE_DOUBLE_BOOKED.

It writes assignedGuide/assignedDriver/assignedVehicle and assignmentStatus (assigned if any resource remains, otherwise pending). It releases replaced staff and vehicles, marks selected staff busy and adds the tour to assignedTours, and marks the selected vehicle assigned with assignedTour. It then reloads the populated tour within the transaction. All database changes are committed atomically.

### Response and errors

Success is 200 {success:true,message,data}, where message is "Tour resources assigned successfully." or "Tour resources cleared successfully." and data is the updated tour with destination, guide, driver and vehicle populated. Invalid tour/resource IDs return 400; missing tenant-owned tour/resource returns 404; unavailable or overlapping resources return 409. Errors are passed to next(error). The session is ended in finally.

After the transaction commits, the controller attempts to queue webhook event tour.resources.assigned with tenantId, tourId, supplied guide/driver/vehicle IDs, assignedBy and occurredAt. Queue errors are logged and swallowed; a successful assignment response is still returned. The webhook is not part of the Mongo transaction.

### Limitations and test evidence

The overlap calculation uses duration days and date/startDate rather than the Tour.endDate field. The source review found no focused test file at server/tests/tourResourceAssignmentController.test.js. No assignment was made and no webhook was queued during this review.
