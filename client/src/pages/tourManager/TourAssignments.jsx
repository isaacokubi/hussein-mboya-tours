import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getTours, getGuides, getDrivers, getVehicles, assignTour } from "../../api/tourAssignmentApi";

const getId = (value) => value?._id || value?.id || value || "";
const normalizeRole = (value) => String(value || "").trim().toLowerCase().replace(/[\s_-]/g, "");

const getRoleCandidates = (resource) => [
  resource?.position, resource?.role, resource?.role?.name, resource?.role?.slug,
  resource?.user?.role, resource?.user?.role?.name, resource?.user?.role?.slug,
  resource?.designation, resource?.staffRole,
].map(normalizeRole).filter(Boolean);

const isActualGuide = (resource) => {
  const roles = getRoleCandidates(resource);
  if (roles.some((role) => ["admin", "superadmin", "superadministrator"].includes(role))) return false;
  return roles.some((role) => ["guide", "tourguide"].includes(role));
};

const isActualDriver = (resource) => {
  const roles = getRoleCandidates(resource);
  if (roles.some((role) => ["admin", "superadmin", "superadministrator"].includes(role))) return false;
  return roles.some((role) => ["driver", "tourdriver"].includes(role));
};

const getTourIdList = (resource) => Array.isArray(resource?.assignedTours) ? resource.assignedTours.map((tour) => String(getId(tour))) : [];

const isGuideAvailable = (guide, tourId) => {
  const currentId = String(tourId || "");
  const assignedToCurrentTour = getTourIdList(guide).includes(currentId);
  return assignedToCurrentTour || String(guide?.availability || "available").toLowerCase() === "available";
};

const isDriverAvailable = (driver, tourId) => {
  const currentId = String(tourId || "");
  const assignedToCurrentTour = getTourIdList(driver).includes(currentId);
  return assignedToCurrentTour || String(driver?.availability || "available").toLowerCase() === "available";
};

const isVehicleAvailable = (vehicle, tourId) => {
  const currentId = String(tourId || "");
  const assignedToCurrentTour = String(getId(vehicle?.assignedTour)) === currentId;
  return assignedToCurrentTour || String(vehicle?.status || "available").toLowerCase() === "available";
};

const getResourceStatus = (resource, type) => type === "vehicle" ? resource?.status || "available" : resource?.availability || "available";

export default function TourAssignments() {
  const queryClient = useQueryClient();
  const [assignments, setAssignments] = useState({});

  const { data: tours = [], isLoading: toursLoading, isError: toursError, error: toursErrorObject } = useQuery({ queryKey: ["assignment-tours"], queryFn: getTours, staleTime: 0, refetchOnWindowFocus: true, refetchOnMount: "always" });
  const { data: guidesRaw = [], isLoading: guidesLoading } = useQuery({ queryKey: ["assignment-guides"], queryFn: getGuides, staleTime: 0, refetchOnWindowFocus: true, refetchOnMount: "always" });
  const { data: driversRaw = [], isLoading: driversLoading } = useQuery({ queryKey: ["assignment-drivers"], queryFn: getDrivers, staleTime: 0, refetchOnWindowFocus: true, refetchOnMount: "always" });
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({ queryKey: ["assignment-vehicles"], queryFn: getVehicles, staleTime: 0, refetchOnWindowFocus: true, refetchOnMount: "always" });

  const guides = (Array.isArray(guidesRaw) ? guidesRaw : []).filter(isActualGuide);
  const drivers = (Array.isArray(driversRaw) ? driversRaw : []).filter(isActualDriver);

  const mutation = useMutation({
    mutationFn: ({ tourId, payload }) => assignTour(tourId, payload),
    onSuccess: async (response, variables) => {
      const updatedTour = response?.tour || response?.data || response;
      const tourId = variables?.tourId;
      setAssignments((current) => { const next = { ...current }; delete next[tourId]; return next; });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["assignment-tours"] }),
        queryClient.invalidateQueries({ queryKey: ["assignment-guides"] }),
        queryClient.invalidateQueries({ queryKey: ["assignment-drivers"] }),
        queryClient.invalidateQueries({ queryKey: ["assignment-vehicles"] }),
        queryClient.invalidateQueries({ queryKey: ["tour-manager-dashboard"] }),
      ]);
      window.dispatchEvent(new CustomEvent("tour-manager:data-changed", { detail: { type: "assignment", tourId, tour: updatedTour } }));
    },
    onError: (error) => window.alert(error?.response?.data?.message || error?.message || "Failed to assign tour resources."),
  });

  const handleChange = (tourId, field, value) => setAssignments((prev) => ({ ...prev, [tourId]: { ...prev[tourId], [field]: value } }));

  const handleAssign = (tour) => {
    const tourId = getId(tour);
    if (!tourId) return window.alert("Invalid tour.");
    const selected = assignments[tourId] || {};
    const payload = {};
    if (selected.guideId !== undefined) payload.guideId = selected.guideId || null;
    if (selected.driverId !== undefined) payload.driverId = selected.driverId || null;
    if (selected.vehicleId !== undefined) payload.vehicleId = selected.vehicleId || null;
    if (!Object.keys(payload).length) return window.alert("Select at least one resource or choose an existing resource to remove.");
    mutation.mutate({ tourId, payload });
  };

  const getCurrentId = (tour, field) => {
    const selected = assignments[tour?._id]?.[field];
    if (selected !== undefined) return selected;
    if (field === "guideId") return getId(tour?.assignedGuide);
    if (field === "driverId") return getId(tour?.assignedDriver);
    if (field === "vehicleId") return getId(tour?.assignedVehicle);
    return "";
  };

  const getGuideName = (tour) => tour?.assignedGuide?.name || "Not assigned";
  const getDriverName = (tour) => tour?.assignedDriver?.name || "Not assigned";
  const getVehicleName = (tour) => { const vehicle = tour?.assignedVehicle; if (!vehicle) return "Not assigned"; return `${vehicle.name || "Vehicle"}${vehicle.registrationNumber || vehicle.registration ? ` - ${vehicle.registrationNumber || vehicle.registration}` : ""}`; };

  if (toursLoading) return <div className="p-6"><div className="rounded-xl bg-white p-6 shadow">Loading assignments...</div></div>;
  if (toursError) return <div className="p-6"><div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"><h2 className="font-semibold">Failed to load tours.</h2><p className="mt-2 text-sm">{toursErrorObject?.response?.data?.message || toursErrorObject?.message || "Unable to load tour assignments."}</p></div></div>;

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><div><h1 className="text-3xl font-bold">Tour Assignment Management</h1><p className="mt-1 text-sm text-gray-500">Assign tenant resources while respecting current availability and backend conflict checks.</p></div></div>
      <div className="space-y-6">
        {tours.length === 0 ? <div className="rounded-xl bg-white p-6 text-gray-600 shadow">No tours available for assignment.</div> : tours.map((tour) => {
          const tourId = getId(tour);
          const assignmentStatus = tour?.assignmentStatus || "pending";
          const tourStatus = String(tour?.status || "").toLowerCase();
          const locked = ["completed", "cancelled", "canceled"].includes(tourStatus);
          const isAssigning = mutation.isPending && mutation.variables?.tourId === tourId;
          return (
            <div key={tourId} className="rounded-xl bg-white p-6 shadow">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between"><div><h2 className="text-xl font-bold">{tour?.title || "Untitled Tour"}</h2><p className="mt-1 text-sm text-gray-500">{tour?.destination?.name || tour?.destination || "Destination not assigned"}</p></div><span className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${assignmentStatus === "assigned" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{assignmentStatus}</span></div>
              <div className="mt-5 grid gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-3"><div><p className="mb-1 text-xs font-semibold uppercase text-gray-500">Current Guide</p><p className="text-sm font-medium">{getGuideName(tour)}</p></div><div><p className="mb-1 text-xs font-semibold uppercase text-gray-500">Current Driver</p><p className="text-sm font-medium">{getDriverName(tour)}</p></div><div><p className="mb-1 text-xs font-semibold uppercase text-gray-500">Current Vehicle</p><p className="text-sm font-medium">{getVehicleName(tour)}</p></div></div>
              {locked && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">This tour is {tourStatus} and cannot receive new assignments.</div>}
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <select value={getCurrentId(tour, "guideId")} onChange={(e) => handleChange(tourId, "guideId", e.target.value)} disabled={guidesLoading || isAssigning || locked} className="rounded border p-3 disabled:cursor-not-allowed disabled:bg-gray-100"><option value="">{guidesLoading ? "Loading Guides..." : "Keep / Remove Guide"}</option>{guides.map((guide) => { const available = isGuideAvailable(guide, tourId); const current = String(getCurrentId(tour, "guideId")) === String(guide._id); return <option key={guide._id} value={guide._id} disabled={!available && !current}>{guide.name} ({getResourceStatus(guide, "guide")})</option>; })}</select>
                <select value={getCurrentId(tour, "driverId")} onChange={(e) => handleChange(tourId, "driverId", e.target.value)} disabled={driversLoading || isAssigning || locked} className="rounded border p-3 disabled:cursor-not-allowed disabled:bg-gray-100"><option value="">{driversLoading ? "Loading Drivers..." : "Keep / Remove Driver"}</option>{drivers.map((driver) => { const available = isDriverAvailable(driver, tourId); const current = String(getCurrentId(tour, "driverId")) === String(driver._id); return <option key={driver._id} value={driver._id} disabled={!available && !current}>{driver.name} ({getResourceStatus(driver, "driver")})</option>; })}</select>
                <select value={getCurrentId(tour, "vehicleId")} onChange={(e) => handleChange(tourId, "vehicleId", e.target.value)} disabled={vehiclesLoading || isAssigning || locked} className="rounded border p-3 disabled:cursor-not-allowed disabled:bg-gray-100"><option value="">{vehiclesLoading ? "Loading Vehicles..." : "Keep / Remove Vehicle"}</option>{vehicles.map((vehicle) => { const available = isVehicleAvailable(vehicle, tourId); const current = String(getCurrentId(tour, "vehicleId")) === String(vehicle._id); return <option key={vehicle._id} value={vehicle._id} disabled={!available && !current}>{vehicle.name || "Vehicle"} - {vehicle.registrationNumber || vehicle.registration || "No registration"} ({getResourceStatus(vehicle, "vehicle")})</option>; })}</select>
              </div>
              <button type="button" onClick={() => handleAssign(tour)} disabled={isAssigning || locked} className="mt-5 rounded-lg bg-green-700 px-5 py-2 font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50">{isAssigning ? "Saving..." : "Save Assignment"}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
