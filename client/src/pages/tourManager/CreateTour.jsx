import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { getDestinations } from "../../api/destinationApi";
import { createTour, getDrivers, getGuides, getVehicles } from "../../api/tourApi";

const emptyForm = {
  title: "",
  description: "",
  category: "Safari",
  destination: "",
  country: "Kenya",
  location: "",
  date: "",
  capacity: 20,
  duration: 1,
  difficulty: "easy",
  price: "",
  discount: 0,
  guide: "",
  driver: "",
  vehicle: "",
  status: "upcoming",
};

const unwrapList = (response, keys = []) => {
  if (Array.isArray(response)) return response;

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  for (const key of keys) {
    if (Array.isArray(response?.data?.[key])) return response.data[key];
  }

  return [];
};

export default function CreateTour() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState([]);

  const { data: destinationsData, isLoading: destinationsLoading } = useQuery({
    queryKey: ["destinations"],
    queryFn: getDestinations,
  });

  const { data: guidesData, isLoading: guidesLoading, error: guidesError } = useQuery({
    queryKey: ["tour-assignment-guides"],
    queryFn: getGuides,
  });

  const { data: driversData, isLoading: driversLoading, error: driversError } = useQuery({
    queryKey: ["tour-assignment-drivers"],
    queryFn: getDrivers,
  });

  const { data: vehiclesData, isLoading: vehiclesLoading, error: vehiclesError } = useQuery({
    queryKey: ["tour-assignment-vehicles"],
    queryFn: getVehicles,
  });

  const destinations = unwrapList(destinationsData, ["destinations"]);
  const guides = unwrapList(guidesData, ["guides"]);
  const drivers = unwrapList(driversData, ["drivers"]);
  const vehicles = unwrapList(vehiclesData, ["vehicles"]).filter(
    (vehicle) => !vehicle.status || vehicle.status === "available"
  );

  const { mutate: saveTour, isPending } = useMutation({
    mutationFn: createTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tour-manager-tours"] });
      queryClient.invalidateQueries({ queryKey: ["tour-manager-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["tour-assignment-guides"] });
      queryClient.invalidateQueries({ queryKey: ["tour-assignment-drivers"] });
      queryClient.invalidateQueries({ queryKey: ["tour-assignment-vehicles"] });
      toast.success("Tour created successfully.");
      navigate("/tour-manager/tours");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Tour creation failed."
      );
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submitHandler = (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    if (!form.destination || !form.date || !form.location.trim()) {
      toast.error("Destination, date and location are required.");
      return;
    }

    if (Number(form.price) < 0 || form.price === "") {
      toast.error("Enter a valid tour price.");
      return;
    }

    const payload = new FormData();
    const values = {
      title: form.title.trim(), description: form.description.trim(), category: form.category,
      destination: form.destination, country: form.country.trim(), location: form.location.trim(),
      date: form.date, price: Number(form.price), discount: Number(form.discount || 0),
      capacity: Number(form.capacity || 20), duration: Number(form.duration || 1),
      difficulty: form.difficulty, guide: form.guide || "", driver: form.driver || "",
      vehicle: form.vehicle || "", status: form.status, published: true,
    };
    Object.entries(values).forEach(([key, value]) => payload.append(key, String(value)));
    imageFiles.forEach((file) => payload.append("images", file));
    saveTour(payload);
  };

  const assignmentLoading =
    guidesLoading || driversLoading || vehiclesLoading;

  const assignmentError =
    guidesError || driversError || vehiclesError;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl rounded-xl bg-white p-8 shadow">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create New Tour</h1>
          <p className="mt-1 text-gray-600">
            Create the tour and optionally assign a guide, driver and vehicle.
          </p>
        </div>

        <form onSubmit={submitHandler} className="grid gap-5 md:grid-cols-2">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Tour title"
            className="input"
            required
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="Safari">Safari</option>
            <option value="Beach">Beach</option>
            <option value="Adventure">Adventure</option>
            <option value="Cultural">Cultural</option>
            <option value="Luxury">Luxury</option>
            <option value="Hiking">Hiking</option>
            <option value="Family">Family</option>
            <option value="Wildlife">Wildlife</option>
          </select>

          <select
            name="destination"
            value={form.destination}
            onChange={handleChange}
            className="input"
            required
            disabled={destinationsLoading}
          >
            <option value="">
              {destinationsLoading ? "Loading destinations..." : "Select Destination"}
            </option>
            {destinations.map((destination) => (
              <option key={destination._id} value={destination._id}>
                {destination.name || destination.title}
              </option>
            ))}
          </select>

          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="input"
            required
          />

          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            placeholder="Country"
            className="input"
            required
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="input"
            required
          />

          <input
            type="number"
            name="capacity"
            min="1"
            value={form.capacity}
            onChange={handleChange}
            placeholder="Capacity"
            className="input"
            required
          />

          <input
            type="number"
            name="duration"
            min="1"
            value={form.duration}
            onChange={handleChange}
            placeholder="Duration in days"
            className="input"
            required
          />

          <select
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
            className="input"
          >
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input"
          >
            <option value="draft">Draft</option>
            <option value="upcoming">Upcoming</option>
            <option value="scheduled">Scheduled</option>
          </select>

          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            placeholder="Price (KES)"
            className="input"
            required
          />

          <input
            type="number"
            name="discount"
            min="0"
            max="100"
            step="0.01"
            value={form.discount}
            onChange={handleChange}
            placeholder="Discount (%)"
            className="input"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="input md:col-span-2"
            rows="5"
            required
          />

          <div className="md:col-span-2 rounded-xl border bg-white p-5">
            <label className="block">
              <span className="mb-2 block text-lg font-bold">Tour Images</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => setImageFiles(Array.from(e.target.files || []).slice(0, 10))}
                className="w-full rounded-xl border bg-gray-50 p-3"
              />
              <span className="mt-2 block text-xs text-gray-500">
                Upload up to 10 images. The first image becomes the featured image.
              </span>
              {imageFiles.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {imageFiles.map((file) => (
                    <div key={`${file.name}-${file.lastModified}`} className="truncate rounded-lg border bg-gray-50 p-2 text-xs">
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </label>
          </div>

          <div className="md:col-span-2 rounded-xl border bg-gray-50 p-5">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Tour Resources</h2>
              <p className="text-sm text-gray-600">
                Available guides, drivers and vehicles are loaded directly from
                the staff and vehicle APIs.
              </p>
            </div>

            {assignmentError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                Some assignment resources could not be loaded. You can retry
                the page or create the tour without an assignment.
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-3">
              <select
                name="guide"
                value={form.guide}
                onChange={handleChange}
                className="input"
                disabled={assignmentLoading}
              >
                <option value="">
                  {guidesLoading ? "Loading guides..." : "No guide / Select guide"}
                </option>
                {guides.map((guide) => (
                  <option key={guide._id} value={guide._id}>
                    {guide.name} {guide.phone ? `— ${guide.phone}` : ""}
                  </option>
                ))}
              </select>

              <select
                name="driver"
                value={form.driver}
                onChange={handleChange}
                className="input"
                disabled={assignmentLoading}
              >
                <option value="">
                  {driversLoading ? "Loading drivers..." : "No driver / Select driver"}
                </option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} {driver.phone ? `— ${driver.phone}` : ""}
                  </option>
                ))}
              </select>

              <select
                name="vehicle"
                value={form.vehicle}
                onChange={handleChange}
                className="input"
                disabled={assignmentLoading}
              >
                <option value="">
                  {vehiclesLoading ? "Loading vehicles..." : "No vehicle / Select vehicle"}
                </option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.name || vehicle.model} —{" "}
                    {vehicle.registrationNumber || vehicle.registration || "No registration"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-green-700 px-6 py-3 font-bold text-white disabled:opacity-50"
            >
              {isPending ? "Creating Tour..." : "Create Tour"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/tour-manager/tours")}
              className="rounded-xl bg-gray-200 px-6 py-3 font-bold text-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
