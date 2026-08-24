import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createTour } from "../../api/adminTourApi";
import { getDestinations } from "../../api/adminDestinationApi";
import { getAdminExperiences } from "../../api/adminExperienceApi";

export default function AddTour() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState([]);

  const { data: destinationsData = [], isLoading: destinationsLoading } = useQuery({ queryKey: ["destinations"], queryFn: getDestinations });
  const destinations = Array.isArray(destinationsData) ? destinationsData : destinationsData?.destinations || [];

  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useQuery({
    queryKey: ["tour-categories"],
    queryFn: getAdminExperiences,
  });

  const [form, setForm] = useState({ title: "", description: "", destination: "", country: "Kenya", location: "", date: "", duration: "", price: "", category: "", featured: false });

  const { mutate: saveTour, isPending: submitting } = useMutation({
    mutationFn: createTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      toast.success("Tour created successfully");
      navigate("/admin/manage-tours");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to create tour"),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.category) return toast.error("Select a tour category");
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    images.forEach((image) => data.append("images", image));
    saveTour(data);
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Tour</h1>
        <p className="mt-1 text-sm text-slate-500">Choose a destination and the tenant-managed travel experience category.</p>
      </div>
      <form onSubmit={submit} className="space-y-5 rounded-lg bg-white p-6 shadow">
        <input type="text" name="title" placeholder="Tour title" className="w-full rounded border px-4 py-3" value={form.title} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" rows="5" className="w-full rounded border px-4 py-3" value={form.description} onChange={handleChange} required />
        <select name="destination" className="w-full rounded border px-4 py-3" value={form.destination} onChange={handleChange} required>
          <option value="">Select Destination</option>
          {destinationsLoading && <option disabled>Loading destinations...</option>}
          {destinations.map((destination) => <option key={destination._id} value={destination._id}>{destination.name}</option>)}
        </select>
        <input type="text" name="country" placeholder="Country" className="w-full rounded border px-4 py-3" value={form.country} onChange={handleChange} required />
        <input type="text" name="location" placeholder="Location / meeting area (e.g. Diani Beach, Ukunda)" className="w-full rounded border px-4 py-3" value={form.location} onChange={handleChange} required />
        <input type="date" name="date" className="w-full rounded border px-4 py-3" value={form.date} onChange={handleChange} required />
        <input type="text" name="duration" placeholder="e.g. 3 Days" className="w-full rounded border px-4 py-3" value={form.duration} onChange={handleChange} required />
        <input type="number" name="price" placeholder="Price" className="w-full rounded border px-4 py-3" value={form.price} onChange={handleChange} required />

        <div>
          <label className="mb-1 block text-sm font-semibold">Tour Category</label>
          <select name="category" className="w-full rounded border px-4 py-3" value={form.category} onChange={handleChange} required disabled={categoriesLoading}>
            <option value="">{categoriesLoading ? "Loading categories..." : "Select category"}</option>
            {categories.map((category) => <option key={category._id} value={category.name}>{category.name}</option>)}
          </select>
          {categoriesError && <p className="mt-1 text-sm text-red-600">Unable to load your tenant categories. Open Admin → Tour Categories and create at least one active category.</p>}
          {!categoriesLoading && !categoriesError && categories.length === 0 && <p className="mt-1 text-sm text-amber-600">No categories configured. Open Admin → Tour Categories to add one.</p>}
        </div>

        <label className="flex items-center gap-3"><input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured Tour</label>
        <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files || []))} />
        {images.length > 0 && <p className="text-sm text-gray-600">{images.length} image(s) selected</p>}
        <button type="submit" disabled={submitting || categoriesLoading || categories.length === 0} className="rounded bg-green-600 px-8 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50">{submitting ? "Saving Tour..." : "Save Tour"}</button>
      </form>
    </div>
  );
}
