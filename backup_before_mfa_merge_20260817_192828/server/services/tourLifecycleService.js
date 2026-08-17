import Tour from "../models/Tour.js";
import Staff from "../models/Staff.js";
import Vehicle from "../models/Vehicle.js";

const startOfDay = (value) => {
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const endForTour = (tour) => {
  if (tour.endDate) return new Date(tour.endDate);
  const start = new Date(tour.startDate || tour.date);
  const days = Math.max(1, Number(tour.durationDetails?.days || tour.duration || 1));
  const end = new Date(start);
  end.setDate(end.getDate() + days - 1);
  return end;
};

export const syncTourLifecycle = async () => {
  const today = startOfDay(new Date());
  const tours = await Tour.find({
    isDeleted: { $ne: true },
    status: { $nin: ["completed", "cancelled"] },
  }).select("_id status startDate date endDate duration durationDetails assignedGuide assignedDriver assignedVehicle assignmentStatus").lean();

  for (const tour of tours) {
    const start = startOfDay(tour.startDate || tour.date);
    const end = startOfDay(endForTour(tour));

    if (today > end) {
      await Tour.updateOne(
        { _id: tour._id },
        {
          $set: {
            status: "completed",
            assignmentStatus: "completed",
            completedAt: new Date(),
            endDate: endForTour(tour),
          },
        }
      );

      for (const staffId of [tour.assignedGuide, tour.assignedDriver].filter(Boolean)) {
        const staff = await Staff.findById(staffId);
        if (staff) {
          staff.assignedTours = (staff.assignedTours || []).filter(
            (id) => id.toString() !== tour._id.toString()
          );
          if (staff.assignedTours.length === 0) staff.availability = "available";
          await staff.save();
        }
      }

      if (tour.assignedVehicle) {
        await Vehicle.findByIdAndUpdate(tour.assignedVehicle, {
          status: "available",
          assignedTour: null,
        });
      }
    } else if (today >= start && tour.status === "scheduled") {
      await Tour.updateOne({ _id: tour._id }, { $set: { status: "upcoming", endDate: endForTour(tour) } });
    } else if (today < start && tour.status === "ongoing") {
      await Tour.updateOne({ _id: tour._id }, { $set: { status: "upcoming" } });
    }
  }
};
