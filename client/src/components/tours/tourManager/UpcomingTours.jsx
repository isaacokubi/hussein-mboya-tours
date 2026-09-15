import { CalendarDays, Car, CheckCircle2, MapPin, UserRound, Users } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "Date not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date not set" : date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
};

const resourceName = (resource, fallback = "Not assigned") => {
  if (!resource) return fallback;
  if (typeof resource === "string") return resource.trim() || fallback;
  const name = [resource.name, resource.fullName, [resource.firstName, resource.lastName].filter(Boolean).join(" "), resource.registrationNumber, resource.registration].find((value) => String(value || "").trim());
  return name || fallback;
};

const statusClass = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "confirmed": return "bg-sky-50 text-sky-700 ring-sky-200";
    case "ongoing":
    case "active": return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "cancelled": return "bg-rose-50 text-rose-700 ring-rose-200";
    default: return "bg-amber-50 text-amber-700 ring-amber-200";
  }
};

export default function UpcomingTours({ tours = [] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><CalendarDays size={20} /></div><div><h2 className="text-lg font-bold text-slate-950">Upcoming Tours</h2><p className="text-sm text-slate-500">Scheduled tenant tours and live resource assignments</p></div></div>
        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{tours.length} scheduled</span>
      </div>

      {tours.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center"><CalendarDays className="mx-auto text-slate-400" size={28} /><p className="mt-3 font-semibold text-slate-800">No upcoming tours</p><p className="mt-1 text-sm text-slate-500">Scheduled tenant tours will appear here when available.</p></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {tours.map((tour) => {
            const status = typeof tour.status === "object" ? tour.status?.status || "upcoming" : tour.status || "upcoming";
            const guide = tour.assignedGuide || tour.guide;
            const driver = tour.assignedDriver || tour.driver;
            const vehicle = tour.assignedVehicle || tour.vehicle;
            const guests = Number(tour.guests ?? tour.bookedSlots ?? tour.bookedSeats ?? tour.totalGuests ?? 0);
            const capacity = Number(tour.capacity || 0);
            const occupancy = Math.min(100, Math.max(0, Number(tour.occupancyRate ?? (capacity ? Math.round((guests / capacity) * 100) : 0))));
            const startDate = tour.startDate || tour.date;
            const endDate = tour.endDate;
            return (
              <article key={tour._id || tour.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 to-slate-50 px-5 py-4">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-base font-bold text-slate-950">{tour.title || tour.name || "Untitled tour"}</h3><p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={14} className="text-emerald-700" />{tour.destination?.name || tour.location || "Destination not set"}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ${statusClass(status)}`}>{String(status).replace(/_/g, " ")}</span></div>
                </div>
                <div className="space-y-4 p-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Guests</p><p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800"><Users size={15} className="text-emerald-700" />{guests}{capacity ? ` / ${capacity}` : ""}</p></div>
                    <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Occupancy</p><p className="mt-1 text-sm font-semibold text-slate-800">{capacity ? `${occupancy}%` : "Capacity not set"}</p>{capacity > 0 && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${occupancy}%` }} /></div>}</div>
                  </div>
                  <div className="grid gap-2 text-sm sm:grid-cols-3">
                    <div className="flex items-center gap-2 text-slate-600"><UserRound size={15} className="text-slate-400" /><span className="truncate" title={resourceName(guide)}>{resourceName(guide)}</span></div>
                    <div className="flex items-center gap-2 text-slate-600"><UserRound size={15} className="text-slate-400" /><span className="truncate" title={resourceName(driver)}>{resourceName(driver)}</span></div>
                    <div className="flex items-center gap-2 text-slate-600"><Car size={15} className="text-slate-400" /><span className="truncate" title={resourceName(vehicle)}>{resourceName(vehicle)}</span></div>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500"><span>{formatDate(startDate)}{endDate ? ` – ${formatDate(endDate)}` : ""}</span><span className="inline-flex items-center gap-1 font-semibold text-emerald-700"><CheckCircle2 size={13} /> Operations view</span></div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
