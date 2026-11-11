/**
 * Purpose: tour Lifecycle Service business-logic service. Main declarations: startOfDay, endForTour, syncTourLifecycle.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, runWithTenant } from "../tenancy/context.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";

// Declare startOfDay for use by the surrounding module or function.
const startOfDay = (value) => {
  // Declare d for use by the surrounding module or function.
  const d = new Date(value);
  // Return a new Date instance to the caller.
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

// Declare endForTour for use by the surrounding module or function.
const endForTour = (tour) => {
  // Check the condition (tour.endDate) and run the matching branch.
  if (tour.endDate) return new Date(tour.endDate);
  // Declare start for use by the surrounding module or function.
  const start = new Date(tour.startDate || tour.date);
  // Declare days for use by the surrounding module or function.
  const days = Math.max(1, Number(tour.durationDetails?.days || tour.duration || 1));
  // Declare end for use by the surrounding module or function.
  const end = new Date(start);
  // Perform the side effect or state update expressed on the following line.
  end.setDate(end.getDate() + days - 1);
  // Return the value of end to the caller.
  return end;
};

// Declare syncTourLifecycle for use by the surrounding module or function.
export const syncTourLifecycle = async () => runWithTenant({ bypass: true }, async () => {
  // Declare today for use by the surrounding module or function.
  const today = startOfDay(new Date());
  // Declare tours for use by the surrounding module or function.
  const tours = await Tour.find({
    isDeleted: { $ne: true },
    status: { $nin: ["completed", "cancelled"] },
  }).select("_id tenantId status startDate date endDate duration durationDetails assignedGuide assignedDriver assignedVehicle assignmentStatus").lean();

  // Repeat the enclosed work for each required iteration.
  for (const tour of tours) {
    // The scheduler is platform-wide, but every mutation is executed inside
    // the tour's tenant context. This prevents an invalid/corrupt assignment
    // reference from allowing staff or vehicle writes across companies.
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = tour.tenantId;
    // Check the condition (!tenantId) and run the matching branch.
    if (!tenantId) continue;

    // Perform the side effect or state update expressed on the following line.
    await runWithTenant({ tenantId, role: "system", bypass: false }, async () => {
      // Declare start for use by the surrounding module or function.
      const start = startOfDay(tour.startDate || tour.date);
      // Declare end for use by the surrounding module or function.
      const end = startOfDay(endForTour(tour));

      // Check the condition (today > end) and run the matching branch.
      if (today > end) {
        // Perform the side effect or state update expressed on the following line.
        await Tour.updateOne(
          mergeTenantFilter({ _id: tour._id }),
          { $set: { status: "completed", assignmentStatus: "completed", completedAt: new Date(), endDate: endForTour(tour) } }
        );

        // Repeat the enclosed work for each required iteration.
        for (const staffId of [tour.assignedGuide, tour.assignedDriver].filter(Boolean)) {
          // Declare staff for use by the surrounding module or function.
          const staff = await Staff.findOne(mergeTenantFilter({ _id: staffId }));
          // Check the condition (staff) and run the matching branch.
          if (staff) {
            // Perform the side effect or state update expressed on the following line.
            staff.assignedTours = (staff.assignedTours || []).filter((id) => id.toString() !== tour._id.toString());
            // Check the condition (staff.assignedTours.length === 0) and run the matching branch.
            if (staff.assignedTours.length === 0) staff.availability = "available";
            // Perform the side effect or state update expressed on the following line.
            await staff.save();
          }
        }

        // Check the condition (tour.assignedVehicle) and run the matching branch.
        if (tour.assignedVehicle) {
          // Perform the side effect or state update expressed on the following line.
          await Vehicle.findOneAndUpdate(
            mergeTenantFilter({ _id: tour.assignedVehicle }),
            { $set: { status: "available", assignedTour: null } }
          );
        }
      } else if (today >= start && tour.status === "scheduled") {
        // Perform the side effect or state update expressed on the following line.
        await Tour.updateOne(
          mergeTenantFilter({ _id: tour._id }),
          { $set: { status: "upcoming", endDate: endForTour(tour) } }
        );
      } else if (today < start && tour.status === "ongoing") {
        // Perform the side effect or state update expressed on the following line.
        await Tour.updateOne(
          mergeTenantFilter({ _id: tour._id }),
          { $set: { status: "upcoming" } }
        );
      }
    });
  }
});
