/**
 * Purpose: Tenant Hero Manager reusable UI component. Main declarations: TenantHeroManager, edit, field, submit.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useState } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Load lucide-react so this module can use its exported dependencies.
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load ../../api/adminHeroApi so this module can use its exported dependencies.
import { getAdminHeroSlides, createAdminHeroSlide, updateAdminHeroSlide, deleteAdminHeroSlide } from "../../api/adminHeroApi";

// Declare blank for use by the surrounding module or function.
const blank = { title: "", subtitle: "", badge: "Discover Africa", imageUrl: "", videoUrl: "", buttonOneText: "Explore Tours", buttonOneLink: "/tours", buttonTwoText: "Book Now", buttonTwoLink: "/contact", active: true, order: 0 };
// Define TenantHeroManager; its parameters and body implement this operation.
export default function TenantHeroManager() {
  // Declare qc for use by the surrounding module or function.
  const qc = useQueryClient(); const [form, setForm] = useState(null);
  // Declare { data, isLoading } for use by the surrounding module or function.
  const { data, isLoading } = useQuery({ queryKey: ["admin-hero-slides"], queryFn: getAdminHeroSlides });
  // Declare slides for use by the surrounding module or function.
  const slides = data?.slides || data?.data || [];
  // Declare save for use by the surrounding module or function.
  const save = useMutation({ mutationFn: x => x._id ? updateAdminHeroSlide({ id: x._id, ...x }) : createAdminHeroSlide(x), onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-hero-slides"] }); qc.invalidateQueries({ queryKey: ["heroSlides"] }); setForm(null); toast.success("Hero slider saved."); }, onError: e => toast.error(e?.response?.data?.message || "Unable to save hero slide") });
  // Declare remove for use by the surrounding module or function.
  const remove = useMutation({ mutationFn: deleteAdminHeroSlide, onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-hero-slides"] }); qc.invalidateQueries({ queryKey: ["heroSlides"] }); toast.success("Hero slide deleted."); } });
  // Declare edit for use by the surrounding module or function.
  const edit = s => setForm({ ...blank, _id: s._id, title: s.title || "", subtitle: s.subtitle || "", badge: s.badge || "", imageUrl: s.image?.url || "", videoUrl: s.video?.url || "", buttonOneText: s.buttonOne?.text || "Explore Tours", buttonOneLink: s.buttonOne?.link || "/tours", buttonTwoText: s.buttonTwo?.text || "Book Now", buttonTwoLink: s.buttonTwo?.link || "/contact", active: s.active !== false, order: s.order || 0 });
  // Declare field for use by the surrounding module or function.
  const field = (key, label, type="text") => <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>{type === "textarea" ? <textarea rows="2" value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/> : <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:type === "number" ? Number(e.target.value) : e.target.value})}/>}</label>;
  // Declare submit for use by the surrounding module or function.
  const submit = () => save.mutate(form);
  // Return the expression shown below to the caller.
  return <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-bold">Tenant Hero Slider</h2><p className="text-sm text-slate-500">These slides belong only to the current tenant.</p></div><button type="button" onClick={()=>setForm({...blank})} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 font-bold text-white"><Plus size={16}/> Add slide</button></div>
    {form && <div className="mb-5 rounded-xl border bg-slate-50 p-4"><div className="mb-3 flex justify-between"><h3 className="font-bold">{form._id ? "Edit slide" : "New slide"}</h3><button type="button" onClick={()=>setForm(null)}><X size={18}/></button></div><div className="grid gap-3 md:grid-cols-2">{field("title","Title")}{field("badge","Badge")}{field("subtitle","Description","textarea")}{field("imageUrl","Image URL")}{field("videoUrl","Video URL (optional)")}{field("order","Display order","number")}{field("buttonOneText","Primary button")}{field("buttonOneLink","Primary link")}{field("buttonTwoText","Secondary button")}{field("buttonTwoLink","Secondary link")}</div><label className="mt-3 flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/><span className="text-sm font-semibold">Published</span></label><div className="mt-4 flex justify-end"><button type="button" disabled={save.isPending} onClick={submit} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 font-bold text-white"><Save size={16}/>{save.isPending ? "Saving..." : "Save slide"}</button></div></div>}
    {isLoading ? <p className="text-sm text-slate-500">Loading slides...</p> : <div className="grid gap-3 md:grid-cols-2">{slides.map(s=><div key={s._id} className="flex gap-3 rounded-xl border p-3"><img src={s.image?.url || "/hero1.jpeg"} alt="" className="h-20 w-28 rounded-lg object-cover"/><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="truncate font-bold">{s.title}</p><span className="text-xs font-semibold">{s.active ? "Published" : "Draft"}</span></div><p className="truncate text-xs text-slate-500">{s.subtitle}</p><div className="mt-2 flex gap-2"><button type="button" onClick={()=>edit(s)} className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-semibold"><Pencil size={13}/> Edit</button><button type="button" onClick={()=>window.confirm("Delete this slide?") && remove.mutate(s._id)} className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-600"><Trash2 size={13}/> Delete</button></div></div></div>)}</div>}
  </div>;
}
