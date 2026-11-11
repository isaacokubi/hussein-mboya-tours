/**
 * Purpose: Edit Tour page-level UI component. Main declarations: toDateInput, normalizeTour, normalizeDestinations, EditTour, handleChange.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useEffect, useMemo, useRef, useState } from "react";
// Load react-router-dom so this module can use its exported dependencies.
import { useLocation, useNavigate, useParams } from "react-router-dom";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load ../../api/tourApi so this module can use its exported dependencies.
import { assignTourResources, getDrivers, getGuides, getTour, getVehicles, updateTour as updateManagerTour } from "../../api/tourApi";
// Load ../../api/destinationApi so this module can use its exported dependencies.
import { getDestinations } from "../../api/destinationApi";
// Load ../../api/adminTourApi so this module can use its exported dependencies.
import { getTour as getAdminTour, updateTour as updateAdminTour } from "../../api/adminTourApi";

// Declare toDateInput for use by the surrounding module or function.
const toDateInput = (value) => {
  // Check the condition (!value) and run the matching branch.
  if (!value) return "";
  // Declare date for use by the surrounding module or function.
  const date = new Date(value);
  // Return the expression shown below to the caller.
  return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toISOString().slice(0, 10);
};

// Declare normalizeTour for use by the surrounding module or function.
const normalizeTour = (value) => value?.tour || value?.data || value || null;
// Declare normalizeDestinations for use by the surrounding module or function.
const normalizeDestinations = (value) => {
  // Declare candidates for use by the surrounding module or function.
  const candidates = [value, value?.data, value?.destinations, value?.data?.destinations, value?.data?.data];
  // Return the expression shown below to the caller.
  return candidates.find(Array.isArray) || [];
};

// Define EditTour; its parameters and body implement this operation.
export default function EditTour() {
  // Declare { id } for use by the surrounding module or function.
  const { id } = useParams();
  // Declare navigate for use by the surrounding module or function.
  const navigate = useNavigate();
  // Declare location for use by the surrounding module or function.
  const location = useLocation();
  // Declare queryClient for use by the surrounding module or function.
  const queryClient = useQueryClient();
  // Declare isAdmin for use by the surrounding module or function.
  const isAdmin = useMemo(() => location.pathname.startsWith("/admin/"), [location.pathname]);
  // Declare [form, setForm] for use by the surrounding module or function.
  const [form, setForm] = useState(null);
  // Declare saveInFlight for use by the surrounding module or function.
  const saveInFlight = useRef(false);

  // Declare { data: tourData, isLoading: tourLoading, isError: tourError } for use by the surrounding module or function.
  const { data: tourData, isLoading: tourLoading, isError: tourError } = useQuery({
    queryKey: [isAdmin ? "admin-tour" : "tour", id],
    queryFn: async () => normalizeTour(isAdmin ? await getAdminTour(id) : await getTour(id)),
    enabled: Boolean(id),
  });

  // Declare { data: destinationsData, isLoading: destinationsLoading, isError: destinationsError } for use by the surrounding module or function.
  const { data: destinationsData, isLoading: destinationsLoading, isError: destinationsError } = useQuery({
    queryKey: ["destinations"],
    queryFn: getDestinations,
  });
  // Declare destinations for use by the surrounding module or function.
  const destinations = normalizeDestinations(destinationsData);

  // Declare { data: guides = [] } for use by the surrounding module or function.
  const { data: guides = [] } = useQuery({ queryKey: ["tour-assignment-guides"], queryFn: getGuides, enabled: !isAdmin });
  // Declare { data: drivers = [] } for use by the surrounding module or function.
  const { data: drivers = [] } = useQuery({ queryKey: ["tour-assignment-drivers"], queryFn: getDrivers, enabled: !isAdmin });
  // Declare { data: vehicles = [] } for use by the surrounding module or function.
  const { data: vehicles = [] } = useQuery({ queryKey: ["tour-assignment-vehicles"], queryFn: getVehicles, enabled: !isAdmin });

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Check the condition (!tourData) and run the matching branch.
    if (!tourData) return;
    // Perform the side effect or state update expressed on the following line.
    setForm({
      title: tourData.title || tourData.name || "",
      shortDescription: tourData.shortDescription || "",
      description: tourData.description || "",
      category: tourData.category || "Safari",
      destination: tourData.destination?._id || tourData.destination || "",
      country: tourData.country || "Kenya",
      location: tourData.location || "",
      meetingPoint: tourData.meetingPoint || "",
      date: toDateInput(tourData.date || tourData.startDate),
      startDate: toDateInput(tourData.startDate || tourData.date),
      endDate: toDateInput(tourData.endDate),
      duration: Number(tourData.durationDays ?? tourData.durationDetails?.days ?? tourData.duration ?? 1),
      capacity: tourData.capacity ?? 20,
      price: tourData.price ?? 0,
      discount: tourData.discount ?? 0,
      difficulty: tourData.difficulty || "easy",
      status: tourData.status || "upcoming",
      featured: Boolean(tourData.featured),
      available: tourData.available !== false,
      assignedGuide: tourData.assignedGuide?._id || "",
      assignedDriver: tourData.assignedDriver?._id || "",
      assignedVehicle: tourData.assignedVehicle?._id || "",
    });
  }, [tourData]);

  // Declare saveMutation for use by the surrounding module or function.
  const saveMutation = useMutation({
    mutationFn: async (values) => {
      // Check the condition (isAdmin) and run the matching branch.
      if (isAdmin) {
        // Declare payload for use by the surrounding module or function.
        const payload = new FormData();
        // Declare fields for use by the surrounding module or function.
        const fields = [
          "title", "shortDescription", "description", "category", "destination", "country", "location",
          "meetingPoint", "date", "startDate", "endDate", "duration", "capacity", "price", "discount",
          "difficulty", "status", "featured", "available",
        ];
        // Perform the side effect or state update expressed on the following line.
        fields.forEach((field) => {
          // Check the condition (values[field] !== undefined && values[field] !== null) and run the matching branch.
          if (values[field] !== undefined && values[field] !== null) payload.append(field, String(values[field]));
        });
        // Return the result of updateAdminTour() to the caller.
        return updateAdminTour(id, payload);
      }

      // Declare { assignedGuide, assignedDriver, assignedVehicle, ...tourFields } for use by the surrounding module or function.
      const { assignedGuide, assignedDriver, assignedVehicle, ...tourFields } = values;
      // Declare response for use by the surrounding module or function.
      const response = await updateManagerTour(id, {
        ...tourFields,
        capacity: Number(tourFields.capacity),
        price: Number(tourFields.price),
        discount: Number(tourFields.discount),
      });
      // Perform the side effect or state update expressed on the following line.
      await assignTourResources(id, {
        guideId: assignedGuide || null,
        driverId: assignedDriver || null,
        vehicleId: assignedVehicle || null,
      });
      // Return the value of response to the caller.
      return response;
    },
    onSuccess: () => {
      // Perform the side effect or state update expressed on the following line.
      toast.success("Tour updated successfully");
      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({ queryKey: ["adminTours"] });
      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({ queryKey: ["manager-tours"] });
      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({ queryKey: ["tour-manager-tours"] });
      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({ queryKey: ["tour", id] });
      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({ queryKey: ["admin-tour", id] });
      // Perform the side effect or state update expressed on the following line.
      navigate(isAdmin ? "/admin/tours" : "/tour-manager/tours", { replace: true });
    },
    onError: (error) => {
      // Perform the side effect or state update expressed on the following line.
      toast.error(error?.response?.data?.message || "Failed to update tour");
    },
    onSettled: () => {
      // Perform the side effect or state update expressed on the following line.
      saveInFlight.current = false;
    },
  });

  // Declare handleChange for use by the surrounding module or function.
  const handleChange = (event) => {
    // Declare { name, value, type, checked } for use by the surrounding module or function.
    const { name, value, type, checked } = event.target;
    // Perform the side effect or state update expressed on the following line.
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  // Declare submitHandler for use by the surrounding module or function.
  const submitHandler = (event) => {
    // Perform the side effect or state update expressed on the following line.
    event.preventDefault();
    // Check the condition (!form || saveInFlight.current || saveMutation.isPending) and run the matching branch.
    if (!form || saveInFlight.current || saveMutation.isPending) return;
    // Check the condition (!form.title.trim() || !form.description.trim() || !form.destination ||) and run the matching branch.
    if (!form.title.trim() || !form.description.trim() || !form.destination || !form.country.trim() || !form.location.trim() || !form.date) {
      // Perform the side effect or state update expressed on the following line.
      toast.error("Title, description, destination, country, location and tour date are required.");
      // Return the result to the caller.
      return;
    }
    // Declare duration for use by the surrounding module or function.
    const duration = Number(form.duration);
    // Check the condition (!Number.isInteger(duration) || duration < 1 || duration > 365) and run the matching branch.
    if (!Number.isInteger(duration) || duration < 1 || duration > 365) {
      // Perform the side effect or state update expressed on the following line.
      toast.error("Duration must be a whole number between 1 and 365 days.");
      // Return the result to the caller.
      return;
    }
    // Declare payload for use by the surrounding module or function.
    const payload = { ...form, duration };
    // Perform the side effect or state update expressed on the following line.
    saveInFlight.current = true;
    // Perform the side effect or state update expressed on the following line.
    saveMutation.mutate(payload);
  };

  // Check the condition (tourError) and run the matching branch.
  if (tourError) return <div className="p-6 text-red-600">Failed to load the tour.</div>;
  // Check the condition (tourLoading || !form) and run the matching branch.
  if (tourLoading || !form) return <div className="p-10 text-center" role="status">Loading tour...</div>;

  // Declare destinationId for use by the surrounding module or function.
  const destinationId = typeof form.destination === "object" ? form.destination?._id : form.destination;
  // Declare currentDestination for use by the surrounding module or function.
  const currentDestination = tourData?.destination && typeof tourData.destination === "object"
    ? tourData.destination
    : destinationId ? { _id: destinationId, name: "Current destination" } : null;
  // Declare destinationOptions for use by the surrounding module or function.
  const destinationOptions = currentDestination && !destinations.some((item) => String(item?._id) === String(destinationId))
    ? [currentDestination, ...destinations]
    : destinations;
  // Declare returnPath for use by the surrounding module or function.
  const returnPath = location.state?.returnTo === "/admin/tours"
    ? "/admin/tours"
    : isAdmin ? "/admin/tours" : "/tour-manager/tours";

  // Return the expression shown below to the caller.
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl rounded-xl bg-white p-8 shadow">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Tour</h1>
          <p className="text-sm text-gray-500">{isAdmin ? "Edit this tenant tour from the admin control center." : "Update tour operations and assignments."}</p>
        </div>

        {saveMutation.isError && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">{saveMutation.error?.response?.data?.message || "Failed to update tour. Your changes are still here; please try again."}</div>}
        {destinationsError && <div role="alert" className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Destination options could not be refreshed. The tour's saved destination is preserved; retry after the destination service is available.</div>}

        <form onSubmit={submitHandler} className="grid gap-5 md:grid-cols-2">
          <label className="space-y-1"><span className="text-sm font-medium">Title</span><input name="title" value={form.title} onChange={handleChange} className="w-full rounded-lg border p-3" required /></label>
          <label className="space-y-1"><span className="text-sm font-medium">Category</span><input name="category" value={form.category} onChange={handleChange} className="w-full rounded-lg border p-3" /></label>

          <label className="space-y-1"><span className="text-sm font-medium">Destination</span>
            <select name="destination" value={form.destination} onChange={handleChange} className="w-full rounded-lg border p-3" required>
              <option value="">Select destination</option>
              {destinationOptions.map((item) => <option key={item._id} value={item._id}>{item.name || item.title || "Current destination"}</option>)}
            </select>
            {destinationsLoading && <span className="text-xs text-gray-500">Loading destinations…</span>}
          </label>
          <label className="space-y-1"><span className="text-sm font-medium">Country</span><input name="country" value={form.country} onChange={handleChange} className="w-full rounded-lg border p-3" required /></label>
          <label className="space-y-1"><span className="text-sm font-medium">Location</span><input name="location" value={form.location} onChange={handleChange} className="w-full rounded-lg border p-3" required /></label>
          <label className="space-y-1"><span className="text-sm font-medium">Meeting point</span><input name="meetingPoint" value={form.meetingPoint} onChange={handleChange} className="w-full rounded-lg border p-3" /></label>

          <label className="space-y-1"><span className="text-sm font-medium">Tour date</span><input type="date" name="date" value={form.date} onChange={handleChange} className="w-full rounded-lg border p-3" required /></label>
          <label className="space-y-1"><span className="text-sm font-medium">Start date</span><input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full rounded-lg border p-3" /></label>
          <label className="space-y-1"><span className="text-sm font-medium">End date</span><input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full rounded-lg border p-3" /></label>
          <label className="space-y-1"><span className="text-sm font-medium">Duration (days)</span><input type="number" min="1" max="365" step="1" name="duration" value={form.duration} onChange={handleChange} className="w-full rounded-lg border p-3" required /><span className="text-xs text-gray-500">Enter a whole number from 1 to 365.</span></label>
          <label className="space-y-1"><span className="text-sm font-medium">Capacity</span><input type="number" min="1" name="capacity" value={form.capacity} onChange={handleChange} className="w-full rounded-lg border p-3" /></label>
          <label className="space-y-1"><span className="text-sm font-medium">Price (KES)</span><input type="number" min="0" name="price" value={form.price} onChange={handleChange} className="w-full rounded-lg border p-3" /></label>
          <label className="space-y-1"><span className="text-sm font-medium">Discount (%)</span><input type="number" min="0" max="100" name="discount" value={form.discount} onChange={handleChange} className="w-full rounded-lg border p-3" /></label>
          <label className="space-y-1"><span className="text-sm font-medium">Difficulty</span>
            <select name="difficulty" value={form.difficulty} onChange={handleChange} className="w-full rounded-lg border p-3"><option value="easy">Easy</option><option value="moderate">Moderate</option><option value="hard">Hard</option></select>
          </label>
          <label className="space-y-1"><span className="text-sm font-medium">Status</span>
            <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-lg border p-3"><option value="draft">Draft</option><option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option><option value="fully-booked">Fully booked</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
          </label>

          <label className="flex items-center gap-3 rounded-lg border p-3"><input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured tour</label>
          <label className="flex items-center gap-3 rounded-lg border p-3"><input type="checkbox" name="available" checked={form.available} onChange={handleChange} /> Available for booking</label>

          <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Short description</span><input name="shortDescription" value={form.shortDescription} onChange={handleChange} className="w-full rounded-lg border p-3" /></label>
          <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium">Description</span><textarea name="description" value={form.description} onChange={handleChange} rows="6" className="w-full rounded-lg border p-3" required /></label>

          {!isAdmin && (
            <>
              <label className="space-y-1"><span className="text-sm font-medium">Guide</span><select name="assignedGuide" value={form.assignedGuide} onChange={handleChange} className="w-full rounded-lg border p-3"><option value="">Unassigned</option>{guides.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
              <label className="space-y-1"><span className="text-sm font-medium">Driver</span><select name="assignedDriver" value={form.assignedDriver} onChange={handleChange} className="w-full rounded-lg border p-3"><option value="">Unassigned</option>{drivers.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
              <label className="space-y-1"><span className="text-sm font-medium">Vehicle</span><select name="assignedVehicle" value={form.assignedVehicle} onChange={handleChange} className="w-full rounded-lg border p-3"><option value="">Unassigned</option>{vehicles.map((item) => <option key={item._id} value={item._id}>{item.name}{item.registration ? ` - ${item.registration}` : ""}</option>)}</select></label>
            </>
          )}

          <div className="flex flex-col-reverse gap-3 md:col-span-2 sm:flex-row sm:justify-end">
            <button type="button" disabled={saveMutation.isPending} onClick={() => navigate(returnPath)} className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saveMutation.isPending} className="rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50">
              {saveMutation.isPending ? "Saving..." : "Update Tour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
