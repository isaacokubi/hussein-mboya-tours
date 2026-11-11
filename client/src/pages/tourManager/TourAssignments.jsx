/**
 * Purpose: Tour Assignments page-level UI component. Main declarations: getId, normalizeStatus, getTourIdList, getResourceAvailability, isGuideAvailable.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useMemo, useState } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Load lucide-react so this module can use its exported dependencies.
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  Car,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
// Load ../../api/tourAssignmentApi so this module can use its exported dependencies.
import {
  getTours,
  getGuides,
  getDrivers,
  getVehicles,
  assignTour,
} from "../../api/tourAssignmentApi";

// Declare getId for use by the surrounding module or function.
const getId = (value) => value?._id || value?.id || value || "";

// Declare normalizeStatus for use by the surrounding module or function.
const normalizeStatus = (value, fallback = "unknown") => {
  // Declare status for use by the surrounding module or function.
  const status = String(value ?? "").trim().toLowerCase();
  // Return the expression shown below to the caller.
  return status || fallback;
};

// Declare getTourIdList for use by the surrounding module or function.
const getTourIdList = (resource) =>
  Array.isArray(resource?.assignedTours)
    ? resource.assignedTours.map((tour) => String(getId(tour))).filter(Boolean)
    : [];

// Declare getResourceAvailability for use by the surrounding module or function.
const getResourceAvailability = (resource, type) => {
  // Check the condition (type === "vehicle") and run the matching branch.
  if (type === "vehicle") return normalizeStatus(resource?.status);
  // Return the result of normalizeStatus() to the caller.
  return normalizeStatus(resource?.availability);
};

// Declare isGuideAvailable for use by the surrounding module or function.
const isGuideAvailable = (guide, tourId) => {
  // Declare currentId for use by the surrounding module or function.
  const currentId = String(tourId || "");
  // Return the expression shown below to the caller.
  return (
    getTourIdList(guide).includes(currentId) ||
    getResourceAvailability(guide, "guide") === "available"
  );
};

// Declare isDriverAvailable for use by the surrounding module or function.
const isDriverAvailable = (driver, tourId) => {
  // Declare currentId for use by the surrounding module or function.
  const currentId = String(tourId || "");
  // Return the expression shown below to the caller.
  return (
    getTourIdList(driver).includes(currentId) ||
    getResourceAvailability(driver, "driver") === "available"
  );
};

// Declare isVehicleAvailable for use by the surrounding module or function.
const isVehicleAvailable = (vehicle, tourId) => {
  // Declare currentId for use by the surrounding module or function.
  const currentId = String(tourId || "");
  // Return the expression shown below to the caller.
  return (
    String(getId(vehicle?.assignedTour)) === currentId ||
    getResourceAvailability(vehicle, "vehicle") === "available"
  );
};

// Declare resourceTone for use by the surrounding module or function.
const resourceTone = (status) => {
  // Declare value for use by the surrounding module or function.
  const value = normalizeStatus(status);
  // Check the condition (value === "available") and run the matching branch.
  if (value === "available") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  // Check the condition (["busy", "assigned", "in_use", "in-use"].includes(value)) and run the matching branch.
  if (["busy", "assigned", "in_use", "in-use"].includes(value)) return "bg-amber-50 text-amber-700 ring-amber-200";
  // Check the condition (["unavailable", "on_leave", "on-leave", "maintenance", "inactive"].inc) and run the matching branch.
  if (["unavailable", "on_leave", "on-leave", "maintenance", "inactive"].includes(value)) return "bg-rose-50 text-rose-700 ring-rose-200";
  // Return a configured text value to the caller.
  return "bg-slate-100 text-slate-600 ring-slate-200";
};

// Declare statusLabel for use by the surrounding module or function.
const statusLabel = (status) =>
  normalizeStatus(status)
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

// Declare getPersonName for use by the surrounding module or function.
const getPersonName = (value) =>
  value?.name ||
  [value?.firstName, value?.lastName].filter(Boolean).join(" ") ||
  value?.fullName ||
  "Not assigned";

// Declare getVehicleName for use by the surrounding module or function.
const getVehicleName = (vehicle) => {
  // Check the condition (!vehicle) and run the matching branch.
  if (!vehicle) return "Not assigned";
  // Declare name for use by the surrounding module or function.
  const name = vehicle.name || "Vehicle";
  // Declare registration for use by the surrounding module or function.
  const registration = vehicle.registrationNumber || vehicle.registration;
  // Return the expression shown below to the caller.
  return registration ? `${name} - ${registration}` : name;
};

// Declare formatDate for use by the surrounding module or function.
const formatDate = (value) => {
  // Check the condition (!value) and run the matching branch.
  if (!value) return "Date not provided";
  // Declare date for use by the surrounding module or function.
  const date = new Date(value);
  // Check the condition (Number.isNaN(date.getTime())) and run the matching branch.
  if (Number.isNaN(date.getTime())) return "Date not provided";
  // Return the result of new Intl.DateTimeFormat("en-KE", {     day: "2-digit",     month: "short",     year: "numeric",   }).format() to the caller.
  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

// Declare normalizeList for use by the surrounding module or function.
const normalizeList = (value) => (Array.isArray(value) ? value : []);

// Define TourAssignments; its parameters and body implement this operation.
export default function TourAssignments() {
  // Declare queryClient for use by the surrounding module or function.
  const queryClient = useQueryClient();
  // Declare [assignments, setAssignments] for use by the surrounding module or function.
  const [assignments, setAssignments] = useState({});
  // Declare [search, setSearch] for use by the surrounding module or function.
  const [search, setSearch] = useState("");
  // Declare [statusFilter, setStatusFilter] for use by the surrounding module or function.
  const [statusFilter, setStatusFilter] = useState("all");
  // Declare [resourceFilter, setResourceFilter] for use by the surrounding module or function.
  const [resourceFilter, setResourceFilter] = useState("all");

  // Declare toursQuery for use by the surrounding module or function.
  const toursQuery = useQuery({
    queryKey: ["assignment-tours"],
    queryFn: () => getTours({ page: 1, limit: 100 }),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  // Declare guidesQuery for use by the surrounding module or function.
  const guidesQuery = useQuery({
    queryKey: ["assignment-guides"],
    queryFn: getGuides,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  // Declare driversQuery for use by the surrounding module or function.
  const driversQuery = useQuery({
    queryKey: ["assignment-drivers"],
    queryFn: getDrivers,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  // Declare vehiclesQuery for use by the surrounding module or function.
  const vehiclesQuery = useQuery({
    queryKey: ["assignment-vehicles"],
    queryFn: getVehicles,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  // Declare tours for use by the surrounding module or function.
  const tours = normalizeList(toursQuery.data);
  // Declare guides for use by the surrounding module or function.
  const guides = normalizeList(guidesQuery.data);
  // Declare drivers for use by the surrounding module or function.
  const drivers = normalizeList(driversQuery.data);
  // Declare vehicles for use by the surrounding module or function.
  const vehicles = normalizeList(vehiclesQuery.data);

  // Declare mutation for use by the surrounding module or function.
  const mutation = useMutation({
    mutationFn: ({ tourId, payload }) => assignTour(tourId, payload),
    onSuccess: async (response, variables) => {
      // Declare updatedTour for use by the surrounding module or function.
      const updatedTour = response?.tour || response?.data || response;
      // Declare tourId for use by the surrounding module or function.
      const tourId = variables?.tourId;

      // Perform the side effect or state update expressed on the following line.
      setAssignments((current) => {
        // Declare next for use by the surrounding module or function.
        const next = { ...current };
        // Perform the side effect or state update expressed on the following line.
        delete next[tourId];
        // Return the value of next to the caller.
        return next;
      });

      // Perform the side effect or state update expressed on the following line.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["assignment-tours"] }),
        queryClient.invalidateQueries({ queryKey: ["assignment-guides"] }),
        queryClient.invalidateQueries({ queryKey: ["assignment-drivers"] }),
        queryClient.invalidateQueries({ queryKey: ["assignment-vehicles"] }),
        queryClient.invalidateQueries({ queryKey: ["tour-manager-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["tour-manager-tours"] }),
      ]);

      // Perform the side effect or state update expressed on the following line.
      window.dispatchEvent(
        new CustomEvent("tour-manager:data-changed", {
          detail: { type: "assignment", tourId, tour: updatedTour },
        })
      );
    },
  });

  // Declare filteredTours for use by the surrounding module or function.
  const filteredTours = useMemo(() => {
    // Declare term for use by the surrounding module or function.
    const term = search.trim().toLowerCase();

    // Return the result of tours.filter() to the caller.
    return tours.filter((tour) => {
      // Declare tourStatus for use by the surrounding module or function.
      const tourStatus = normalizeStatus(tour?.status);
      // Declare assignmentStatus for use by the surrounding module or function.
      const assignmentStatus = normalizeStatus(tour?.assignmentStatus, "pending");
      // Declare guide for use by the surrounding module or function.
      const guide = tour?.assignedGuide;
      // Declare driver for use by the surrounding module or function.
      const driver = tour?.assignedDriver;
      // Declare vehicle for use by the surrounding module or function.
      const vehicle = tour?.assignedVehicle;
      // Declare resourceState for use by the surrounding module or function.
      const resourceState =
        guide || driver || vehicle
          ? "assigned"
          : "unassigned";

      // Declare matchesSearch for use by the surrounding module or function.
      const matchesSearch = !term || [
        tour?.title,
        tour?.destination?.name,
        tour?.destination,
        getPersonName(guide),
        getPersonName(driver),
        getVehicleName(vehicle),
        tourStatus,
        assignmentStatus,
      ].some((value) => String(value || "").toLowerCase().includes(term));

      // Declare matchesStatus for use by the surrounding module or function.
      const matchesStatus =
        statusFilter === "all" ||
        tourStatus === statusFilter ||
        assignmentStatus === statusFilter;

      // Declare matchesResource for use by the surrounding module or function.
      const matchesResource = resourceFilter === "all" || resourceState === resourceFilter;

      // Return the expression shown below to the caller.
      return matchesSearch && matchesStatus && matchesResource;
    });
  }, [tours, search, statusFilter, resourceFilter]);

  // Declare stats for use by the surrounding module or function.
  const stats = useMemo(() => {
    // Declare completed for use by the surrounding module or function.
    const completed = tours.filter((tour) => normalizeStatus(tour?.status) === "completed").length;
    // Declare locked for use by the surrounding module or function.
    const locked = tours.filter((tour) => ["completed", "cancelled", "canceled"].includes(normalizeStatus(tour?.status))).length;
    // Declare fullyAssigned for use by the surrounding module or function.
    const fullyAssigned = tours.filter((tour) => tour?.assignedGuide && tour?.assignedDriver && tour?.assignedVehicle).length;
    // Declare needingAssignment for use by the surrounding module or function.
    const needingAssignment = tours.filter((tour) => !tour?.assignedGuide || !tour?.assignedDriver || !tour?.assignedVehicle).length;

    // Return the object assembled below to the caller.
    return { total: tours.length, fullyAssigned, needingAssignment, completed, locked };
  }, [tours]);

  // Declare handleChange for use by the surrounding module or function.
  const handleChange = (tourId, field, value) => {
    // Perform the side effect or state update expressed on the following line.
    setAssignments((prev) => ({
      ...prev,
      [tourId]: {
        ...prev[tourId],
        [field]: value,
      },
    }));
  };

  // Declare getCurrentId for use by the surrounding module or function.
  const getCurrentId = (tour, field) => {
    // Declare selected for use by the surrounding module or function.
    const selected = assignments[tour?._id]?.[field];
    // Check the condition (selected !== undefined) and run the matching branch.
    if (selected !== undefined) return selected;
    // Check the condition (field === "guideId") and run the matching branch.
    if (field === "guideId") return getId(tour?.assignedGuide);
    // Check the condition (field === "driverId") and run the matching branch.
    if (field === "driverId") return getId(tour?.assignedDriver);
    // Check the condition (field === "vehicleId") and run the matching branch.
    if (field === "vehicleId") return getId(tour?.assignedVehicle);
    // Return a configured text value to the caller.
    return "";
  };

  // Declare handleAssign for use by the surrounding module or function.
  const handleAssign = (tour) => {
    // Declare tourId for use by the surrounding module or function.
    const tourId = getId(tour);
    // Check the condition (!tourId) and run the matching branch.
    if (!tourId) {
      // Perform the side effect or state update expressed on the following line.
      window.alert("This tour has no valid identifier and cannot be assigned.");
      // Return the result to the caller.
      return;
    }

    // Declare tourStatus for use by the surrounding module or function.
    const tourStatus = normalizeStatus(tour?.status);
    // Check the condition (["completed", "cancelled", "canceled"].includes(tourStatus)) and run the matching branch.
    if (["completed", "cancelled", "canceled"].includes(tourStatus)) return;

    // Declare selected for use by the surrounding module or function.
    const selected = assignments[tourId] || {};
    // Declare payload for use by the surrounding module or function.
    const payload = {};
    // Check the condition (selected.guideId !== undefined) and run the matching branch.
    if (selected.guideId !== undefined) payload.guideId = selected.guideId || null;
    // Check the condition (selected.driverId !== undefined) and run the matching branch.
    if (selected.driverId !== undefined) payload.driverId = selected.driverId || null;
    // Check the condition (selected.vehicleId !== undefined) and run the matching branch.
    if (selected.vehicleId !== undefined) payload.vehicleId = selected.vehicleId || null;

    // Check the condition (Object.keys(payload).length === 0) and run the matching branch.
    if (Object.keys(payload).length === 0) {
      // Perform the side effect or state update expressed on the following line.
      window.alert("No assignment changes were selected.");
      // Return the result to the caller.
      return;
    }

    // Perform the side effect or state update expressed on the following line.
    mutation.mutate({ tourId, payload });
  };

  // Declare handleRefresh for use by the surrounding module or function.
  const handleRefresh = async () => {
    // Perform the side effect or state update expressed on the following line.
    await Promise.all([
      toursQuery.refetch(),
      guidesQuery.refetch(),
      driversQuery.refetch(),
      vehiclesQuery.refetch(),
    ]);
  };

  // Declare anyLoading for use by the surrounding module or function.
  const anyLoading = toursQuery.isLoading || guidesQuery.isLoading || driversQuery.isLoading || vehiclesQuery.isLoading;
  // Declare resourceError for use by the surrounding module or function.
  const resourceError = guidesQuery.isError || driversQuery.isError || vehiclesQuery.isError;

  // Check the condition (toursQuery.isLoading) and run the matching branch.
  if (toursQuery.isLoading) {
    // Return the expression shown below to the caller.
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-36 rounded-3xl bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-28 rounded-2xl bg-white shadow-sm" />)}
          </div>
          {[1, 2].map((item) => <div key={item} className="h-72 rounded-2xl bg-white shadow-sm" />)}
        </div>
      </div>
    );
  }

  // Check the condition (toursQuery.isError) and run the matching branch.
  if (toursQuery.isError) {
    // Return the expression shown below to the caller.
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <CircleAlert className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">Tour assignment data unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The tour list could not be loaded. The page will not treat this failure as an empty tenant schedule.
          </p>
          <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            {toursQuery.error?.response?.data?.message || toursQuery.error?.message || "Unable to load tour assignments."}
          </p>
          <button type="button" onClick={handleRefresh} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // Return the expression shown below to the caller.
  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white shadow-xl">
          <div className="relative p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100">
                  <ShieldCheck className="h-4 w-4" /> Tenant resource control
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Tour Assignment Management</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Coordinate guides, drivers and vehicles while respecting current availability and backend conflict checks.
                </p>
              </div>
              <button type="button" onClick={handleRefresh} disabled={anyLoading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60">
                <RefreshCw className={`h-4 w-4 ${anyLoading ? "animate-spin" : ""}`} /> Refresh
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Tours in scope", stats.total, "bg-indigo-50 text-indigo-700", ClipboardCheck],
            ["Fully assigned", stats.fullyAssigned, "bg-emerald-50 text-emerald-700", CheckCircle2],
            ["Need resources", stats.needingAssignment, "bg-amber-50 text-amber-700", AlertTriangle],
            ["Completed / locked", stats.locked, "bg-slate-100 text-slate-700", XCircle],
          ].map(([label, value, tone, Icon]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div>
              </div>
            </div>
          ))}
        </section>

        {resourceError && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Resource availability is incomplete</p>
              <p className="mt-1 text-sm text-amber-800">One or more guide, driver or vehicle lists could not be refreshed. Do not interpret missing resources as available.</p>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tours, destinations, guides, drivers or vehicles..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50" />
            </label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50">
              <option value="all">All statuses</option>
              <option value="pending">Pending assignment</option>
              <option value="assigned">Assigned</option>
              <option value="scheduled">Scheduled</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50">
              <option value="all">All resource states</option>
              <option value="assigned">Has assignments</option>
              <option value="unassigned">Needs resources</option>
            </select>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredTours.length} of {tours.length} tours</span>
            {(search || statusFilter !== "all" || resourceFilter !== "all") && <button type="button" onClick={() => { setSearch(""); setStatusFilter("all"); setResourceFilter("all"); }} className="font-semibold text-indigo-600 hover:text-indigo-800">Clear filters</button>}
          </div>
        </section>

        {filteredTours.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><Search className="h-6 w-6" /></div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">No tours match the current view</h2>
            <p className="mt-1 text-sm text-slate-500">Adjust the search or filters to view other tenant tours.</p>
          </section>
        ) : (
          <div className="space-y-5">
            {filteredTours.map((tour) => {
              const tourId = getId(tour);
              const assignmentStatus = normalizeStatus(tour?.assignmentStatus, "pending");
              const tourStatus = normalizeStatus(tour?.status, "unknown");
              const locked = ["completed", "cancelled", "canceled"].includes(tourStatus);
              const selected = assignments[tourId] || {};
              const isAssigning = mutation.isPending && mutation.variables?.tourId === tourId;
              const guide = tour?.assignedGuide;
              const driver = tour?.assignedDriver;
              const vehicle = tour?.assignedVehicle;
              const complete = guide && driver && vehicle;

              return (
                <article key={tourId} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                  <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/40 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${complete ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200"}`}>
                            {complete ? "Fully assigned" : statusLabel(assignmentStatus)}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{statusLabel(tourStatus)}</span>
                        </div>
                        <h2 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">{tour?.title || "Untitled Tour"}</h2>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{tour?.destination?.name || tour?.destination || "Destination not provided"}</span>
                          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formatDate(tour?.startDate || tour?.date || tour?.start)}</span>
                          <span className="inline-flex items-center gap-1.5"><ClipboardCheck className="h-4 w-4" />ID {String(tourId).slice(-8)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 shadow-sm">
                        <Users className="h-4 w-4" />
                        {complete ? "Ready for operations" : "Assignment incomplete"}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="grid gap-3 md:grid-cols-3">
                      {[
                        ["Guide", guide ? getPersonName(guide) : "Not assigned", UserRound],
                        ["Driver", driver ? getPersonName(driver) : "Not assigned", UserRound],
                        ["Vehicle", vehicle ? getVehicleName(vehicle) : "Not assigned", Car],
                      ].map(([label, value, Icon]) => (
                        <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"><Icon className="h-4 w-4" /> {label}</div>
                          <p className={`mt-2 text-sm font-semibold ${value === "Not assigned" ? "text-slate-400" : "text-slate-800"}`}>{value}</p>
                        </div>
                      ))}
                    </div>

                    {locked && (
                      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                        <div><p className="font-semibold">Assignment changes are locked</p><p className="mt-0.5 text-amber-800">This tour is {tourStatus} and cannot receive new resource assignments.</p></div>
                      </div>
                    )}

                    <div className="mt-5 grid gap-4 lg:grid-cols-3">
                      {[
                        ["guideId", "Guide", guides, guidesQuery.isLoading, isGuideAvailable, (item) => getPersonName(item), "guide"],
                        ["driverId", "Driver", drivers, driversQuery.isLoading, isDriverAvailable, (item) => getPersonName(item), "driver"],
                        ["vehicleId", "Vehicle", vehicles, vehiclesQuery.isLoading, isVehicleAvailable, (item) => getVehicleName(item), "vehicle"],
                      ].map(([field, label, resources, loading, availabilityCheck, displayName, type]) => {
                        const currentId = getCurrentId(tour, field);
                        return (
                          <label key={field} className="block">
                            <span className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                              <span>{label}</span>
                              {resources.length > 0 && <span className="font-medium normal-case tracking-normal text-slate-400">{resources.length} in scope</span>}
                            </span>
                            <div className="relative">
                              <select value={currentId} onChange={(e) => handleChange(tourId, field, e.target.value)} disabled={loading || isAssigning || locked} className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">
                                <option value="">Keep / Remove {label}</option>
                                {resources.map((resource) => {
                                  const resourceId = getId(resource);
                                  const current = String(currentId) === String(resourceId);
                                  const available = availabilityCheck(resource, tourId);
                                  const status = getResourceAvailability(resource, type);
                                  return (
                                    <option key={resourceId} value={resourceId} disabled={!available && !current}>
                                      {displayName(resource)} ({statusLabel(status)})
                                    </option>
                                  );
                                })}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>
                            <p className="mt-1.5 text-xs text-slate-400">Unavailable resources remain selectable only when already assigned to this tour.</p>
                          </label>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs text-slate-500">
                        {complete ? <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> All three resources assigned</span> : <span className="inline-flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-amber-500" /> Select resources before dispatch</span>}
                      </div>
                      <button type="button" onClick={() => handleAssign(tour)} disabled={isAssigning || locked} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow disabled:cursor-not-allowed disabled:bg-slate-300">
                        {isAssigning ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving assignment...</> : <><ClipboardCheck className="h-4 w-4" /> Save Assignment</>}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
