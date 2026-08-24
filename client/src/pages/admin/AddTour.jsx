import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createTour } from "../../api/adminTourApi";
import { getDestinations } from "../../api/adminDestinationApi";
import { createExperience, deleteExperience, getAdminExperiences, updateExperience } from "../../api/adminExperienceApi";

const emptyCategory = { name: "", slug: "", description: "", icon: "Map", image: "", active: true };
const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AddTour() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState([]);
  const [manageCategories, setManageCategories] = useState(false);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const { data: destinationsData = [], isLoading: destinationsLoading } = useQuery({ queryKey: ["destinations"], queryFn: getDestinations });
  const destinations = Array.isArray(destinationsData) ? destinationsData : destinationsData?.destinations || [];
  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useQuery({ queryKey: ["tour-categories"], queryFn: getAdminExperiences });

  const [form, setForm] = useState({ title: "", description: "", destination: "", country: "Kenya", location: "", date: "", duration: "", price: "", category: "", featured: false });

  const saveCategoryMutation = useMutation({
    mutationFn: ({ id, payload }) => id ? updateExperience(id, payload) : createExperience(payload),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["tour-categories"] });
      const name = saved?.name || categoryForm.name.trim();
      if (!editingCategoryId) setForm((current) => ({ ...current, category: name }));
      setCategoryForm(emptyCategory); setEditingCategoryId(null);
      toast.success(editingCategoryId ? "Category updated" : "Category created");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to save category"),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tour-categories"] }); if (form.category && !categories.some((c) => c.name === form.category)) setForm((current) => ({ ...current, category: "" })); toast.success("Category deleted"); },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to delete category"),
  });

  const { mutate: saveTour, isPending: submitting } = useMutation({
    mutationFn: createTour,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tours"] }); toast.success("Tour created successfully"); navigate("/admin/manage-tours"); },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to create tour"),
  });

  const handleChange = (e) => { const { name, value, type, checked } = e.target; setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value })); };
  const submit = (e) => { e.preventDefault(); if (!form.category) return toast.error("Select a tour category"); const data = new FormData(); Object.entries(form).forEach(([key, value]) => data.append(key, value)); images.forEach((image) => data.append("images", image)); saveTour(data); };
  const saveCategory = (e) => { e.preventDefault(); const name = categoryForm.name.trim(); if (!name) return toast.error("Category name is required"); saveCategoryMutation.mutate({ id: editingCategoryId, payload: { ...categoryForm, name, slug: slugify(categoryForm.slug || name), description: categoryForm.description.trim() } }); };

  return (
    <div className="max-w-3xl">
      <div className="mb-6"><h1 className="text-2xl font-bold">Add New Tour</h1><p className="mt-1 text-sm text-slate-500">The category selector is the type of travel experience this tour belongs to.</p></div>
      <form onSubmit={submit} className="space-y-5 rounded-lg bg-white p-6 shadow">
        <input type="text" name="title" placeholder="Tour title" className="w-full rounded border px-4 py-3" value={form.title} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" rows="5" className="w-full rounded border px-4 py-3" value={form.description} onChange={handleChange} required />
        <select name="destination" className="w-full rounded border px-4 py-3" value={form.destination} onChange={handleChange} required><option value="">Select Destination</option>{destinationsLoading && <option disabled>Loading destinations...</option>}{destinations.map((destination) => <option key={destination._id} value={destination._id}>{destination.name}</option>)}</select>
        <input type="text" name="country" placeholder="Country" className="w-full rounded border px-4 py-3" value={form.country} onChange={handleChange} required />
        <input type="text" name="location" placeholder="Location / meeting area (e.g. Diani Beach, Ukunda)" className="w-full rounded border px-4 py-3" value={form.location} onChange={handleChange} required />
        <input type="date" name="date" className="w-full rounded border px-4 py-3" value={form.date} onChange={handleChange} required />
        <input type="text" name="duration" placeholder="e.g. 3 Days" className="w-full rounded border px-4 py-3" value={form.duration} onChange={handleChange} required />
        <input type="number" name="price" placeholder="Price" className="w-full rounded border px-4 py-3" value={form.price} onChange={handleChange} required />

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div className="flex-1"><label className="mb-1 block text-sm font-semibold">Tour Category</label><select name="category" className="w-full rounded border bg-white px-4 py-3" value={form.category} onChange={handleChange} required disabled={categoriesLoading}><option value="">{categoriesLoading ? "Loading categories..." : "Select category"}</option>{categories.filter((c) => c.active !== false).map((category) => <option key={category._id} value={category.name}>{category.name}</option>)}</select></div><button type="button" onClick={() => setManageCategories((v) => !v)} className="rounded-lg border bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100">{manageCategories ? "Close category manager" : "Manage categories"}</button></div>
          {categoriesError && <p className="mt-2 text-sm text-red-600">Unable to load tenant categories.</p>}
          {manageCategories && <div className="mt-4 space-y-4 rounded-lg bg-white p-4 ring-1 ring-slate-200">
            <div><h2 className="font-bold">Tenant Tour Categories</h2><p className="text-xs text-slate-500">These names are used by every tour in this tenant. Adding or editing them does not affect another company.</p></div>
            <form onSubmit={saveCategory} className="grid gap-3 md:grid-cols-2">
              <input className="rounded border px-3 py-2" placeholder="Category name e.g. Luxury Safaris" value={categoryForm.name} onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))} required />
              <input className="rounded border px-3 py-2" placeholder="slug e.g. luxury-safaris" value={categoryForm.slug} onChange={(e) => setCategoryForm((p) => ({ ...p, slug: e.target.value }))} />
              <input className="rounded border px-3 py-2" placeholder="Icon name" value={categoryForm.icon} onChange={(e) => setCategoryForm((p) => ({ ...p, icon: e.target.value }))} />
              <input className="rounded border px-3 py-2" placeholder="Image URL (optional)" value={categoryForm.image} onChange={(e) => setCategoryForm((p) => ({ ...p, image: e.target.value }))} />
              <textarea className="rounded border px-3 py-2 md:col-span-2" rows="2" placeholder="Category description" value={categoryForm.description} onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))} required />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={categoryForm.active} onChange={(e) => setCategoryForm((p) => ({ ...p, active: e.target.checked }))} /> Active</label>
              <div className="flex gap-2 md:justify-end"><button disabled={saveCategoryMutation.isPending} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white">{saveCategoryMutation.isPending ? "Saving..." : editingCategoryId ? "Update Category" : "Add Category"}</button>{editingCategoryId && <button type="button" onClick={() => { setEditingCategoryId(null); setCategoryForm(emptyCategory); }} className="rounded-lg border px-4 py-2 text-sm font-bold">Cancel</button>}</div>
            </form>
            <div className="divide-y rounded-lg border">{categories.length === 0 ? <p className="p-4 text-sm text-slate-500">No categories configured yet.</p> : categories.map((category) => <div key={category._id} className="flex items-center justify-between gap-3 p-3"><div><p className="font-semibold">{category.name} {!category.active && <span className="text-xs text-slate-400">(inactive)</span>}</p><p className="text-xs text-slate-500">{category.slug}</p></div><div className="flex gap-2"><button type="button" onClick={() => { setEditingCategoryId(category._id); setCategoryForm({ name: category.name || "", slug: category.slug || "", description: category.description || "", icon: category.icon || "Map", image: category.image || "", active: category.active !== false }); }} className="rounded border px-3 py-1 text-xs font-bold">Edit</button><button type="button" onClick={() => window.confirm(`Delete ${category.name}?`) && deleteCategoryMutation.mutate(category._id)} className="rounded border border-red-200 px-3 py-1 text-xs font-bold text-red-600">Delete</button></div></div>)}</div>
          </div>}
        </div>

        <label className="flex items-center gap-3"><input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured Tour</label>
        <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files || []))} />
        {images.length > 0 && <p className="text-sm text-gray-600">{images.length} image(s) selected</p>}
        <button type="submit" disabled={submitting || categoriesLoading || categories.filter((c) => c.active !== false).length === 0} className="rounded bg-green-600 px-8 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50">{submitting ? "Saving Tour..." : "Save Tour"}</button>
      </form>
    </div>
  );
}
