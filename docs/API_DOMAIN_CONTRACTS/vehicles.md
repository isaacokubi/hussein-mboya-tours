# Tenant vehicle management API contracts

## Route and authorization boundary

server/routes/index.js mounts vehicleRoutes at /vehicles. The router applies resolveTenant then protect. Create/update/delete/driver assignment/status operations require managerOnly (manager/admin/super_admin); listing/detail reads require admin/manager/guide; restore requires adminOnly. Mongoose tenantPlugin scopes Vehicle and Staff model queries to the active tenant.

## POST /api/vehicles — inventory 618

Requires managerOnly and upload.single("image"). Body is spread into Vehicle.create. capacity must be a positive whole number; optional year must be from 1990 through next calendar year. If an image is uploaded, image becomes {url:req.file.path,publicId:req.file.filename||req.file.public_id}. Required model fields include name, registrationNumber, model, type (SUV/VAN/BUS/LAND_CRUISER/MINIBUS/SEDAN/PICKUP) and capacity. Success is 201 {success:true,message,data:vehicle}. Other schema errors go to next(error). The controller does not explicitly allowlist body fields; the model schema and tenant plugin constrain persisted values.

## PUT /api/vehicles/:id — inventory 619

Requires managerOnly and upload.single("image"). Validates ObjectId (400). Body is copied wholesale; supplied capacity must be positive integer and supplied non-empty year must be numeric. Uploaded image replaces image object. findOneAndUpdate uses tenant filter, new:true and runValidators:true. It does not exclude isDeleted records, so a soft-deleted vehicle can still be updated. Success is 200 {success:true,message,data}; missing/out-of-tenant vehicle 404.

## DELETE /api/vehicles/:id — inventory 620

Requires managerOnly. Tenant-filtered findOneAndUpdate sets isDeleted:true, isActive:false and status:"out_of_service". Returns 200 {success:true,message}; missing/out-of-tenant vehicle 404. This is a soft delete, but the handler does not unassign its driver/tour or release staff availability.

## GET /api/vehicles — inventory 621

Requires admin/manager/guide. Lists tenant-scoped vehicles with isDeleted not true, populates driver name/phone/email, newest first. Returns 200 {success:true,count,data}. No pagination and no isActive/status filter; maintenance/out-of-service/inactive vehicles may appear.

## GET /api/vehicles/:id — inventory 622

Requires admin/manager/guide. Validates ObjectId (400), tenant-filters by ID, populates driver and returns 200 {success:true,data}. It does not filter isDeleted, so a soft-deleted vehicle remains retrievable by ID. Missing/out-of-tenant record 404.

## PUT /api/vehicles/:id/assign-driver — inventory 623

Requires managerOnly. Body driverId or driver may be null/empty to clear. For a supplied driver it queries tenant-scoped Staff by ID, position driver and isActive:true; invalid driver returns 400. It sets Staff.availability="busy" before updating the tenant vehicle's driver, then returns 200 {success:true,message,data} with populated driver. Missing vehicle returns 404. There is no transaction, no check that driver is available/not deleted, and no release of a vehicle's previous driver. If vehicle lookup fails after the Staff update, the driver may remain busy without assignment.

## PUT /api/vehicles/:id/remove-driver — inventory 624

Requires managerOnly. Loads tenant vehicle (404 if absent). If it has a driver, sets that Staff record availability to available, clears vehicle.driver and saves. Returns 200 {success:true,message,data}. No transaction and no check whether that driver remains assigned to another tour/vehicle; it can mark a still-assigned driver available.

## PUT /api/vehicles/:id/status — inventory 625

Requires managerOnly. Body status must be available, assigned, maintenance or out_of_service; invalid returns 400. Tenant-filtered findOneAndUpdate sets status with validators and returns 200 {success:true,message,data}; missing vehicle 404. No explicit ObjectId validation or isDeleted filter, and changing status does not reconcile driver/tour assignments.

## PATCH /api/vehicles/:id/restore — inventory 626

Requires adminOnly. Tenant-filtered findOneAndUpdate sets isDeleted:false and status:"available"; returns 200 {success:true,message,data}, missing vehicle 404. It does not set isActive:true. Since soft deletion sets isActive:false, a restored vehicle remains inactive and its isAvailable virtual remains false until a separate update reactivates it. No explicit ObjectId validation.

## Model and test evidence

Vehicle stores tenant-owned identity/registration/type/capacity, driver and assignedTour refs, status/isActive/isDeleted, service/insurance fields, image/gallery and maintenance history. No focused vehicleRoutes/controller tests were found in searched paths. No vehicle or driver assignment was changed during this review.

## Additional authorization and integrity findings

- Vehicle.create receives a spread of req.body before capacity/year normalization. Vehicle.update likewise copies the entire body and does not use a field allowlist. The tenant plugin protects tenantId, but the controller does not protect createdBy, driver, assignedTour, isActive, isDeleted or status. A manager can therefore spoof creator/reference fields and can set isDeleted:false/isActive:true through the manager-only PUT route, bypassing the dedicated adminOnly restore route.
- createVehicle does not set createdBy from req.user; it accepts a body-supplied createdBy. updateVehicle can also overwrite it.
- assignVehicleDriver checks only Staff position=driver and isActive=true; it does not reject isDeleted drivers or require availability=available. It marks the new driver busy before confirming that the target vehicle exists, does not release a vehicle's previous driver, and is not transactional.
- removeVehicleDriver marks the current driver available without checking other vehicle/tour assignments. deleteVehicle soft-deletes the vehicle without releasing its driver or assignedTour. updateVehicleStatus can set status=available while isActive=false or isDeleted=true.
- getVehicle does not exclude soft-deleted records; getVehicles does. Neither list nor detail behavior reconciles isActive/status. The read role allowlist is admin/manager/guide and does not include super_admin, while managerOnly and adminOnly do include super_admin.
- Vehicle.registrationNumber has no unique index, so duplicate registrations are not prevented at the model/index layer. Image replacement does not delete the prior Cloudinary object, so repeated updates can leave orphaned media.
