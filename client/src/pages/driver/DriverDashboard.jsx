import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Car, CalendarDays, MapPin, Users, CheckCircle2, Clock3, Wrench, RefreshCw, Play, Flag, ShieldCheck } from "lucide-react";
import { getDriverDashboard, getDriverAssignedTours, updateDriverTourStatus } from "../../api/driverApi";
import { firstNumeric, numeric, unwrapData } from "../../utils/dashboardData";

const idOf = (value) => value?._id || value?.id || value;
const startOfDay = (value) => { const date = new Date(value); if (Number.isNaN(date.getTime())) return null; date.setHours(0, 0, 0, 0); return date; };
const tourStart = (tour) => tour?.startDate || tour?.date || tour?.tourDate;
const tourEnd = (tour) => tour?.endDate || tour?.startDate || tour?.date || tour?.tourDate;
const isTourActiveOnDate = (tour, value) => { const day = startOfDay(value); const start = startOfDay(tourStart(tour)); const end = startOfDay(tourEnd(tour)); return Boolean(day && start && end && day >= start && day <= end); };
const formatDateTime = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" }); };

export default function DriverDashboard() {
  const [actionId, setActionId] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const dashboardQuery = useQuery({ queryKey: ["driver-dashboard"], queryFn: getDriverDashboard, staleTime: 30000, refetchOnWindowFocus: true, refetchOnMount: "always", retry: 1 });
  const toursQuery = useQuery({ queryKey: ["driver-assigned-tours"], queryFn: getDriverAssignedTours, staleTime: 30000, refetchOnWindowFocus: true, refetchOnMount: "always", retry: 1 });
  const loading = dashboardQuery.isLoading || toursQuery.isLoading;
  const error = dashboardQuery.error || toursQuery.error;
  const dashboard = unwrapData(dashboardQuery.data);
  const tourPayload = unwrapData(toursQuery.data);
  const assignedTours = Array.isArray(tourPayload?.tours) ? tourPayload.tours : Array.isArray(tourPayload) ? tourPayload : [];
  const tours = useMemo(() => assignedTours.length ? assignedTours : (dashboard?.assignedTours || dashboard?.upcomingTours || dashboard?.tours || []), [assignedTours, dashboard]);
  const vehicle = dashboard?.vehicle || dashboard?.assignedVehicle || tours.find((tour) => tour?.assignedVehicle)?.assignedVehicle || null;
  const today = new Date();
  const todayTrips = tours.filter((tour) => isTourActiveOnDate(tour, today) && !["completed", "cancelled"].includes(String(tour?.status || "").toLowerCase()));
  const nextTour = tours.map((tour) => ({ tour, date: new Date(tourStart(tour) || 0) })).filter(({ tour, date }) => { const start = startOfDay(today); return !Number.isNaN(date.getTime()) && start && date >= start && !["completed", "cancelled"].includes(String(tour?.status || "").toLowerCase()); }).sort((a, b) => a.date - b.date)[0]?.tour;
  const nextPickup = nextTour?.pickupTime || nextTour?.pickupDateTime || tourStart(nextTour);
  const stats = dashboard?.stats || dashboard?.summary || {};
  const completedTours = firstNumeric(stats.completedTours, dashboard?.completedTours, tours.filter((tour) => String(tour?.status || "").toLowerCase() === "completed").length);
  const ongoingTours = firstNumeric(stats.ongoingTours, dashboard?.ongoingTours, tours.filter((tour) => String(tour?.status || "").toLowerCase() === "ongoing").length);
  const totalTours = firstNumeric(stats.totalTours, dashboard?.totalTours, tours.length);
  const totalGuests = firstNumeric(stats.totalGuests, tours.reduce((sum, tour) => sum + Number(tour?.guests ?? tour?.guestCount ?? tour?.numberOfGuests ?? 0), 0));
  const vehicleStatus = vehicle?.status || (vehicle ? "available" : "Not assigned");
  const refresh = () => { void dashboardQuery.refetch(); void toursQuery.refetch(); };
  const changeStatus = async (tour, status) => { const tourId = idOf(tour); if (!tourId) return; try { setActionId(`${tourId}:${status}`); setActionMessage(""); await updateDriverTourStatus(tourId, status); setActionMessage(status === "ongoing" ? "Tour started successfully." : "Tour completed successfully."); await Promise.all([dashboardQuery.refetch(), toursQuery.refetch()]); } catch (err) { setActionMessage(err?.response?.data?.message || err?.message || "Unable to update tour status."); } finally { setActionId(""); } };
  if (loading) return <div className="ops-page"><div className="ops-card ops-panel">Loading driver operations...</div></div>;
  return (
    <div className="ops-page">
      <div className="ops-page-head"><div><div className="ops-page-title">Driver Operations</div><div className="ops-page-subtitle">{dashboard?.driver?.name || dashboard?.profile?.name || "Driver"} — assignments, pickups, guests and vehicle readiness.</div></div><button className="btn btn-secondary" type="button" onClick={refresh} disabled={dashboardQuery.isFetching || toursQuery.isFetching}><RefreshCw size={15} className={dashboardQuery.isFetching || toursQuery.isFetching ? "spin" : ""} /> {dashboardQuery.isFetching || toursQuery.isFetching ? "Refreshing..." : "Refresh"}</button></div>
      {error && <div className="ops-card ops-alert" role="alert">{error?.response?.data?.message || error?.message || "Unable to load your driver operations."}</div>}
      {actionMessage && <div className="ops-card ops-alert" role="status">{actionMessage}</div>}
      <div className="ops-kpis">
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Today&apos;s Trips</div><div className="ops-kpi-value">{numeric(firstNumeric(stats.todayTrips, todayTrips.length))}</div><div className="ops-kpi-meta">Tours active today</div></div>
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Next Pickup</div><div className="ops-kpi-value">{nextPickup ? formatDateTime(nextPickup) : "—"}</div><div className="ops-kpi-meta">Next scheduled movement</div></div>
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Guests</div><div className="ops-kpi-value">{numeric(totalGuests)}</div><div className="ops-kpi-meta">Across assigned tours</div></div>
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Completed Tours</div><div className="ops-kpi-value">{numeric(completedTours)}</div><div className="ops-kpi-meta">{numeric(ongoingTours)} currently ongoing</div></div>
      </div>
      <div className="ops-grid-2">
        <div className="ops-card ops-panel"><div className="ops-panel-head"><div className="ops-panel-title">Assigned tours</div><CalendarDays size={17} /></div>
          {tours.length === 0 ? <div className="ops-alert">No tours are currently assigned to you. Once a tour manager assigns a tour, it will appear here automatically.</div> : <div className="ops-list">{tours.slice(0, 10).map((tour) => { const tourId = idOf(tour); const status = String(tour?.status || "scheduled").toLowerCase(); const start = new Date(tourStart(tour) || 0); const isToday = isTourActiveOnDate(tour, today); const title = tour?.title || tour?.destination?.name || tour?.destinationName || tour?.location || "Tour"; const guests = tour?.guests ?? tour?.guestCount ?? tour?.numberOfGuests ?? 0; return <div className="ops-list-item" key={tourId}><span><MapPin size={15} /> {title} · {Number.isNaN(start.getTime()) ? "—" : start.toLocaleDateString()} · {numeric(guests)} guests</span><span className="ops-status neutral">{status}</span>{["scheduled", "upcoming"].includes(status) && <button className="btn btn-secondary" type="button" disabled={!isToday || actionId === `${tourId}:ongoing`} title={!isToday ? "This tour can only be started on its start date" : "Start tour"} onClick={() => void changeStatus(tour, "ongoing")}><Play size={14} /> {actionId === `${tourId}:ongoing` ? "Starting..." : "Start"}</button>}{status === "ongoing" && <button className="btn btn-secondary" type="button" disabled={actionId === `${tourId}:completed`} onClick={() => void changeStatus(tour, "completed")}><Flag size={14} /> {actionId === `${tourId}:completed` ? "Completing..." : "Complete"}</button>}</div>; })}</div>}
        </div>
        <div className="ops-card ops-panel"><div className="ops-panel-head"><div className="ops-panel-title">Vehicle & readiness</div><Car size={17} /></div><div className="ops-list"><div className="ops-list-item"><span><Car size={15} /> Vehicle</span><span>{vehicle?.registrationNumber || vehicle?.registration || vehicle?.name || "Not assigned"}</span></div><div className="ops-list-item"><span><Wrench size={15} /> Vehicle status</span><span className={`ops-status ${vehicle && vehicleStatus !== "maintenance" && vehicleStatus !== "out_of_service" ? "ok" : "neutral"}`}>{vehicleStatus}</span></div><div className="ops-list-item"><span><CheckCircle2 size={15} /> Total tours</span><span>{numeric(totalTours)}</span></div><div className="ops-list-item"><span><ShieldCheck size={15} /> Driver status</span><span className="ops-status ok">{dashboard?.driver?.status || "active"}</span></div><div className="ops-list-item"><span><Clock3 size={15} /> Availability</span><span>{dashboard?.driver?.availability || "available"}</span></div></div><div className="ops-alert">Before departure, verify fuel, tyres, lights, insurance and mechanical safety. Report any issue before starting the trip.</div></div>
      </div>
      <div className="ops-grid-2"><div className="ops-card ops-panel"><div className="ops-panel-head"><div className="ops-panel-title">Trip control</div><CalendarDays size={17} /></div><div className="ops-list"><div className="ops-list-item"><span><CalendarDays size={15} /> Today&apos;s schedule</span><span className="ops-status neutral">{todayTrips.length ? `${todayTrips.length} trip${todayTrips.length > 1 ? "s" : ""}` : "None"}</span></div><div className="ops-list-item"><span><MapPin size={15} /> Next destination</span><span className="ops-status neutral">{nextTour?.destination?.name || nextTour?.destinationName || nextTour?.location || "Not assigned"}</span></div><div className="ops-list-item"><span><Users size={15} /> Next tour guests</span><span className="ops-status neutral">{numeric(nextTour?.guests ?? nextTour?.guestCount ?? nextTour?.numberOfGuests ?? 0)}</span></div><div className="ops-list-item"><span><Clock3 size={15} /> Next tour status</span><span className="ops-status ok">{nextTour?.status || "Ready"}</span></div></div></div><div className="ops-card ops-panel"><div className="ops-panel-head"><div className="ops-panel-title">Driver profile</div><ShieldCheck size={17} /></div><div className="ops-list"><div className="ops-list-item"><span>Name</span><span>{dashboard?.driver?.name || "—"}</span></div><div className="ops-list-item"><span>Phone</span><span>{dashboard?.driver?.phone || "—"}</span></div><div className="ops-list-item"><span>Licence</span><span>{dashboard?.driver?.licenseNumber || "Not recorded"}</span></div><div className="ops-list-item"><span>Licence expiry</span><span>{dashboard?.driver?.licenseExpiry ? new Date(dashboard.driver.licenseExpiry).toLocaleDateString() : "Not recorded"}</span></div></div></div></div>
    </div>
  );
}
