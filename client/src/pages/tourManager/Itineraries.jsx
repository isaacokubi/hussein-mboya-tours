import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  Eye,
  FilePlus2,
  Loader2,
  MapPin,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  createItinerary,
  deleteItinerary,
  getItineraries,
  getItinerary,
  getTours,
  updateItinerary,
} from "../../api/tourManagerApi";

const EMPTY_DAY = () => ({ dayNumber: 1, title: "Day 1", summary: "", activities: [] });
const EMPTY_ACTIVITY = () => ({
  title: "",
  startTime: "",
  endTime: "",
  description: "",
  location: "",
  meal: "none",
  accommodation: "",
  transport: "",
  notes: "",
});

const unwrap = (data, key) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data?.[key])) return data.data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const asArray = (value) => (Array.isArray(value) ? value : []);
const clean = (value) => String(value ?? "").trim();
const tourLabel = (tour) => tour?.title || tour?.name || tour?.tourName || "Tour not specified";
const destinationLabel = (tour) => {
  const destination = tour?.destination;
  if (typeof destination === "string") return destination;
  return destination?.name || destination?.title || tour?.location || "Destination not specified";
};

function statusClasses(status) {
  if (status === "published") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "archived") return "bg-slate-100 text-slate-600 ring-slate-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function Modal({ children, onClose, title, subtitle }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-w-5xl md:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-950 px-5 py-5 text-white md:px-7">
          <div><h2 className="text-xl font-bold">{title}</h2>{subtitle && <p className="mt-1 text-sm text-slate-300">{subtitle}</p>}</div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Close"><X size={20} /></button>
        </div>
        <div className="max-h-[calc(92vh-90px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function ItineraryForm({ initial, tours, onCancel, onSaved }) {
  const [form, setForm] = useState(() => ({
    tour: initial?.tour?._id || initial?.tour || "",
    overview: initial?.overview || "",
    status: initial?.status || "draft",
    highlights: asArray(initial?.highlights).join("\n"),
    included: asArray(initial?.included).join("\n"),
    excluded: asArray(initial?.excluded).join("\n"),
    days: asArray(initial?.days).length ? initial.days.map((day, index) => ({
      dayNumber: Number(day.dayNumber) || index + 1,
      title: day.title || `Day ${index + 1}`,
      summary: day.summary || "",
      activities: asArray(day.activities).map((a) => ({ ...EMPTY_ACTIVITY(), ...a })),
    })) : [EMPTY_DAY()],
  }));

  const [saving, setSaving] = useState(false);
  const updateDay = (index, patch) => setForm((prev) => ({ ...prev, days: prev.days.map((d, i) => i === index ? { ...d, ...patch } : d) }));
  const updateActivity = (dayIndex, activityIndex, patch) => setForm((prev) => ({
    ...prev,
    days: prev.days.map((d, i) => i !== dayIndex ? d : { ...d, activities: d.activities.map((a, j) => j === activityIndex ? { ...a, ...patch } : a) }),
  }));
  const addDay = () => setForm((prev) => ({ ...prev, days: [...prev.days, { ...EMPTY_DAY(), dayNumber: prev.days.length + 1, title: `Day ${prev.days.length + 1}` }] }));
  const removeDay = (index) => setForm((prev) => ({ ...prev, days: prev.days.filter((_, i) => i !== index).map((d, i) => ({ ...d, dayNumber: i + 1 })) }));
  const addActivity = (dayIndex) => setForm((prev) => ({ ...prev, days: prev.days.map((d, i) => i === dayIndex ? { ...d, activities: [...d.activities, EMPTY_ACTIVITY()] } : d) }));
  const removeActivity = (dayIndex, activityIndex) => setForm((prev) => ({ ...prev, days: prev.days.map((d, i) => i === dayIndex ? { ...d, activities: d.activities.filter((_, j) => j !== activityIndex) } : d) }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.tour) return toast.error("Select a tour before saving the itinerary.");
    if (!form.days.length) return toast.error("Add at least one itinerary day.");
    if (form.days.some((d) => !clean(d.title))) return toast.error("Every itinerary day needs a title.");
    const payload = {
      tour: form.tour,
      overview: clean(form.overview),
      status: form.status,
      highlights: form.highlights.split("\n").map(clean).filter(Boolean),
      included: form.included.split("\n").map(clean).filter(Boolean),
      excluded: form.excluded.split("\n").map(clean).filter(Boolean),
      days: form.days.map((d, index) => ({
        dayNumber: index + 1,
        title: clean(d.title),
        summary: clean(d.summary),
        activities: d.activities.map((a) => ({
          title: clean(a.title) || "Activity",
          startTime: clean(a.startTime),
          endTime: clean(a.endTime),
          description: clean(a.description),
          location: clean(a.location),
          meal: a.meal || "none",
          accommodation: clean(a.accommodation),
          transport: clean(a.transport),
          notes: clean(a.notes),
        })),
      })),
    };
    try {
      setSaving(true);
      const response = initial?._id ? await updateItinerary(initial._id, payload) : await createItinerary(payload);
      toast.success(response?.message || (initial?._id ? "Itinerary updated successfully." : "Itinerary created successfully."));
      onSaved();
    } catch (error) {
      toast.error(error?.response?.data?.message || "The itinerary could not be saved. No changes were applied.");
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-6 p-5 md:p-7">
      <section className="grid gap-5 md:grid-cols-3">
        <label className="md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Tour *</span>
          <select value={form.tour} onChange={(e) => setForm({ ...form, tour: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
            <option value="">Select a tour</option>{tours.map((tour) => <option key={tour._id} value={tour._id}>{tourLabel(tour)} — {destinationLabel(tour)}</option>)}
          </select>
        </label>
        <label><span className="mb-2 block text-sm font-semibold text-slate-700">Status</span>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select>
        </label>
      </section>
      <section className="grid gap-5 md:grid-cols-2">
        <label><span className="mb-2 block text-sm font-semibold text-slate-700">Overview</span><textarea rows="4" value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="Describe the experience and operating plan..." /></label>
        <div className="grid gap-4 md:grid-cols-3">
          <ListField label="Highlights" value={form.highlights} onChange={(v) => setForm({ ...form, highlights: v })} />
          <ListField label="Included" value={form.included} onChange={(v) => setForm({ ...form, included: v })} />
          <ListField label="Excluded" value={form.excluded} onChange={(v) => setForm({ ...form, excluded: v })} />
        </div>
      </section>
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-slate-900">Day-by-day schedule</h3><p className="text-sm text-slate-500">Build the operational schedule guests and staff will follow.</p></div><button type="button" onClick={addDay} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"><Plus size={17} /> Add day</button></div>
        {form.days.map((day, dayIndex) => (
          <div key={`day-${dayIndex}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
            <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">{dayIndex + 1}</span><div><input value={day.title} onChange={(e) => updateDay(dayIndex, { title: e.target.value })} className="rounded-lg border border-transparent bg-transparent px-2 py-1 font-bold text-slate-900 outline-none focus:border-slate-300 focus:bg-white" /><p className="px-2 text-xs text-slate-500">Day {dayIndex + 1}</p></div></div>{form.days.length > 1 && <button type="button" onClick={() => removeDay(dayIndex)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50" aria-label="Remove day"><Trash2 size={17} /></button>}</div>
            <textarea rows="2" value={day.summary} onChange={(e) => updateDay(dayIndex, { summary: e.target.value })} placeholder="Day summary" className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
            <div className="mt-4 space-y-3">{day.activities.map((activity, activityIndex) => (
              <div key={`activity-${dayIndex}-${activityIndex}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-emerald-700">Activity {activityIndex + 1}</span><button type="button" onClick={() => removeActivity(dayIndex, activityIndex)} className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"><Trash2 size={15} /></button></div>
                <div className="grid gap-3 md:grid-cols-4">
                  <Input label="Activity" value={activity.title} onChange={(v) => updateActivity(dayIndex, activityIndex, { title: v })} className="md:col-span-2" />
                  <Input label="Start" type="time" value={activity.startTime} onChange={(v) => updateActivity(dayIndex, activityIndex, { startTime: v })} />
                  <Input label="End" type="time" value={activity.endTime} onChange={(v) => updateActivity(dayIndex, activityIndex, { endTime: v })} />
                  <Input label="Location" value={activity.location} onChange={(v) => updateActivity(dayIndex, activityIndex, { location: v })} className="md:col-span-2" />
                  <label><span className="mb-1.5 block text-xs font-semibold text-slate-600">Meal</span><select value={activity.meal} onChange={(e) => updateActivity(dayIndex, activityIndex, { meal: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"><option value="none">None</option><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="snack">Snack</option></select></label>
                  <Input label="Transport" value={activity.transport} onChange={(v) => updateActivity(dayIndex, activityIndex, { transport: v })} />
                  <Input label="Accommodation" value={activity.accommodation} onChange={(v) => updateActivity(dayIndex, activityIndex, { accommodation: v })} className="md:col-span-2" />
                  <Input label="Description" value={activity.description} onChange={(v) => updateActivity(dayIndex, activityIndex, { description: v })} className="md:col-span-2" />
                  <Input label="Notes" value={activity.notes} onChange={(v) => updateActivity(dayIndex, activityIndex, { notes: v })} className="md:col-span-2" />
                </div>
              </div>
            ))}</div>
            <button type="button" onClick={() => addActivity(dayIndex)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100"><Plus size={15} /> Add activity</button>
          </div>
        ))}
      </section>
      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5"><button type="button" onClick={onCancel} className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{saving ? <Loader2 className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}{initial?._id ? "Save changes" : "Create itinerary"}</button></div>
    </form>
  );
}

function Input({ label, value, onChange, type = "text", className = "" }) {
  return <label className={className}><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span><input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" /></label>;
}
function ListField({ label, value, onChange }) { return <label><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span><textarea rows="4" value={value} onChange={(e) => onChange(e.target.value)} placeholder="One item per line" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" /></label>; }

export default function Itineraries() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [modal, setModal] = useState(null);
  const [menuId, setMenuId] = useState(null);

  const itineraryQuery = useQuery({ queryKey: ["tour-manager-itineraries"], queryFn: getItineraries, placeholderData: (previous) => previous });
  const toursQuery = useQuery({ queryKey: ["tour-manager-itinerary-tours"], queryFn: () => getTours({ limit: 200 }), staleTime: 60_000 });
  const items = useMemo(() => unwrap(itineraryQuery.data, "itineraries"), [itineraryQuery.data]);
  const tours = useMemo(() => unwrap(toursQuery.data, "tours"), [toursQuery.data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const haystack = [item.title, item.name, item.overview, tourLabel(item.tour), destinationLabel(item.tour)].join(" ").toLowerCase();
      return (!q || haystack.includes(q)) && (status === "all" || item.status === status);
    });
  }, [items, search, status]);

  const deleteMutation = useMutation({
    mutationFn: deleteItinerary,
    onSuccess: (response) => { toast.success(response?.message || "Itinerary deleted successfully."); queryClient.invalidateQueries({ queryKey: ["tour-manager-itineraries"] }); setMenuId(null); },
    onError: (error) => toast.error(error?.response?.data?.message || "The itinerary could not be deleted. No changes were applied."),
  });

  const openEdit = async (item) => {
    try {
      const response = await getItinerary(item._id);
      setModal({ type: "edit", item: response?.itinerary || response?.data || item });
    } catch (error) { toast.error(error?.response?.data?.message || "Unable to load the itinerary details."); }
    finally { setMenuId(null); }
  };

  const confirmDelete = (item) => {
    setMenuId(null);
    if (window.confirm(`Delete the itinerary for ${tourLabel(item.tour)}? This cannot be undone.`)) deleteMutation.mutate(item._id);
  };

  const published = items.filter((x) => x.status === "published").length;
  const drafts = items.filter((x) => x.status === "draft").length;
  const days = items.reduce((sum, x) => sum + asArray(x.days).length, 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
        <div className="mx-auto max-w-[1600px] px-4 py-7 md:px-8 md:py-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300"><CalendarRange size={14} /> Tour Operations</div><h1 className="text-3xl font-black tracking-tight md:text-4xl">Itinerary Operations Center</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">Build, publish and maintain guest-ready day-by-day schedules for every tenant tour.</p></div>
            <button onClick={() => itineraryQuery.refetch()} disabled={itineraryQuery.isFetching} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 font-bold text-white hover:bg-white/15 disabled:opacity-60">{itineraryQuery.isFetching ? <RefreshCw className="animate-spin" size={17} /> : <RefreshCw size={17} />} Refresh</button>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Itineraries" value={itineraryQuery.isError ? "—" : items.length} icon={<FilePlus2 size={18} />} />
            <Metric label="Published" value={itineraryQuery.isError ? "—" : published} icon={<CheckCircle2 size={18} />} accent="emerald" />
            <Metric label="Drafts" value={itineraryQuery.isError ? "—" : drafts} icon={<Edit3 size={18} />} accent="amber" />
            <Metric label="Scheduled days" value={itineraryQuery.isError ? "—" : days} icon={<Clock3 size={18} />} accent="blue" />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 md:px-8 md:py-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="relative min-w-0 flex-1 md:max-w-xl"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search itinerary, tour or destination..." className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" /></div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 font-semibold text-slate-700 outline-none focus:border-emerald-500"><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select>
          </div>
          <button onClick={() => setModal({ type: "create" })} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white shadow-sm hover:bg-emerald-700"><Plus size={18} /> Create itinerary</button>
        </div>

        {itineraryQuery.isLoading && <LoadingState />}
        {itineraryQuery.isError && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h2 className="font-bold text-rose-900">Itineraries are unavailable</h2><p className="mt-1 text-sm text-rose-700">The itinerary service did not return a usable response. This is not reported as zero records.</p></div><button onClick={() => itineraryQuery.refetch()} className="rounded-xl bg-rose-700 px-4 py-2.5 font-bold text-white hover:bg-rose-800">Retry</button></div></div>}
        {!itineraryQuery.isLoading && !itineraryQuery.isError && !filtered.length && <EmptyState hasFilters={Boolean(search || status !== "all")} onCreate={() => setModal({ type: "create" })} />}

        {!itineraryQuery.isLoading && !itineraryQuery.isError && filtered.length > 0 && <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const itemDays = asArray(item.days);
            const activityCount = itemDays.reduce((sum, day) => sum + asArray(day.activities).length, 0);
            return <article key={item._id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${statusClasses(item.status)}`}>{item.status || "draft"}</span><span className="text-xs font-semibold text-slate-400">{itemDays.length} {itemDays.length === 1 ? "day" : "days"}</span></div><h2 className="line-clamp-2 text-lg font-black text-slate-900">{tourLabel(item.tour)}</h2><p className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-500"><MapPin size={14} /> {destinationLabel(item.tour)}</p></div>
                  <div className="relative"><button onClick={() => setMenuId(menuId === item._id ? null : item._id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Itinerary actions"><MoreHorizontal size={19} /></button>{menuId === item._id && <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"><button onClick={() => openEdit(item)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50"><Edit3 size={15} /> Edit</button><button onClick={() => confirmDelete(item)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"><Trash2 size={15} /> Delete</button></div>}</div>
                </div>
                <p className="mt-4 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-600">{item.overview || "No overview has been provided for this itinerary."}</p>
                <div className="mt-5 grid grid-cols-2 gap-2 border-y border-slate-100 py-4 text-sm"><div><span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Activities</span><strong className="mt-1 block text-slate-900">{activityCount}</strong></div><div><span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Updated</span><strong className="mt-1 block text-slate-900">{item.updatedAt ? new Intl.DateTimeFormat("en-KE", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(item.updatedAt)) : "Unavailable"}</strong></div></div>
                <div className="mt-4 flex items-center gap-2"><button onClick={() => openEdit(item)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"><Eye size={16} /> Review & edit</button><div className="rounded-xl bg-emerald-50 px-3 py-2.5 text-emerald-700" title="Meal planning available in activities"><Utensils size={17} /></div></div>
              </div>
            </article>;
          })}
        </div>}
      </main>

      {modal && <Modal title={modal.type === "create" ? "Create itinerary" : "Edit itinerary"} subtitle="Tenant-scoped tour schedule and guest experience planning." onClose={() => setModal(null)}><ItineraryForm initial={modal.item} tours={tours} onCancel={() => setModal(null)} onSaved={() => { setModal(null); queryClient.invalidateQueries({ queryKey: ["tour-manager-itineraries"] }); }} /></Modal>}
    </div>
  );
}

function Metric({ label, value, icon, accent = "slate" }) { const colors = { slate: "bg-white/10 text-white", emerald: "bg-emerald-400/15 text-emerald-300", amber: "bg-amber-400/15 text-amber-300", blue: "bg-sky-400/15 text-sky-300" }; return <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur"><div className={`mb-3 inline-flex rounded-xl p-2 ${colors[accent] || colors.slate}`}>{icon}</div><div className="text-2xl font-black">{value}</div><div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div></div>; }
function LoadingState() { return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[1,2,3].map((x) => <div key={x} className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div>; }
function EmptyState({ hasFilters, onCreate }) { return <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><CalendarRange size={28} /></div><h2 className="mt-4 text-xl font-black text-slate-900">{hasFilters ? "No matching itineraries" : "No itineraries yet"}</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{hasFilters ? "Try clearing the search or status filter." : "Create the first day-by-day operating schedule for a tour. It can remain a draft until your team is ready to publish it."}</p>{hasFilters ? <button onClick={() => window.location.reload()} className="mt-5 rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50">Clear filters</button> : <button onClick={onCreate} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700"><Plus size={17} /> Create itinerary</button>}</div>; }
