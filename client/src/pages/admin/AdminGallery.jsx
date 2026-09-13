import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Image as ImageIcon, Pencil, Trash2, Plus, X } from "lucide-react";
import api from "../../api/axios";
import { getAdminGallery, createGallery, updateGallery, deleteGallery } from "../../api/adminGalleryApi";
import { getAdminExperiences, createExperience, updateExperience, deleteExperience } from "../../api/adminExperienceApi";

const emptyGallery = { title: "", category: "Safari", imageUrl: "", publicId: "", featured: false, active: true };
const emptyExperience = { name: "", slug: "", icon: "Map", description: "", image: "", active: true };
const imageUrl = (item) => item?.image?.url || item?.image?.secure_url || item?.image?.path || item?.imageUrl || "";
const normalizeList = (value) => Array.isArray(value) ? value : value?.data || value?.gallery || value?.images || value?.categories || value?.experiences || [];

export default function AdminGallery() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("gallery");
  const [editingGallery, setEditingGallery] = useState(null);
  const [editingExperience, setEditingExperience] = useState(null);
  const [galleryForm, setGalleryForm] = useState(emptyGallery);
  const [experienceForm, setExperienceForm] = useState(emptyExperience);
  const [uploading, setUploading] = useState(false);

  const galleryQuery = useQuery({ queryKey: ["admin-gallery"], queryFn: getAdminGallery, staleTime: 0, refetchOnWindowFocus: true });
  const experienceQuery = useQuery({ queryKey: ["admin-experiences"], queryFn: getAdminExperiences, staleTime: 0, refetchOnWindowFocus: true });
  const gallery = useMemo(() => normalizeList(galleryQuery.data), [galleryQuery.data]);
  const experiences = useMemo(() => normalizeList(experienceQuery.data), [experienceQuery.data]);

  const refresh = () => { galleryQuery.refetch(); experienceQuery.refetch(); };
  const saveGallery = useMutation({ mutationFn: () => editingGallery ? updateGallery(editingGallery, galleryForm) : createGallery(galleryForm), onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-gallery"] }); setEditingGallery(null); setGalleryForm(emptyGallery); } });
  const removeGallery = useMutation({ mutationFn: deleteGallery, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-gallery"] }) });
  const saveExperience = useMutation({ mutationFn: () => editingExperience ? updateExperience(editingExperience, experienceForm) : createExperience(experienceForm), onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-experiences"] }); setEditingExperience(null); setExperienceForm(emptyExperience); } });
  const removeExperience = useMutation({ mutationFn: deleteExperience, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-experiences"] }) });

  const uploadImage = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/")) return window.alert("Please select an image file.");
    const data = new FormData(); data.append("image", file);
    try { setUploading(true); const response = await api.post("/admin/gallery/upload", data, { headers: { "Content-Type": "multipart/form-data" } }); const uploaded = response.data?.image || {}; setGalleryForm((prev) => ({ ...prev, imageUrl: uploaded.url || uploaded.secure_url || "", publicId: uploaded.publicId || "" })); }
    catch (error) { window.alert(error.response?.data?.message || "Image upload failed"); }
    finally { setUploading(false); }
  };

  const startGalleryEdit = (item) => { setEditingGallery(item._id); setGalleryForm({ title: item.title || "", category: item.category || "Safari", imageUrl: imageUrl(item), publicId: item.image?.publicId || "", featured: Boolean(item.featured), active: item.active !== false }); setTab("gallery"); };
  const startExperienceEdit = (item) => { setEditingExperience(item._id); setExperienceForm({ name: item.name || "", slug: item.slug || "", icon: item.icon || "Map", description: item.description || "", image: item.image || "", active: item.active !== false }); setTab("experiences"); };
  const loading = galleryQuery.isLoading || experienceQuery.isLoading;
  const error = galleryQuery.error || experienceQuery.error;

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-100 min-h-full">
      <header className="rounded-2xl bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><p className="text-sky-300 text-sm font-semibold uppercase tracking-wide">Administration</p><h1 className="text-2xl sm:text-3xl font-bold mt-1">Homepage Content Management</h1><p className="text-slate-300 mt-1">Manage the Gallery and Travel Experiences displayed on the public homepage.</p></div>
          <button onClick={refresh} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 font-semibold text-indigo-700 hover:bg-slate-100 disabled:opacity-60"><RefreshCw size={17} className={loading ? "animate-spin" : ""}/> Refresh</button>
        </div>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-center justify-between gap-3"><span>{error.response?.data?.message || error.message || "Unable to load homepage content."}</span><button onClick={refresh} className="font-semibold underline">Retry</button></div>}

      <div className="flex gap-2 border-b border-slate-300">
        <button className={`px-4 py-3 font-semibold ${tab === "gallery" ? "border-b-2 border-indigo-700 text-indigo-700" : "text-slate-500"}`} onClick={() => setTab("gallery")}>Gallery ({gallery.length})</button>
        <button className={`px-4 py-3 font-semibold ${tab === "experiences" ? "border-b-2 border-indigo-700 text-indigo-700" : "text-slate-500"}`} onClick={() => setTab("experiences")}>Travel Experiences ({experiences.length})</button>
      </div>

      {tab === "gallery" ? <section className="space-y-6">
        <div className="bg-white shadow-sm rounded-2xl p-5 space-y-4 border border-slate-200">
          <div className="flex items-center gap-2"><ImageIcon className="text-indigo-700" size={20}/><h2 className="text-xl font-semibold text-slate-900">{editingGallery ? "Edit Gallery Item" : "Add Gallery Item"}</h2></div>
          <div className="grid md:grid-cols-2 gap-4">
            <input className="border border-slate-300 p-3 rounded-lg w-full" placeholder="Gallery title" value={galleryForm.title} onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}/>
            <select className="border border-slate-300 p-3 rounded-lg w-full bg-white" value={galleryForm.category} onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}><option>Safari</option><option>Beach</option><option>Culture</option><option>Adventure</option><option>Vehicle</option></select>
          </div>
          <input type="file" accept="image/*" onChange={uploadImage} className="block w-full text-sm"/>
          {uploading && <p className="text-indigo-700 text-sm font-medium">Uploading image...</p>}
          {galleryForm.imageUrl && <img src={galleryForm.imageUrl} alt="Preview" className="w-full sm:w-64 h-40 object-cover rounded-xl border"/>}
          <div className="flex flex-wrap gap-5 text-sm"><label className="flex gap-2 items-center"><input type="checkbox" checked={galleryForm.featured} onChange={(e) => setGalleryForm({ ...galleryForm, featured: e.target.checked })}/> Featured on homepage</label><label className="flex gap-2 items-center"><input type="checkbox" checked={galleryForm.active} onChange={(e) => setGalleryForm({ ...galleryForm, active: e.target.checked })}/> Active</label></div>
          <div className="flex gap-2"><button disabled={uploading || saveGallery.isPending} onClick={() => saveGallery.mutate()} className="inline-flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-5 py-2.5 rounded-lg font-semibold"><Plus size={17}/>{saveGallery.isPending ? "Saving..." : editingGallery ? "Update Gallery" : "Add Gallery"}</button>{editingGallery && <button onClick={() => { setEditingGallery(null); setGalleryForm(emptyGallery); }} className="inline-flex items-center gap-2 border px-5 py-2.5 rounded-lg"><X size={17}/>Cancel</button>}</div>
        </div>

        {gallery.length === 0 && !galleryQuery.isLoading ? <div className="rounded-2xl bg-white border border-dashed border-slate-300 p-10 text-center"><ImageIcon className="mx-auto text-slate-400"/><h3 className="mt-3 font-semibold text-slate-800">No gallery items found</h3><p className="text-slate-500 mt-1">Add your first homepage image above.</p></div> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{gallery.map((item) => { const src = imageUrl(item); return <article key={item._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">{src ? <img src={src} alt={item.title || "Gallery item"} className="w-full h-48 object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }}/> : <div className="h-48 bg-slate-200 flex items-center justify-center text-slate-500"><ImageIcon/></div>}<div className="p-4 space-y-2"><h3 className="font-bold text-slate-900">{item.title || "Untitled gallery item"}</h3><p className="text-sm text-slate-500">{item.category || "Safari"} · {item.featured ? "Featured" : "Standard"} · {item.active !== false ? "Active" : "Hidden"}</p><div className="flex gap-2 pt-2"><button onClick={() => startGalleryEdit(item)} className="inline-flex items-center gap-1 bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm"><Pencil size={14}/>Edit</button><button onClick={() => window.confirm("Delete this gallery item?") && removeGallery.mutate(item._id)} disabled={removeGallery.isPending} className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm"><Trash2 size={14}/>Delete</button></div></div></article>; })}</div>}
      </section> : <section className="space-y-6">
        <div className="bg-white shadow-sm rounded-2xl p-5 space-y-4 border border-slate-200"><h2 className="text-xl font-semibold text-slate-900">{editingExperience ? "Edit Travel Experience" : "Add Travel Experience"}</h2><div className="grid md:grid-cols-2 gap-4"><input className="border border-slate-300 p-3 rounded-lg" placeholder="Name" value={experienceForm.name} onChange={(e) => setExperienceForm({ ...experienceForm, name: e.target.value })}/><input className="border border-slate-300 p-3 rounded-lg" placeholder="Slug (optional)" value={experienceForm.slug} onChange={(e) => setExperienceForm({ ...experienceForm, slug: e.target.value })}/><input className="border border-slate-300 p-3 rounded-lg" placeholder="Icon name" value={experienceForm.icon} onChange={(e) => setExperienceForm({ ...experienceForm, icon: e.target.value })}/><input className="border border-slate-300 p-3 rounded-lg" placeholder="Image URL" value={experienceForm.image} onChange={(e) => setExperienceForm({ ...experienceForm, image: e.target.value })}/></div><textarea className="border border-slate-300 p-3 rounded-lg w-full min-h-28" placeholder="Description" value={experienceForm.description} onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })}/><label className="flex gap-2 items-center"><input type="checkbox" checked={experienceForm.active} onChange={(e) => setExperienceForm({ ...experienceForm, active: e.target.checked })}/> Active on homepage</label><div className="flex gap-2"><button disabled={saveExperience.isPending} onClick={() => saveExperience.mutate()} className="bg-indigo-700 hover:bg-indigo-800 text-white px-5 py-2.5 rounded-lg font-semibold">{saveExperience.isPending ? "Saving..." : editingExperience ? "Update Experience" : "Add Experience"}</button>{editingExperience && <button onClick={() => { setEditingExperience(null); setExperienceForm(emptyExperience); }} className="border px-5 py-2.5 rounded-lg">Cancel</button>}</div></div>
        {experiences.length === 0 && !experienceQuery.isLoading ? <div className="rounded-2xl bg-white border border-dashed border-slate-300 p-10 text-center"><h3 className="font-semibold text-slate-800">No travel experiences found</h3></div> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{experiences.map((item) => <article key={item._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3">{item.image && <img src={item.image} alt={item.name || "Experience"} className="w-full h-40 object-cover rounded-xl"/>}<h3 className="text-lg font-bold">{item.name || "Untitled experience"}</h3><p className="text-sm text-slate-500">/{item.slug || ""} · {item.active !== false ? "Active" : "Hidden"}</p><p className="text-slate-700">{item.description || "No description provided."}</p><div className="flex gap-2"><button onClick={() => startExperienceEdit(item)} className="inline-flex items-center gap-1 bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm"><Pencil size={14}/>Edit</button><button onClick={() => window.confirm("Delete this travel experience?") && removeExperience.mutate(item._id)} className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm"><Trash2 size={14}/>Delete</button></div></article>)}</div>}
      </section>}
    </div>
  );
}
