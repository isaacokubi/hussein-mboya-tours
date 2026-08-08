import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getTours,
  getGuides,
  getDrivers,
  getVehicles,
  assignTour,
} from "../../api/tourAssignmentApi";

export default function TourAssignments() {
  const queryClient = useQueryClient();

  const [assignments, setAssignments] = useState({});

  const {
    data: tours = [],
    isLoading: toursLoading,
    isError: toursError,
    error: toursErrorObject,
  } = useQuery({
    queryKey: ["assignment-tours"],
    queryFn: getTours,
  });

  const {
    data: guides = [],
    isLoading: guidesLoading,
  } = useQuery({
    queryKey: ["assignment-guides"],
    queryFn: getGuides,
  });

  const {
    data: drivers = [],
    isLoading: driversLoading,
  } = useQuery({
    queryKey: ["assignment-drivers"],
    queryFn: getDrivers,
  });

  const {
    data: vehicles = [],
    isLoading: vehiclesLoading,
  } = useQuery({
    queryKey: ["assignment-vehicles"],
    queryFn: getVehicles,
  });

  const mutation = useMutation({
    mutationFn: ({ tourId, payload }) =>
      assignTour(tourId, payload),

    onSuccess: async () => {
      alert("Tour resources assigned successfully.");

      setAssignments({});

      await queryClient.invalidateQueries({
        queryKey: ["assignment-tours"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["assignment-guides"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["assignment-drivers"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["assignment-vehicles"],
      });
    },

    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to assign tour resources.";

      alert(message);
    },
  });

  const handleChange = (tourId, field, value) => {
    setAssignments((prev) => ({
      ...prev,
      [tourId]: {
        ...prev[tourId],
        [field]: value,
      },
    }));
  };

  const handleAssign = (tour) => {
    const tourId = tour?._id;

    if (!tourId) {
      alert("Invalid tour.");
      return;
    }

    const selected = assignments[tourId] || {};

    const payload = {};

    if (selected.guideId !== undefined) {
      payload.guideId = selected.guideId || null;
    }

    if (selected.driverId !== undefined) {
      payload.driverId = selected.driverId || null;
    }

    if (selected.vehicleId !== undefined) {
      payload.vehicleId = selected.vehicleId || null;
    }

    mutation.mutate({
      tourId,
      payload,
    });
  };

  const getCurrentId = (tour, field) => {
    const selected = assignments[tour?._id]?.[field];

    if (selected !== undefined) {
      return selected;
    }

    if (field === "guideId") {
      return tour?.assignedGuide?._id || tour?.assignedGuide || "";
    }

    if (field === "driverId") {
      return tour?.assignedDriver?._id || tour?.assignedDriver || "";
    }

    if (field === "vehicleId") {
      return tour?.assignedVehicle?._id || tour?.assignedVehicle || "";
    }

    return "";
  };

  const getGuideName = (tour) => {
    if (tour?.assignedGuide?.name) {
      return tour.assignedGuide.name;
    }

    return "Not assigned";
  };

  const getDriverName = (tour) => {
    if (tour?.assignedDriver?.name) {
      return tour.assignedDriver.name;
    }

    return "Not assigned";
  };

  const getVehicleName = (tour) => {
    if (tour?.assignedVehicle?.name) {
      return `${tour.assignedVehicle.name} - ${
        tour.assignedVehicle.registrationNumber ||
        tour.assignedVehicle.registration ||
        ""
      }`;
    }

    return "Not assigned";
  };

  if (toursLoading) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-white p-6 shadow">
          Loading assignments...
        </div>
      </div>
    );
  }

  if (toursError) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h2 className="font-semibold">
            Failed to load tours.
          </h2>

          <p className="mt-2 text-sm">
            {toursErrorObject?.response?.data?.message ||
              toursErrorObject?.message ||
              "Unable to load tour assignments."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-8 text-3xl font-bold">
        Tour Assignment Management
      </h1>

      <div className="space-y-6">
        {tours.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-gray-600 shadow">
            No tours available for assignment.
          </div>
        ) : (
          tours.map((tour) => {
            const tourId = tour?._id;

            const assignmentStatus =
              tour?.assignmentStatus ||
              "pending";

            const isAssigning =
              mutation.isPending &&
              mutation.variables?.tourId === tourId;

            return (
              <div
                key={tourId}
                className="rounded-xl bg-white p-6 shadow"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {tour?.title || "Untitled Tour"}
                    </h2>

                    {tour?.slug && (
                      <p className="mt-1 text-sm text-gray-500">
                        {tour.slug}
                      </p>
                    )}
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${
                      assignmentStatus === "assigned"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {assignmentStatus}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-3">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                      Current Guide
                    </p>

                    <p className="text-sm font-medium">
                      {getGuideName(tour)}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                      Current Driver
                    </p>

                    <p className="text-sm font-medium">
                      {getDriverName(tour)}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                      Current Vehicle
                    </p>

                    <p className="text-sm font-medium">
                      {getVehicleName(tour)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <select
                    value={getCurrentId(tour, "guideId")}
                    onChange={(e) =>
                      handleChange(
                        tourId,
                        "guideId",
                        e.target.value
                      )
                    }
                    disabled={
                      guidesLoading ||
                      isAssigning
                    }
                    className="rounded border p-3"
                  >
                    <option value="">
                      {guidesLoading
                        ? "Loading Guides..."
                        : "Keep / Remove Guide"}
                    </option>

                    {guides.map((guide) => (
                      <option
                        key={guide._id}
                        value={guide._id}
                      >
                        {guide.name}
                        {guide.availability
                          ? ` (${guide.availability})`
                          : ""}
                      </option>
                    ))}
                  </select>

                  <select
                    value={getCurrentId(tour, "driverId")}
                    onChange={(e) =>
                      handleChange(
                        tourId,
                        "driverId",
                        e.target.value
                      )
                    }
                    disabled={
                      driversLoading ||
                      isAssigning
                    }
                    className="rounded border p-3"
                  >
                    <option value="">
                      {driversLoading
                        ? "Loading Drivers..."
                        : "Keep / Remove Driver"}
                    </option>

                    {drivers.map((driver) => (
                      <option
                        key={driver._id}
                        value={driver._id}
                      >
                        {driver.name}
                        {driver.availability
                          ? ` (${driver.availability})`
                          : ""}
                      </option>
                    ))}
                  </select>

                  <select
                    value={getCurrentId(tour, "vehicleId")}
                    onChange={(e) =>
                      handleChange(
                        tourId,
                        "vehicleId",
                        e.target.value
                      )
                    }
                    disabled={
                      vehiclesLoading ||
                      isAssigning
                    }
                    className="rounded border p-3"
                  >
                    <option value="">
                      {vehiclesLoading
                        ? "Loading Vehicles..."
                        : "Keep / Remove Vehicle"}
                    </option>

                    {vehicles.map((vehicle) => (
                      <option
                        key={vehicle._id}
                        value={vehicle._id}
                      >
                        {vehicle.name} -{" "}
                        {vehicle.registrationNumber ||
                          vehicle.registration ||
                          "No registration"}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleAssign(tour)}
                  disabled={isAssigning}
                  className="mt-5 rounded-lg bg-green-700 px-5 py-2 font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAssigning
                    ? "Assigning..."
                    : "Assign Resources"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
