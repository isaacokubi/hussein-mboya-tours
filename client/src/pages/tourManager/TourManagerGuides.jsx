/**
 * Purpose: Tour Manager Guides page-level UI component. Main declarations: normalizeGuides, availabilityOf, availabilityLabel, availabilityClasses, displayName.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useMemo, useState } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useQuery } from "@tanstack/react-query";
// Load lucide-react so this module can use its exported dependencies.
import {
  AlertTriangle,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";
// Load ../../api/tourManagerApi so this module can use its exported dependencies.
import { getGuides } from "../../api/tourManagerApi";

// Declare normalizeGuides for use by the surrounding module or function.
const normalizeGuides = (response) => {
  // Check the condition (Array.isArray(response)) and run the matching branch.
  if (Array.isArray(response)) return response;
  // Check the condition (Array.isArray(response?.guides)) and run the matching branch.
  if (Array.isArray(response?.guides)) return response.guides;
  // Check the condition (Array.isArray(response?.data)) and run the matching branch.
  if (Array.isArray(response?.data)) return response.data;
  // Check the condition (Array.isArray(response?.data?.guides)) and run the matching branch.
  if (Array.isArray(response?.data?.guides)) return response.data.guides;
  // Check the condition (Array.isArray(response?.items)) and run the matching branch.
  if (Array.isArray(response?.items)) return response.items;
  // Return the collection assembled below to the caller.
  return [];
};

// Declare availabilityOf for use by the surrounding module or function.
const availabilityOf = (guide) => String(guide?.availability || "unknown").trim().toLowerCase();

// Declare availabilityLabel for use by the surrounding module or function.
const availabilityLabel = (value) => {
  // Check the condition (value === "available") and run the matching branch.
  if (value === "available") return "Available";
  // Check the condition (value === "busy") and run the matching branch.
  if (value === "busy") return "Busy";
  // Check the condition (value === "unavailable") and run the matching branch.
  if (value === "unavailable") return "Unavailable";
  // Check the condition (value === "on_leave" || value === "leave") and run the matching branch.
  if (value === "on_leave" || value === "leave") return "On leave";
  // Return a configured text value to the caller.
  return "Status unavailable";
};

// Declare availabilityClasses for use by the surrounding module or function.
const availabilityClasses = (value) => {
  // Check the condition (value === "available") and run the matching branch.
  if (value === "available") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  // Check the condition (value === "busy") and run the matching branch.
  if (value === "busy") return "bg-amber-50 text-amber-700 ring-amber-200";
  // Check the condition (value === "unavailable" || value === "on_leave" || value === "leave") and run the matching branch.
  if (value === "unavailable" || value === "on_leave" || value === "leave") return "bg-rose-50 text-rose-700 ring-rose-200";
  // Return a configured text value to the caller.
  return "bg-slate-100 text-slate-600 ring-slate-200";
};

// Declare displayName for use by the surrounding module or function.
const displayName = (guide) => {
  // Check the condition (guide?.name) and run the matching branch.
  if (guide?.name) return guide.name;
  // Declare fullName for use by the surrounding module or function.
  const fullName = [guide?.firstName, guide?.lastName].filter(Boolean).join(" ");
  // Return the expression shown below to the caller.
  return fullName || "Unnamed guide";
};

// Declare assignedCount for use by the surrounding module or function.
const assignedCount = (guide) => {
  // Check the condition (Array.isArray(guide?.assignedTours)) and run the matching branch.
  if (Array.isArray(guide?.assignedTours)) return guide.assignedTours.length;
  // Check the condition (Number.isFinite(Number(guide?.assignedTours))) and run the matching branch.
  if (Number.isFinite(Number(guide?.assignedTours))) return Number(guide.assignedTours);
  // Check the condition (Number.isFinite(Number(guide?.assignedTourCount))) and run the matching branch.
  if (Number.isFinite(Number(guide?.assignedTourCount))) return Number(guide.assignedTourCount);
  // Return the expression shown below to the caller.
  return null;
};

// Declare completedCount for use by the surrounding module or function.
const completedCount = (guide) => {
  // Check the condition (Number.isFinite(Number(guide?.completedTours))) and run the matching branch.
  if (Number.isFinite(Number(guide?.completedTours))) return Number(guide.completedTours);
  // Check the condition (Number.isFinite(Number(guide?.completedTourCount))) and run the matching branch.
  if (Number.isFinite(Number(guide?.completedTourCount))) return Number(guide.completedTourCount);
  // Return the expression shown below to the caller.
  return null;
};

// Declare contactValue for use by the surrounding module or function.
const contactValue = (value) => value ? String(value) : null;

// Define TourManagerGuides; its parameters and body implement this operation.
export default function TourManagerGuides() {
  // Declare [search, setSearch] for use by the surrounding module or function.
  const [search, setSearch] = useState("");

  // Declare guidesQuery for use by the surrounding module or function.
  const guidesQuery = useQuery({
    queryKey: ["tour-manager-guides"],
    queryFn: getGuides,
    staleTime: 30_000,
    retry: 1,
  });

  // Declare guides for use by the surrounding module or function.
  const guides = useMemo(() => {
    // Declare normalized for use by the surrounding module or function.
    const normalized = normalizeGuides(guidesQuery.data);
    // Return the result of Array.from() to the caller.
    return Array.from(
      new Map(
        normalized.filter(Boolean).map((guide, index) => [
          String(guide?._id || guide?.id || guide?.email || `guide-${index}`),
          guide,
        ])
      ).values()
    );
  }, [guidesQuery.data]);

  // Declare filtered for use by the surrounding module or function.
  const filtered = useMemo(() => {
    // Declare query for use by the surrounding module or function.
    const query = search.trim().toLowerCase();
    // Check the condition (!query) and run the matching branch.
    if (!query) return guides;

    // Return the result of guides.filter() to the caller.
    return guides.filter((guide) =>
      [
        displayName(guide),
        guide?.email,
        guide?.phone,
        guide?.position,
        guide?.role,
        availabilityOf(guide),
      ].some((value) => String(value || "").toLowerCase().includes(query))
    );
  }, [guides, search]);

  // Declare stats for use by the surrounding module or function.
  const stats = useMemo(() => {
    // Declare knownAvailability for use by the surrounding module or function.
    const knownAvailability = guides.filter((guide) => availabilityOf(guide) !== "unknown");
    // Return the object assembled below to the caller.
    return {
      total: guides.length,
      available: guides.filter((guide) => availabilityOf(guide) === "available").length,
      busy: guides.filter((guide) => availabilityOf(guide) === "busy").length,
      unknown: guides.length - knownAvailability.length,
    };
  }, [guides]);

  // Check the condition (guidesQuery.isLoading) and run the matching branch.
  if (guidesQuery.isLoading) {
    // Return the expression shown below to the caller.
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-36 rounded-3xl bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-3"><div className="h-28 rounded-2xl bg-white" /><div className="h-28 rounded-2xl bg-white" /><div className="h-28 rounded-2xl bg-white" /></div>
          <div className="h-14 rounded-2xl bg-white" />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"><div className="h-56 rounded-2xl bg-white" /><div className="h-56 rounded-2xl bg-white" /><div className="h-56 rounded-2xl bg-white" /></div>
        </div>
      </div>
    );
  }

  // Check the condition (guidesQuery.isError) and run the matching branch.
  if (guidesQuery.isError) {
    // Return the expression shown below to the caller.
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><XCircle size={25} /></div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-rose-600">People & assignments</p>
          <h1 className="mt-1 text-2xl font-black text-slate-900">Guide data unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">The guide service returned an error, so this page is not showing zero guides or an empty roster as though the tenant has no guides.</p>
          <p className="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-800">{guidesQuery.error?.response?.data?.message || guidesQuery.error?.message || "Unable to load guide operations."}</p>
          <button type="button" onClick={() => guidesQuery.refetch()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"><RefreshCw size={16} /> Retry</button>
        </div>
      </div>
    );
  }

  // Return the expression shown below to the caller.
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-xl sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
                <UsersRound size={14} /> People & assignments
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Guide Operations</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Monitor guide availability, workload and contact details before assigning tours.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Roster status</div>
              <div className="mt-1 flex items-center gap-2 text-sm font-bold"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Live tenant roster</div>
            </div>
          </div>
        </header>

        {stats.unknown > 0 && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm">
            <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={19} />
            <div><p className="font-bold">Availability telemetry is incomplete</p><p className="mt-1 text-sm text-amber-800">{stats.unknown} guide{stats.unknown === 1 ? " has" : "s have"} no recognized availability value, so it is not counted as available or busy.</p></div>
          </div>
        )}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {[
            ["Total guides", stats.total, "bg-indigo-50 text-indigo-700", UsersRound],
            ["Available now", stats.available, "bg-emerald-50 text-emerald-700", CheckCircle2],
            ["Currently busy", stats.busy, "bg-amber-50 text-amber-700", BriefcaseBusiness],
          ].map(([label, value, tone, Icon]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</p><span className={`rounded-xl p-2.5 ${tone}`}><Icon size={18} /></span></div>
              <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
              <Search size={19} className="shrink-0 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, phone, email, role or availability…" className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" />
            </div>
            <div className="text-sm font-semibold text-slate-500">Showing <span className="font-black text-slate-800">{filtered.length}</span> of <span className="font-black text-slate-800">{guides.length}</span> guides</div>
          </div>
        </section>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <Search className="mx-auto text-slate-400" size={30} />
            <h2 className="mt-3 text-lg font-black text-slate-800">No guides match the current filter</h2>
            <p className="mt-1 text-sm text-slate-500">Try a different search term or clear the filter.</p>
            {search && <button type="button" onClick={() => setSearch("")} className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">Clear search</button>}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((guide, index) => {
              const availability = availabilityOf(guide);
              const assigned = assignedCount(guide);
              const completed = completedCount(guide);
              const email = contactValue(guide?.email);
              const phone = contactValue(guide?.phone);

              return (
                <article key={String(guide?._id || guide?.id || guide?.email || index)} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg">
                  <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-blue-500 to-emerald-500" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"><UserRound size={23} /></div>
                        <div className="min-w-0"><h2 className="truncate text-lg font-black text-slate-900">{displayName(guide)}</h2><p className="mt-0.5 truncate text-sm capitalize text-slate-500">{String(guide?.position || guide?.role || "guide").replace(/[_-]/g, " ")}</p></div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${availabilityClasses(availability)}`}>{availabilityLabel(availability)}</span>
                    </div>

                    <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
                      <div className="flex min-w-0 items-center gap-3"><Mail size={16} className="shrink-0 text-slate-400" />{email ? <span className="truncate text-slate-700">{email}</span> : <span className="text-slate-400">Email not provided</span>}</div>
                      <div className="flex min-w-0 items-center gap-3"><Phone size={16} className="shrink-0 text-slate-400" />{phone ? <span className="text-slate-700">{phone}</span> : <span className="text-slate-400">Phone not provided</span>}</div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-3"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400"><BriefcaseBusiness size={13} /> Assigned tours</div><div className="mt-1 text-xl font-black text-slate-900">{assigned === null ? "—" : assigned}</div></div>
                      <div className="rounded-2xl bg-slate-50 p-3"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400"><CalendarDays size={13} /> Completed tours</div><div className="mt-1 text-xl font-black text-slate-900">{completed === null ? "—" : completed}</div></div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500"><ShieldCheck size={14} className="text-emerald-600" /> Assignment readiness is based on the reported availability status.</div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
