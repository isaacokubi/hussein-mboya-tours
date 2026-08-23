import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import { getAdminGallery, createGallery, updateGallery, deleteGallery } from "../../api/adminGalleryApi";
import { getAdminExperiences, createExperience, updateExperience, deleteExperience } from "../../api/adminExperienceApi";

const emptyGallery = { title: "", category: "Safari", imageUrl: "", publicId: "", featured: false, active: true };
const emptyExperience = { name: "", slug: "", icon: "Map", description: "", image: "", active: true };

export default function AdminGallery() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("gallery");
  const [editingGallery, setEditingGallery] = useState(null);
  const [editingExperience, setEditingExperience] = useState(null);
  const [galleryForm, setGalleryForm] = useState(emptyGallery);
  const [experienceForm, setExperienceForm] = useState(emptyExperience);
  const [uploading, setUploading] = useState(false);

  const galleryQuery = useQuery({ queryKey: ["admin-gallery"], queryFn: getAdminGallery });
  const experienceQuery = useQuery({ queryKey: ["admin-experiences"], queryFn: getAdminExperiences });

  const saveGallery = useMutation({
    mutationFn: () => editingGallery ? updateGallery(editingGallery, galleryForm) : createGallery(galleryForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      setEditingGallery(null);
      setGalleryForm(emptyGallery);
    },
  });

  const removeGallery = useMutation({
    mutationFn: deleteGallery,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-gallery"] }),
  });

  const saveExperience = useMutation({
    mutationFn: () => editingExperience ? updateExperience(editingExperience, experienceForm) : createExperience(experienceForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-experiences"] });
      setEditingExperience(null);
      setExperienceForm(emptyExperience);
    },
  });

  const removeExperience = useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-experiences"] }),
  });

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("image", file);
    try {
      setUploading(true);
      const response = await api.post("/admin/gallery/upload", data, { headers: { "Content-Type": "multipart/form-data" } });
      setGalleryForm((prev) => ({ ...prev, imageUrl: response.data.image.url, publicId: response.data.image.publicId }));
    } catch (error) {
      console.error("GALLERY UPLOAD ERROR", error.response?.data || error.message);
      window.alert(error.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const startGalleryEdit = (item) => {
    setEditingGallery(item._id);
    setGalleryForm({ title: item.title || "", category: item.category || "Safari", imageUrl: item.image?.url || "", publicId: item.image?.publicId || "", featured: Boolean(item.featured), active: item.active !== false });
    setTab("gallery");
  };

  const startExperienceEdit = (item) => {
    setEditingExperience(item._id);
    setExperienceForm({ name: item.name || "", slug: item.slug || "", icon: item.icon || "Map", description: item.description || "", image: item.image || "", active: item.active !== false });
    setTab("experiences");
  };

  const error = galleryQuery.error || experienceQuery.error;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Homepage Content Management</h1>
        <p className="text-slate-600 mt-1">Manage the Gallery and Travel Experiences displayed on the public homepage.</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 text-red-700 p-4">{error.response?.data?.message || error.message || "Unable to load homepage content."}</div>}

      <div className="flex gap-2 border-b">
        <button className={`px-4 py-2 ${tab === "gallery" ? "border-b-2 border-slate-900 font-semibold" : "text-slate-500"}`} onClick={() => setTab("gallery")}>Gallery</button>
        <button className={`px-4 py-2 ${tab === "experiences" ? "border-b-2 border-slate-900 font-semibold" : "text-slate-500"}`} onClick={() => setTab("experiences")}>Travel Experiences</button>
      </div>

      {tab === "gallery" ? (
        <section className="space-y-6">
          <div className="bg-white shadow rounded-xl p-5 space-y-4">
            <h2 className="text-xl font-semibold">{editingGallery ? "Edit Gallery Item" : "Add Gallery Item"}</h2>
            <input className="border p-3 rounded w-full" placeholder="Gallery title" value={galleryForm.title} onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })} />
            <select className="border p-3 rounded w-full" value={galleryForm.category} onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}>
              <option>Safari</option><option>Beach</option><option>Culture</option><option>Adventure</option><option>Vehicle</option>
            </select>
            <input type="file" accept="image/*" onChange={uploadImage} />
            {uploading && <p className="text-blue-600">Uploading image...</p>}
            {galleryForm.imageUrl && <img src={galleryForm.imageUrl} alt="Preview" className="w-48 h-32 object-cover rounded" />}
            <label className="flex gap-2"><input type="checkbox" checked={galleryForm.featured} onChange={(e) => setGalleryForm({ ...galleryForm, featured: e.target.checked })} /> Featured on homepage</label>
            <label className="flex gap-2"><input type="checkbox" checked={galleryForm.active} onChange={(e) => setGalleryForm({ ...galleryForm, active: e.target.checked })} /> Active</label>
            <div className="flex gap-2">
              <button disabled={uploading || saveGallery.isPending} onClick={() => saveGallery.mutate()} className="bg-green-700 text-white px-5 py-2 rounded">{saveGallery.isPending ? "Saving..." : editingGallery ? "Update Gallery" : "Add Gallery"}</button>
              {editingGallery && <button onClick={() => { setEditingGallery(null); setGalleryForm(emptyGallery); }} className="border px-5 py-2 rounded">Cancel</button>}
            </div>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-5">
            {(galleryQuery.data || []).map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow overflow-hidden">
                <img src={item.image?.url} alt={item.title} className="w-full h-48 object-cover" />
                <div className="p-4 space-y-2">
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.category} · {item.featured ? "Featured" : "Standard"} · {item.active ? "Active" : "Hidden"}</p>
                  <div className="flex gap-2"><button onClick={() => startGalleryEdit(item)} className="bg-blue-600 text-white px-3 py-1 rounded">Edit</button><button onClick={() => window.confirm("Delete this gallery item?") && removeGallery.mutate(item._id)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-6">
          <div className="bg-white shadow rounded-xl p-5 space-y-4">
            <h2 className="text-xl font-semibold">{editingExperience ? "Edit Travel Experience" : "Add Travel Experience"}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input className="border p-3 rounded" placeholder="Name" value={experienceForm.name} onChange={(e) => setExperienceForm({ ...experienceForm, name: e.target.value })} />
              <input className="border p-3 rounded" placeholder="Slug (optional)" value={experienceForm.slug} onChange={(e) => setExperienceForm({ ...experienceForm, slug: e.target.value })} />
              <input className="border p-3 rounded" placeholder="Icon name" value={experienceForm.icon} onChange={(e) => setExperienceForm({ ...experienceForm, icon: e.target.value })} />
              <input className="border p-3 rounded" placeholder="Image URL" value={experienceForm.image} onChange={(e) => setExperienceForm({ ...experienceForm, image: e.target.value })} />
            </div>
            <textarea className="border p-3 rounded w-full min-h-28" placeholder="Description" value={experienceForm.description} onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })} />
            <label className="flex gap-2"><input type="checkbox" checked={experienceForm.active} onChange={(e) => setExperienceForm({ ...experienceForm, active: e.target.checked })} /> Active on homepage</label>
            <div className="flex gap-2"><button disabled={saveExperience.isPending} onClick={() => saveExperience.mutate()} className="bg-green-700 text-white px-5 py-2 rounded">{saveExperience.isPending ? "Saving..." : editingExperience ? "Update Experience" : "Add Experience"}</button>{editingExperience && <button onClick={() => { setEditingExperience(null); setExperienceForm(emptyExperience); }} className="border px-5 py-2 rounded">Cancel</button>}</div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(experienceQuery.data || []).map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow p-5 space-y-3">
                {item.image && <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded" />}
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-sm text-slate-500">/{item.slug} · {item.active ? "Active" : "Hidden"}</p>
                <p className="text-slate-700">{item.description}</p>
                <div className="flex gap-2"><button onClick={() => startExperienceEdit(item)} className="bg-blue-600 text-white px-3 py-1 rounded">Edit</button><button onClick={() => window.confirm("Delete this travel experience?") && removeExperience.mutate(item._id)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button></div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
