import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  MapPin,
  Pencil,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getManagerTours, deleteManagerTour } from "../../api/tourManagerApi";

const PAGE_SIZE = 10;
const DASH = "—";

function normalizeResponse(response) {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  return data?.tours || data?.data || data?.results || data?.items || [];
}

function getTourName(tour) {
  return tour?.title || tour?.name || "Untitled tour";
}

function getDestination(tour) {
  const value = tour?.destination;
  if (!value) return "Destination not assigned";
  if (typeof value === "string") return value;
  return value.name || value.title || value.city || value.country || "Destination not assigned";
}

function getStatus(tour) {
  const status = String(tour?.status || "draft").toLowerCase();
  if (["ongoing", "in-progress", "in_progress", "active"].includes(status)) return "active";
  if (["completed", "complete", "finished"].includes(status)) return "completed";
  if (["cancelled", "canceled"].includes(status)) return "cancelled";
  if (["upcoming", "scheduled"].includes(status)) return "upcoming";
  return "draft";
}

function getAssignmentStatus(tour) {
  const explicit = String(tour?.assignmentStatus || "").toLowerCase();
  if (explicit === "partial" || explicit.includes("partial")) return "partial";
  if (explicit === "assigned" || explicit === "completed" || explicit === "ready" || explicit.includes("assigned")) return "assigned";
  const resources = [tour?.assignedGuide || tour?.guide, tour?.assignedDriver || tour?.driver, tour?.assignedVehicle || tour?.vehicle];
  const count = resources.filter(Boolean).length;
  return count === 3 ? "assigned" : count > 0 ? "partial" : "pending";
}

function getPersonName(value) {
  if (!value) return "Unassigned";
  if (typeof value === "string") return value;
  return value.name || value.fullName || `${value.firstName || ""} ${value.lastName || ""}`.trim() || value.email || "Unassigned";
}

function getVehicleName(value) {
  if (!value) return "Unassigned";
  if (typeof value === "string") return value;
  return value.name || value.registrationNumber || value.registration || value.model || value.type || "Unassigned";
}

function getDate(tour, field) {
  const value = tour?.[field];
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  if (!value) return "Not scheduled";
  return value.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return DASH;
  const amount = Number(value);
  if (!Number.isFinite(amount)) return DASH;
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);
}

function getBookings(tour) {
  const value = tour?.bookedGuests ?? tour?.bookedSlots ?? tour?.totalGuests ?? tour?.guestsBooked ?? tour?.totalBookings;
  return value === null || value === undefined || value === "" ? null : Number(value);
}

function getCapacity(tour) {
  const value = tour?.capacity ?? tour?.maxGuests ?? tour?.availabilitySettings?.totalSlots;
  return value === null || value === undefined || value === "" ? null : Number(value);
}

const statusConfig = {
  upcoming: ["Upcoming", "border-blue-200 bg-blue-50 text-blue-700", Clock3],
  active: ["Active", "border-emerald-200 bg-emerald-50 text-emerald-700", PlayCircle],
  completed: ["Completed", "border-slate-200 bg-slate-100 text-slate-700", CheckCircle2],
  cancelled: ["Cancelled", "border-rose-200 bg-rose-50 text-rose-700", X],
  draft: ["Draft", "border-amber-200 bg-amber-50 text-amber-700", AlertCircle],
};

function StatusBadge({ status }) {
  const [label, classes, Icon] = statusConfig[status] || statusConfig.draft;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${classes}`}><Icon size={13} />{label}</span>;
}

function AssignmentBadge({ tour }) {
  const status = getAssignmentStatus(tour);
  const config = {
    assigned: ["Fully assigned", "border-emerald-200 bg-emerald-50 text-emerald-700"],
    partial: ["Partially assigned", "border-amber-200 bg-amber-50 text-amber-700"],
    pending: ["Needs assignment", "border-rose-200 bg-rose-50 text-rose-700"],
  }[status];
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${config[1]}`}>{config[0]}</span>;
}

function KpiCard({ label, value, icon: Icon, description, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-900 text-white",
    blue: "bg-blue-600 text-white",
    emerald: "bg-emerald-600 text-white",
    violet: "bg-violet-600 text-white",
    rose: "bg-rose-600 text-white",
  };
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{description}</p></div><div className={`rounded-xl p-3 shadow-sm ${tones[tone]}`}><Icon size={20} /></div></div></div>;
}

function TourCard({ tour, onView, onEdit, onDelete }) {
  const status = getStatus(tour);
  const bookings = getBookings(tour);
  const capacity = getCapacity(tour);
  const occupancy = Number.isFinite(bookings) && Number.isFinite(capacity) && capacity > 0 ? Math.min(100, Math.round((bookings / capacity) * 100)) : null;
  const start = getDate(tour, "startDate") || getDate(tour, "date");
  const end = getDate(tour, "endDate");
  const guide = tour?.assignedGuide || tour?.guide;
  const driver = tour?.assignedDriver || tour?.driver;
  const vehicle = tour?.assignedVehicle || tour?.vehicle;
  const price = tour?.discountPrice ?? tour?.finalPrice ?? tour?.price;

  return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/60 p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="mb-2 flex flex-wrap gap-2"><StatusBadge status={status} /><AssignmentBadge tour={tour} /></div><h3 className="truncate text-lg font-black text-slate-950">{getTourName(tour)}</h3><p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={15} />{getDestination(tour)}</p></div><button type="button" onClick={() => onView(tour)} className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-indigo-700" title="View tour"><Eye size={18} /></button></div></div><div className="grid grid-cols-2 gap-px bg-slate-100"><div className="bg-white p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Start</p><p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-700"><CalendarDays size={15} />{formatDate(start)}</p></div><div className="bg-white p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">End</p><p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-700"><CalendarDays size={15} />{formatDate(end)}</p></div></div><div className="p-5"><div className="mb-2 flex items-center justify-between"><span className="flex items-center gap-1.5 text-sm font-semibold text-slate-600"><Users size={16} />Capacity</span><span className="text-sm font-black text-slate-800">{bookings === null ? DASH : bookings} / {capacity === null ? DASH : capacity}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100">{occupancy !== null && <div className={`h-full rounded-full ${occupancy >= 90 ? "bg-rose-500" : occupancy >= 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${occupancy}%` }} />}</div><div className="mt-4 grid gap-3 text-sm"><div className="flex items-center gap-2 text-slate-600"><UserRound size={16} className="shrink-0 text-indigo-500" /><span className="truncate">Guide: <strong>{getPersonName(guide)}</strong></span></div><div className="flex items-center gap-2 text-slate-600"><UserRoundCheck size={16} className="shrink-0 text-blue-500" /><span className="truncate">Driver: <strong>{getPersonName(driver)}</strong></span></div><div className="flex items-center gap-2 text-slate-600"><Car size={16} className="shrink-0 text-emerald-500" /><span className="truncate">Vehicle: <strong>{getVehicleName(vehicle)}</strong></span></div></div></div><div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3"><div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Price</p><p className="font-black text-slate-900">{formatCurrency(price)}</p></div><div className="flex items-center gap-1"><button type="button" onClick={() => onView(tour)} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-indigo-700" title="View"><Eye size={17} /></button><button type="button" onClick={() => onEdit(tour)} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-blue-600" title="Edit"><Pencil size={17} /></button><button type="button" onClick={() => onDelete(tour)} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-rose-600" title="Delete"><Trash2 size={17} /></button></div></div></article>;
}

function EmptyState({ filtered, onClear, onCreate }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><MapPin size={26} /></div><h3 className="mt-4 text-lg font-black text-slate-950">{filtered ? "No tours match these filters" : "No tours available"}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{filtered ? "Try changing your search or operational filters." : "No tour records were returned for this tenant. Create a tour to begin managing operations."}</p><div className="mt-5 flex justify-center gap-2">{filtered && <button type="button" onClick={onClear} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Clear filters</button>}<button type="button" onClick={onCreate} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"><Plus size={17} />Create Tour</button></div></div>;
}

export default function TourManagerTours() {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const loadTours = useCallback(async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError("");
      const response = await getManagerTours({ page: 1, limit: 50 });
      const items = normalizeResponse(response);
      if (!Array.isArray(items)) throw new Error("The tours service returned an invalid response.");
      setTours(items);
    } catch (err) {
      console.error("Failed to load manager tours:", err);
      setError(err?.response?.data?.message || err?.message || "Unable to load tours.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadTours(); }, [loadTours]);

  const stats = useMemo(() => {
    const result = { total: tours.length, upcoming: 0, active: 0, completed: 0, needingAssignment: 0 };
    tours.forEach((tour) => { const status = getStatus(tour); if (status === "upcoming") result.upcoming += 1; if (status === "active") result.active += 1; if (status === "completed") result.completed += 1; if (getAssignmentStatus(tour) !== "assigned") result.needingAssignment += 1; });
    return result;
  }, [tours]);

  const filteredTours = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tours.filter((tour) => {
      const status = getStatus(tour);
      const assignment = getAssignmentStatus(tour);
      const matchesSearch = !query || [getTourName(tour), getDestination(tour), getPersonName(tour?.assignedGuide || tour?.guide), getPersonName(tour?.assignedDriver || tour?.driver)].some((value) => value.toLowerCase().includes(query));
      return matchesSearch && (statusFilter === "all" || status === statusFilter) && (assignmentFilter === "all" || assignment === assignmentFilter);
    });
  }, [tours, search, statusFilter, assignmentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTours.length / PAGE_SIZE));
  const visibleTours = useMemo(() => filteredTours.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredTours, page]);
  const filtered = Boolean(search || statusFilter !== "all" || assignmentFilter !== "all");

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const clearFilters = () => { setSearch(""); setStatusFilter("all"); setAssignmentFilter("all"); setPage(1); };
  const viewTour = (tour) => { const id = tour?._id || tour?.id; if (id) navigate(`/tour-manager/tours/${id}`); };
  const editTour = (tour) => { const id = tour?._id || tour?.id; if (id) navigate(`/tour-manager/tours/${id}/edit`); };

  const deleteTour = async (tour) => {
    const id = tour?._id || tour?.id;
    if (!id || !window.confirm(`Delete "${getTourName(tour)}"? This action cannot be undone.`)) return;
    try { setDeletingId(id); await deleteManagerTour(id); setTours((current) => current.filter((item) => String(item?._id || item?.id) !== String(id))); }
    catch (err) { window.alert(err?.response?.data?.message || err?.message || "Unable to delete this tour."); }
    finally { setDeletingId(null); }
  };

  return <div className="min-h-full bg-slate-50"><div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8"><header className="mb-6 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-lg"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-200"><span>Tour Operations</span><span className="text-white/40">/</span><span className="text-white">Tours</span></div><h1 className="text-3xl font-black tracking-tight">Tours Management</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Plan, monitor and coordinate every tour from one operational workspace.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => loadTours(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/15 disabled:opacity-60"><RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />Refresh</button><button type="button" onClick={() => navigate("/tour-manager/tours/create")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-emerald-400"><Plus size={18} />Create Tour</button></div></div></header>

<section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><KpiCard label="Total tours" value={error ? DASH : stats.total} icon={MapPin} description={error ? "Unavailable — service request failed" : "All tours in your operation"} tone="slate" /><KpiCard label="Upcoming" value={error ? DASH : stats.upcoming} icon={CalendarDays} description={error ? "Telemetry unavailable" : "Scheduled tours"} tone="blue" /><KpiCard label="Active" value={error ? DASH : stats.active} icon={PlayCircle} description={error ? "Telemetry unavailable" : "Currently operating"} tone="emerald" /><KpiCard label="Completed" value={error ? DASH : stats.completed} icon={CheckCircle2} description={error ? "Telemetry unavailable" : "Finished tours"} tone="violet" /><KpiCard label="Needs assignment" value={error ? DASH : stats.needingAssignment} icon={AlertCircle} description={error ? "Telemetry unavailable" : "Guide, driver or vehicle"} tone="rose" /></section>

<section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 xl:flex-row"><div className="relative flex-1"><Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search tours, destinations, guides or drivers..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100" /></div><select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400"><option value="all">All statuses</option><option value="draft">Draft</option><option value="upcoming">Upcoming</option><option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select><select value={assignmentFilter} onChange={(e) => { setAssignmentFilter(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400"><option value="all">All assignments</option><option value="assigned">Fully assigned</option><option value="partial">Partially assigned</option><option value="pending">Needs assignment</option></select>{filtered && <button type="button" onClick={clearFilters} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"><X size={16} />Clear</button>}</div><div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-400"><span>{error ? "Tour list unavailable" : <>Showing <strong className="text-slate-600">{filteredTours.length}</strong> matching tours</>}</span><span>{error ? "Live telemetry unavailable" : "Tenant-scoped operational data"}</span></div></section>

{error && <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm"><AlertCircle className="mt-0.5 shrink-0 text-rose-600" size={20} /><div className="flex-1"><p className="font-black">Tour data is unavailable</p><p className="mt-1 text-sm leading-6 text-rose-800">The tours service returned an error, so the dashboard is not displaying zeroes or an empty-tour state as if the tenant had no tours.</p><p className="mt-1 text-xs font-semibold text-rose-700">{error}</p></div><button type="button" onClick={() => loadTours(true)} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-rose-700 shadow-sm hover:bg-rose-100">Retry</button></div>}

{loading ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[390px] animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div> : error ? <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><AlertCircle size={27} /></div><h3 className="mt-4 text-lg font-black text-slate-950">Tours could not be read</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Retry the request after confirming the tenant session and API are available. No missing records are inferred from the failed request.</p><button type="button" onClick={() => loadTours(true)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"><RefreshCw size={16} />Retry</button></div> : visibleTours.length === 0 ? <EmptyState filtered={filtered} onClear={clearFilters} onCreate={() => navigate("/tour-manager/tours/create")} /> : <><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visibleTours.map((tour) => <div key={tour?._id || tour?.id} className={String(deletingId) === String(tour?._id || tour?.id) ? "pointer-events-none opacity-50" : ""}><TourCard tour={tour} onView={viewTour} onEdit={editTour} onDelete={deleteTour} /></div>)}</div><div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row"><p className="text-sm text-slate-500">Page <strong>{page}</strong> of <strong>{totalPages}</strong></p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((v) => v - 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50"><ChevronLeft size={16} />Previous</button><button type="button" disabled={page >= totalPages} onClick={() => setPage((v) => v + 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50">Next<ChevronRight size={16} /></button></div></div></>}
</div></div>;
}
