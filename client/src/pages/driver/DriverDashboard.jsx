import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Car,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Fuel,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Users,
  Wrench,
  Play,
  Flag,
  Gauge,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getDriverDashboard,
  getDriverAssignedTours,
  updateDriverTourStatus,
} from "../../api/driverApi";
import { firstNumeric, numeric, unwrapData } from "../../utils/dashboardData";

const idOf = (value) => value?._id || value?.id || value;
const clean = (value) => String(value ?? "").trim();
const startOfDay = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};
const tourStart = (tour) => tour?.startDate || tour?.date || tour?.tourDate || tour?.travelDate;
const tourEnd = (tour) => {
  if (tour?.endDate) return tour.endDate;
  const start = tourStart(tour);
  if (!start) return null;
  const days = Math.max(1, Number(tour?.durationDetails?.days || tour?.duration || 1));
  const end = new Date(start);
  end.setDate(end.getDate() + days - 1);
  return end;
};
const isTourActiveOnDate = (tour, value) => {
  const day = startOfDay(value);
  const start = startOfDay(tourStart(tour));
  const end = startOfDay(tourEnd(tour));
  return Boolean(day && start && end && day >= start && day <= end);
};
const validDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
const formatDate = (value) => {
  const date = validDate(value);
  return date ? date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }) : "Unavailable";
};
const formatDateTime = (value) => {
  const date = validDate(value);
  return date ? date.toLocaleString("en-KE", { timeZone: "Africa/Nairobi", dateStyle: "medium", timeStyle: "short" }) : "Not scheduled";
};
const display = (value, fallback = "Unavailable") => clean(value) || fallback;
const statusTone = (status) => {
  const value = clean(status).toLowerCase();
  if (["ongoing", "active", "ready", "assigned"].includes(value)) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (["completed", "available"].includes(value)) return "border-sky-200 bg-sky-50 text-sky-700";
  if (["cancelled", "maintenance", "unavailable"].includes(value)) return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
};

export default function DriverDashboard() {
  const [actionId, setActionId] = useState("");
  const dashboardQuery = useQuery({
    queryKey: ["driver-dashboard"],
    queryFn: getDriverDashboard,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
  });
  const toursQuery = useQuery({
    queryKey: ["driver-assigned-tours"],
    queryFn: getDriverAssignedTours,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
  });

  const loading = dashboardQuery.isLoading || toursQuery.isLoading;
  const error = dashboardQuery.error || toursQuery.error;
  const dashboard = unwrapData(dashboardQuery.data) || {};
  const tourPayload = unwrapData(toursQuery.data);
  const assignedTours = Array.isArray(tourPayload?.tours) ? tourPayload.tours : Array.isArray(tourPayload) ? tourPayload : [];
  const dashboardTours = Array.isArray(dashboard?.tours)
    ? dashboard.tours
    : Array.isArray(dashboard?.assignedTours)
      ? dashboard.assignedTours
      : Array.isArray(dashboard?.upcomingTours)
        ? dashboard.upcomingTours
        : [];
  const source = assignedTours.length ? assignedTours : dashboardTours;
  const tours = useMemo(() => source.map((tour) => {
    const dashboardTour = dashboardTours.find((item) => String(idOf(item)) === String(idOf(tour)));
    return {
      ...dashboardTour,
      ...tour,
      guests: tour?.guests ?? dashboardTour?.guests ?? dashboardTour?.guestCount ?? dashboardTour?.numberOfGuests ?? null,
    };
  }), [source, dashboardTours]);

  const vehicle = dashboard?.vehicle || dashboard?.assignedVehicle || tours.find((tour) => tour?.assignedVehicle)?.assignedVehicle || null;
  const today = new Date();
  const activeStatuses = ["completed", "cancelled"];
  const todayTrips = tours.filter((tour) => isTourActiveOnDate(tour, today) && !activeStatuses.includes(clean(tour?.status).toLowerCase()));
  const nextTour = tours
    .map((tour) => ({ tour, date: validDate(tourStart(tour)) }))
    .filter(({ tour, date }) => {
      const todayStart = startOfDay(today);
      const tourDay = startOfDay(date);
      return date && todayStart && tourDay && tourDay >= todayStart && !activeStatuses.includes(clean(tour?.status).toLowerCase());
    })
    .sort((a, b) => a.date - b.date)[0]?.tour;
  const nextPickup = nextTour?.pickupTime || nextTour?.pickupDateTime || tourStart(nextTour);
  const stats = dashboard?.stats || dashboard?.summary || {};
  const completedTours = firstNumeric(stats.completedTours, dashboard?.completedTours, tours.filter((tour) => clean(tour?.status).toLowerCase() === "completed").length);
  const ongoingTours = firstNumeric(stats.ongoingTours, dashboard?.ongoingTours, tours.filter((tour) => clean(tour?.status).toLowerCase() === "ongoing").length);
  const totalTours = firstNumeric(stats.totalTours, dashboard?.totalTours, tours.length);
  const vehicleStatus = vehicle?.status || vehicle?.availability || null;
  const driverName = dashboard?.driver?.name || dashboard?.profile?.name || "Driver";
  const refresh = () => {
    void dashboardQuery.refetch();
    void toursQuery.refetch();
  };

  const changeStatus = async (tour, status) => {
    const tourId = idOf(tour);
    if (!tourId) {
      toast.error("This tour has no valid identifier. No status change was made.");
      return;
    }
    try {
      setActionId(`${tourId}:${status}`);
      await updateDriverTourStatus(tourId, status);
      toast.success(status === "ongoing" ? "Tour started successfully." : "Tour completed successfully.");
      await Promise.all([dashboardQuery.refetch(), toursQuery.refetch()]);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Unable to update the tour. No changes were applied.");
    } finally {
      setActionId("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
          <div className="h-28 rounded-3xl bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-32 rounded-2xl bg-white shadow-sm" />)}</div>
          <div className="h-96 rounded-2xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  if (error && !dashboardQuery.data && !toursQuery.data) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><AlertTriangle size={24} /></div>
          <h1 className="mt-5 text-2xl font-black text-slate-900">Driver operations unavailable</h1>
          <p className="mt-2 max-w-2xl text-slate-600">{error?.response?.data?.message || error?.message || "The driver operations service could not be loaded."}</p>
          <button type="button" onClick={refresh} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 font-bold text-white hover:bg-emerald-800"><RefreshCw size={16} /> Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-7 md:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-300"><ShieldCheck size={14} /> Driver Operations</div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">{display(dashboard?.driver?.name, driverName)}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Manage assigned tours, pickups and vehicle readiness from one operational workspace.</p>
            </div>
            <button type="button" onClick={refresh} disabled={dashboardQuery.isFetching || toursQuery.isFetching} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/15 disabled:opacity-60"><RefreshCw size={16} className={dashboardQuery.isFetching || toursQuery.isFetching ? "animate-spin" : ""} />{dashboardQuery.isFetching || toursQuery.isFetching ? "Refreshing..." : "Refresh data"}</button>
          </div>
          {error && <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100"><AlertTriangle className="mt-0.5 shrink-0" size={17} /><span>Some driver data could not be refreshed. Displayed values are from the data that loaded successfully.</span></div>}
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-6 md:px-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Today&apos;s Trips</span><CalendarDays className="text-emerald-600" size={19} /></div><div className="mt-3 text-3xl font-black text-slate-950">{numeric(todayTrips.length)}</div><p className="mt-1 text-sm text-slate-500">Active scheduled movements</p></div>
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Next Pickup</span><Clock3 className="text-blue-600" size={19} /></div><div className="mt-3 text-lg font-black text-slate-950">{nextPickup ? formatDateTime(nextPickup) : "Not scheduled"}</div><p className="mt-1 text-sm text-slate-500">Next scheduled movement</p></div>
          <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Assigned Vehicle</span><Car className="text-violet-600" size={19} /></div><div className="mt-3 text-xl font-black text-slate-950">{display(vehicle?.registrationNumber || vehicle?.plateNumber || vehicle?.registration || vehicle?.name, "Not assigned")}</div><p className="mt-1 text-sm text-slate-500">Fleet unit for current assignments</p></div>
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wider text-slate-500">Completed Tours</span><CheckCircle2 className="text-sky-600" size={19} /></div><div className="mt-3 text-3xl font-black text-slate-950">{numeric(completedTours)}</div><p className="mt-1 text-sm text-slate-500">{numeric(ongoingTours)} currently ongoing</p></div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-5 md:px-6"><div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-black text-slate-950">Assigned tours</h2><p className="mt-1 text-sm text-slate-500">Your current operational queue.</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{numeric(totalTours)} total</span></div></div>
            {tours.length === 0 ? <div className="p-10 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><CalendarDays size={25} /></div><h3 className="mt-4 text-lg font-black text-slate-900">No tours assigned</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">There are currently no active tour assignments for this driver. New assignments will appear here automatically.</p></div> : <div className="divide-y divide-slate-100">{tours.slice(0, 10).map((tour) => {
              const tourId = idOf(tour);
              const status = clean(tour?.status || "scheduled").toLowerCase();
              const isToday = isTourActiveOnDate(tour, today);
              const title = tour?.title || tour?.destination?.name || tour?.destinationName || tour?.location || "Tour assignment";
              const startLabel = formatDate(tourStart(tour));
              const guests = tour?.guests ?? tour?.guestCount ?? tour?.numberOfGuests ?? null;
              const destination = tour?.destination?.name || tour?.destinationName || tour?.location;
              return <div className="p-5 md:p-6" key={tourId}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-base font-black text-slate-950">{title}</h3><span className={`rounded-full border px-2.5 py-1 text-[11px] font-black capitalize ${statusTone(status)}`}>{display(status, "scheduled")}</span>{isToday && <span className="rounded-full bg-emerald-700 px-2.5 py-1 text-[11px] font-black text-white">Today</span>}</div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500"><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} />{startLabel}</span><span className="inline-flex items-center gap-1.5"><MapPin size={14} />{display(destination, "Destination unavailable")}</span><span className="inline-flex items-center gap-1.5"><Users size={14} />{guests == null ? "Guests unavailable" : `${numeric(guests)} guest${numeric(guests) === 1 ? "" : "s"}`}</span></div></div>
                  <div className="flex shrink-0 gap-2">{["scheduled", "upcoming"].includes(status) && <button type="button" disabled={actionId === `${tourId}:ongoing` || !isToday} title={isToday ? "Start this tour" : `This tour is scheduled for ${startLabel}`} onClick={() => void changeStatus(tour, "ongoing")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-2.5 text-sm font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"><Play size={14} />{actionId === `${tourId}:ongoing` ? "Starting..." : "Start"}</button>}{status === "ongoing" && <button type="button" disabled={actionId === `${tourId}:completed`} onClick={() => void changeStatus(tour, "completed")} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-60"><Flag size={14} />{actionId === `${tourId}:completed` ? "Completing..." : "Complete"}</button>}</div>
                </div>
              </div>;
            })}</div>}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-lg font-black text-slate-950">Trip control</h2><p className="mt-1 text-sm text-slate-500">Operational snapshot</p></div><Gauge className="text-emerald-600" size={21} /></div><div className="mt-5 space-y-1"><div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm"><span className="inline-flex items-center gap-2 text-slate-600"><CalendarDays size={15} />Today&apos;s schedule</span><strong className="text-slate-950">{todayTrips.length ? `${todayTrips.length} trip${todayTrips.length > 1 ? "s" : ""}` : "None"}</strong></div><div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm"><span className="inline-flex items-center gap-2 text-slate-600"><MapPin size={15} />Next destination</span><strong className="max-w-[55%] text-right text-slate-950">{display(nextTour?.destination?.name || nextTour?.destinationName || nextTour?.location, "Not assigned")}</strong></div><div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm"><span className="inline-flex items-center gap-2 text-slate-600"><Users size={15} />Guests</span><strong className="text-slate-950">{nextTour?.guests == null ? "Unavailable" : numeric(nextTour.guests)}</strong></div><div className="flex items-center justify-between py-3 text-sm"><span className="inline-flex items-center gap-2 text-slate-600"><Clock3 size={15} />Current status</span><span className={`rounded-full border px-2.5 py-1 text-xs font-black capitalize ${statusTone(nextTour?.status || "ready")}`}>{display(nextTour?.status, "Ready")}</span></div></div></div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-lg font-black text-slate-950">Vehicle & readiness</h2><p className="mt-1 text-sm text-slate-500">Departure readiness information</p></div><Car className="text-violet-600" size={21} /></div><div className="mt-5 space-y-1"><div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm"><span className="inline-flex items-center gap-2 text-slate-600"><Car size={15} />Vehicle</span><strong className="text-slate-950">{display(vehicle?.registrationNumber || vehicle?.plateNumber || vehicle?.registration || vehicle?.name, "Not assigned")}</strong></div><div className="flex items-center justify-between border-b border-slate-100 py-3 text-sm"><span className="inline-flex items-center gap-2 text-slate-600"><Wrench size={15} />Vehicle status</span><span className={`rounded-full border px-2.5 py-1 text-xs font-black capitalize ${statusTone(vehicleStatus || "unavailable")}`}>{display(vehicleStatus, "Unavailable")}</span></div><div className="flex items-center justify-between py-3 text-sm"><span className="inline-flex items-center gap-2 text-slate-600"><CheckCircle2 size={15} />Assigned tours</span><strong className="text-slate-950">{numeric(totalTours)}</strong></div></div><div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={18} /><div><p className="text-sm font-black text-amber-900">Pre-departure check</p><p className="mt-1 text-xs leading-5 text-amber-800">Confirm fuel, tyres, brakes, lights and required safety equipment before departure. Report mechanical or safety issues before starting the trip.</p></div></div></div></div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h2 className="text-lg font-black text-slate-950">Fleet readiness</h2><p className="mt-1 text-sm text-slate-500">Operational information available from the current driver assignment.</p></div><div className="flex flex-wrap gap-2"><span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700"><ShieldCheck size={14} />Safety first</span><span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700"><Fuel size={14} />Fuel check</span><span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700"><Wrench size={14} />Mechanical check</span></div></div></section>
      </main>
    </div>
  );
}
