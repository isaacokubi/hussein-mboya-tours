import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { createExperience, deleteExperience, getAdminExperiences, updateExperience } from "../../api/adminExperienceApi";

const emptyForm = { name: "", slug: "", description: "", icon: "Map", image: "", active: true };

const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);

  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ["admin-tour-categories"],
    queryFn: getAdminExperiences,
  });

  const sortedCategories = useMemo(() => [...categories].sort((a, b) => String(a.name).localeCompare(String(b.name))), [categories]);

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) => id ? updateExperience(id, payload) : createExperience(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tour-categories"] });
      queryClient.invalidateQueries({ queryKey: ["tour-categories"] });
      setForm(emptyForm);
      setEditingId(null);
      setOpen(false);
      toast.success(editingId ? "Tour category updated" : "Tour category created");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to save tour category"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tour-categories"] });
      queryClient.invalidateQueries({ queryKey: ["tour-categories"] });
      toast.success("Tour category deleted");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to delete tour category"),
  });

  const startCreate = () => { setForm(emptyForm); setEditingId(null); setOpen(true); };
  const startEdit = (category) => {
    setEditingId(category._id);
    setForm({ name: category.name || "", slug: category.slug || "", description: category.description || "", icon: category.icon || "Map", image: category.image || "", active: category.active !== false });
    setOpen(true);
  };

  const submit = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return toast.error("Category name is required");
    saveMutation.mutate({ id: editingId, payload: { ...form, name, slug: slugify(form.slug || name), description: form.description.trim() } });
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Tour configuration</p>
          <h1 className="mt-1 text-2xl font-black text-slate-900">Tour Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Manage the categories shown in Add Tour and used to classify your tenant's travel experiences.</p>
        </div>
        <button onClick={startCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700"><Plus size={18} /> Add Category</button>
      </div>

      {open && (
        <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-bold">{editingId ? "Edit Category" : "New Category"}</h2><p className="text-sm text-slate-500">Changes apply only to this tenant.</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button></div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">Name<input className="mt-1 w-full rounded-xl border p-3 font-normal" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Luxury Safaris" required /></label>
            <label className="text-sm font-semibold">Slug<input className="mt-1 w-full rounded-xl border p-3 font-normal" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="luxury-safaris" /></label>
            <label className="text-sm font-semibold">Icon<input className="mt-1 w-full rounded-xl border p-3 font-normal" value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} placeholder="Map" /></label>
            <label className="text-sm font-semibold">Image URL<input className="mt-1 w-full rounded-xl border p-3 font-normal" value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} placeholder="https://..." /></label>
            <label className="text-sm font-semibold md:col-span-2">Description<textarea className="mt-1 w-full rounded-xl border p-3 font-normal" rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe this type of travel experience" required /></label>
            <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} /> Active category</label>
          </div>
          <div className="mt-5 flex gap-3"><button disabled={saveMutation.isPending} className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-50">{saveMutation.isPending ? "Saving..." : "Save Category"}</button><button type="button" onClick={() => setOpen(false)} className="rounded-xl border px-5 py-3 font-bold">Cancel</button></div>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {isLoading ? <div className="p-8 text-center text-slate-500">Loading categories...</div> : isError ? <div className="p-8 text-center text-red-600">Unable to load tenant categories.</div> : sortedCategories.length === 0 ? <div className="p-10 text-center text-slate-500">No categories yet. Add your first travel experience category.</div> : (
          <div className="divide-y">
            {sortedCategories.map((category) => (
              <div key={category._id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div><div className="flex items-center gap-2"><h3 className="font-bold text-slate-900">{category.name}</h3><span className={`rounded-full px-2 py-1 text-xs font-bold ${category.active === false ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700"}`}>{category.active === false ? "Inactive" : "Active"}</span></div><p className="text-sm text-slate-500">/{category.slug}</p>{category.description && <p className="mt-1 text-sm text-slate-600">{category.description}</p>}</div>
                <div className="flex gap-2"><button onClick={() => startEdit(category)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold hover:bg-slate-50"><Pencil size={16} /> Edit</button><button onClick={() => { if (window.confirm(`Delete ${category.name}? Existing tours keep their category text, but new tours will no longer be able to select it.`)) deleteMutation.mutate(category._id); }} disabled={deleteMutation.isPending} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"><Trash2 size={16} /> Delete</button></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
