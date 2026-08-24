import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { assignTourResources, getDrivers, getGuides, getTour, getVehicles, updateTour as updateManagerTour } from "../../api/tourApi";
import { getDestinations } from "../../api/destinationApi";
import { getTour as getAdminTour, updateTour as updateAdminTour } from "../../api/adminTourApi";

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toISOString().slice(0, 10);
};

const normalizeTour = (value) => value?.tour || value?.data || value || null;

export default function EditTour() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isAdmin = useMemo(() => location.pathname.startsWith("/admin/"), [location.pathname]);
  const [form, setForm] = useState(null);

  const { data: tourData, isLoading: tourLoading, isError: tourError } = useQuery({
    queryKey: [isAdmin ? "admin-tour" : "tour", id],
    queryFn: async () => normalizeTour(isAdmin ? await getAdminTour(id) : await getTour(id)),
    enabled: Boolean(id),
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ["destinations"],
    queryFn: getDestinations,
  });

  const { data: guides = [] } = useQuery({ queryKey: ["tour-assignment-guides"], queryFn: getGuides, enabled: !isAdmin });
  const { data: drivers = [] } = useQuery({ queryKey: ["tour-assignment-drivers"], queryFn: getDrivers, enabled: !isAdmin });
  const { data: vehicles = [] } = useQuery({ queryKey: ["tour-assignment-vehicles"], queryFn: getVehicles, enabled: !isAdmin });

  useEffect(() => {
    if (!tourData) return;
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
      duration: tourData.duration || String(tourData.durationDetails?.days || 1),
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

  const saveMutation = useMutation({
    mutationFn: async (values) => {
      if (isAdmin) {
        const payload = new FormData();
        const fields = [
          "title", "shortDescription", "description", "category", "destination", "country", "location",
          "meetingPoint", "date", "startDate", "endDate", "duration", "capacity", "price", "discount",
          "difficulty", "status", "featured", "available",
        ];
        fields.forEach((field) => {
          if (values[field] !== undefined && values[field] !== null) payload.append(field, String(values[field]));
        });
        return updateAdminTour(id, payload);
      }

      const { assignedGuide, assignedDriver, assignedVehicle, ...tourFields } = values;
      const response = await updateManagerTour(id, {
        ...tourFields,
        capacity: Number(tourFields.capacity),
        price: Number(tourFields.price),
        discount: Number(tourFields.discount),
      });
      await assignTourResources(id, {
        guideId: assignedGuide || null,
        driverId: assignedDriver || null,
        vehicleId: assignedVehicle || null,
      });
      return response;
    },
    onSuccess: () => {
      toast.success("Tour updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-tours"] });
      queryClient.invalidateQueries({ queryKey: ["manager-tours"] });
      queryClient.invalidateQueries({ queryKey: ["tour", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-tour", id] });
      navigate(isAdmin ? "/admin/manage-tours" : "/tour-manager/tours", { replace: true });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update tour");
    },
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const submitHandler = (event) => {
    event.preventDefault();
    if (!form) return;
    if (!form.title.trim() || !form.description.trim() || !form.destination || !form.country.trim() || !form.location.trim() || !form.date) {
      toast.error("Title, description, destination, country, location and tour date are required.");
      return;
    }
    saveMutation.mutate(form);
  };

  if (tourLoading || !form) return <div className="p-10 text-center">Loading tour...</div>;
  if (tourError) return <div className="p-6 text-red-600">Failed to load the tour.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl rounded-xl bg-white p-8 shadow">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Tour</h1>
          <p className="text-sm text-gray-500">{isAdmin ? "Edit this tenant tour from the admin control center." : "Update tour operations and assignments."}</p>
        </div>

        <form onSubmit={submitHandler} className="grid gap-5 md:grid-cols-2">
          <label className="space-y-1"><span className="text-sm font-medium">Title</span><input name="title" value={form.title} onChange={handleChange} className="w-full rounded-lg border p-3" required /></label>
          <label className="space-y-1"><span className="text-sm font-medium">Category</span><input name="category" value={form.category} onChange={handleChange} className="w-full rounded-lg border p-3" /></label>

          <label className="space-y-1"><span className="text-sm font-medium">Destination</span>
            <select name="destination" value={form.destination} onChange={handleChange} className="w-full rounded-lg border p-3" required>
              <option value="">Select destination</option>
              {(Array.isArray(destinations) ? destinations : destinations?.data || destinations?.destinations || []).map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
            </select>
          </label>
          <label className="space-y-1"><span className="text-sm font-medium">Country</span><input name="country" value={form.country} onChange={handleChange} className="w-full rounded-lg border p-3" required /></label>
          <label className="space-y-1"><span className="text-sm font-medium">Location</span><input name="location" value={form.location} onChange={handleChange} className="w-full rounded-lg border p-3" required /></label>
          <label className="space-y-1"><span className="text-sm font-medium">Meeting point</span><input name="meetingPoint" value={form.meetingPoint} onChange={handleChange} className="w-full rounded-lg border p-3" /></label>

          <label className="space-y-1"><span className="text-sm font-medium">Tour date</span><input type="date" name="date" value={form.date} onChange={handleChange} className="w-full rounded-lg border p-3" required /></label>
          <label className="space-y-1"><span className="text-sm font-medium">Start date</span><input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full rounded-lg border p-3" /></label>
          <label className="space-y-1"><span className="text-sm font-medium">End date</span><input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full rounded-lg border p-3" /></label>
          <label className="space-y-1"><span className="text-sm font-medium">Duration</span><input name="duration" value={form.duration} onChange={handleChange} className="w-full rounded-lg border p-3" /></label>
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

          <button type="submit" disabled={saveMutation.isPending} className="rounded-lg bg-orange-600 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50 md:col-span-2">
            {saveMutation.isPending ? "Saving..." : "Update Tour"}
          </button>
        </form>
      </div>
    </div>
  );
}
