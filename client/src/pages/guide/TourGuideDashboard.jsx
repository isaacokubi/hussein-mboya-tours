import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Clock3, MapPinned, RefreshCw, Users, Car, MapPin } from "lucide-react";
import { getGuideDashboard } from "../../api/guideApi";
import { asArray, firstNumeric, numeric, unwrapData } from "../../utils/dashboardData";

const startDateOf = (tour) => tour?.startDate || tour?.date || tour?.travelDate;
const endDateOf = (tour) => tour?.endDate || startDateOf(tour);
const titleOf = (tour) => tour?.title || tour?.destination?.name || tour?.location || "Tour";
const guestsOf = (tour) => firstNumeric(tour?.guests, tour?.guestsCount, tour?.numberOfGuests, 0);

export default function TourGuideDashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({ queryKey: ["guide-dashboard"], queryFn: getGuideDashboard, staleTime: 30_000, refetchOnWindowFocus: true, refetchOnMount: "always", retry: 1 });
  const payload = unwrapData(data);
  const rawTours = payload?.tours ?? payload?.data?.tours ?? data?.tours ?? [];
  const tours = asArray(rawTours).filter((tour) => tour?.isDeleted !== true);
  const stats = payload?.stats || data?.stats || {};
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcoming = tours.filter((tour) => !["completed", "cancelled"].includes(String(tour?.status || "").toLowerCase())).map((tour) => ({ tour, date: new Date(startDateOf(tour) || 0) })).filter(({ date }) => !Number.isNaN(date.getTime()) && date >= today).sort((a, b) => a.date - b.date);
  const todayTours = tours.filter((tour) => { const start = new Date(startDateOf(tour) || 0); const end = new Date(endDateOf(tour) || 0); start.setHours(0,0,0,0); end.setHours(0,0,0,0); return !Number.isNaN(start.getTime()) && start <= today && today <= end && !["completed","cancelled"].includes(String(tour?.status || "").toLowerCase()); });
  const nextTour = upcoming[0]?.tour;
  const guests = tours.reduce((sum, tour) => sum + guestsOf(tour), 0);
  const assignedTours = firstNumeric(stats.totalTours, payload?.count, tours.length);
  const completedTours = firstNumeric(stats.completedTours, tours.filter((tour) => String(tour?.status || "").toLowerCase() === "completed").length);
  const ongoingTours = firstNumeric(stats.ongoingTours, tours.filter((tour) => String(tour?.status || "").toLowerCase() === "ongoing").length);
  const readiness = { route: Boolean(nextTour?.meetingPoint || nextTour?.pickupPoint || nextTour?.location), guests: guestsOf(nextTour) > 0, date: Boolean(startDateOf(nextTour)) };

  if (isLoading) return <div className="ops-page"><div className="ops-card ops-panel">Loading guide operations...</div></div>;
  if (isError) return <div className="ops-page"><div className="ops-card ops-panel"><div className="ops-panel-title">Guide dashboard unavailable</div><div className="ops-alert">{error?.response?.data?.message || error?.message || "Unable to load your assigned tours."}</div><button className="btn btn-secondary" type="button" onClick={() => refetch()} disabled={isFetching}><RefreshCw size={15} /> {isFetching ? "Refreshing..." : "Retry"}</button></div></div>;

  return <div className="ops-page">
    <div className="ops-page-head"><div><div className="ops-page-title">Guide Operations</div><div className="ops-page-subtitle">Assigned departures, guests, destinations and tour-day readiness.</div></div><button className="btn btn-secondary" type="button" onClick={() => refetch()} disabled={isFetching}><RefreshCw size={15} className={isFetching ? "spin" : ""} /> {isFetching ? "Refreshing..." : "Refresh"}</button></div>
    <div className="ops-kpis">
      <div className="ops-card ops-kpi"><div className="ops-kpi-label">Assigned Tours</div><div className="ops-kpi-value">{numeric(assignedTours)}</div><div className="ops-kpi-meta">{numeric(upcoming.length)} upcoming</div></div>
      <div className="ops-card ops-kpi"><div className="ops-kpi-label">Next Departure</div><div className="ops-kpi-value">{nextTour ? new Date(startDateOf(nextTour)).toLocaleDateString() : "—"}</div><div className="ops-kpi-meta">{nextTour ? titleOf(nextTour) : "No departure scheduled"}</div></div>
      <div className="ops-card ops-kpi"><div className="ops-kpi-label">Guests</div><div className="ops-kpi-value">{numeric(guests)}</div><div className="ops-kpi-meta">Across assigned tours</div></div>
      <div className="ops-card ops-kpi"><div className="ops-kpi-label">Completed</div><div className="ops-kpi-value">{numeric(completedTours)}</div><div className="ops-kpi-meta">{numeric(ongoingTours)} currently ongoing</div></div>
    </div>
    <div className="ops-grid-2">
      <div className="ops-card ops-panel"><div className="ops-panel-head"><div className="ops-panel-title">Upcoming assignments</div><span className="ops-status neutral">{upcoming.length} upcoming</span></div>{upcoming.length === 0 ? <div className="ops-alert">No upcoming tours are assigned to you. New assignments from the tour manager will appear here automatically.</div> : <div className="ops-list">{upcoming.slice(0,10).map(({tour}) => <div className="ops-list-item" key={tour._id || tour.id}><span><MapPinned size={15}/> {titleOf(tour)} · {new Date(startDateOf(tour)).toLocaleDateString()} · {numeric(guestsOf(tour))} guests</span><span className="ops-status neutral">{tour.status || "scheduled"}</span></div>)}</div>}</div>
      <div className="ops-card ops-panel"><div className="ops-panel-head"><div className="ops-panel-title">Next departure</div><CalendarDays size={17}/></div><div className="ops-list"><div className="ops-list-item"><span><MapPin size={15}/> Destination</span><span>{nextTour?.destination?.name || nextTour?.destinationName || nextTour?.location || "Not assigned"}</span></div><div className="ops-list-item"><span><CalendarDays size={15}/> Departure</span><span>{nextTour ? new Date(startDateOf(nextTour)).toLocaleString([], { dateStyle:"medium" }) : "—"}</span></div><div className="ops-list-item"><span><Users size={15}/> Guest manifest</span><span>{numeric(guestsOf(nextTour))} guests</span></div><div className="ops-list-item"><span><Car size={15}/> Vehicle</span><span>{nextTour?.assignedVehicle?.registrationNumber || nextTour?.assignedVehicle?.name || "Not assigned"}</span></div></div></div>
    </div>
    <div className="ops-grid-2">
      <div className="ops-card ops-panel"><div className="ops-panel-head"><div className="ops-panel-title">Today</div><Clock3 size={17}/></div><div className="ops-list"><div className="ops-list-item"><span>Today&apos;s assigned tours</span><span className="ops-status neutral">{todayTours.length}</span></div><div className="ops-list-item"><span>Currently ongoing</span><span className="ops-status ok">{numeric(ongoingTours)}</span></div><div className="ops-list-item"><span>Next activity</span><span>{todayTours[0] ? titleOf(todayTours[0]) : nextTour ? titleOf(nextTour) : "No activity scheduled"}</span></div></div></div>
      <div className="ops-card ops-panel"><div className="ops-panel-head"><div className="ops-panel-title">Tour-day readiness</div><CheckCircle2 size={17}/></div><div className="ops-list"><div className="ops-list-item"><span><MapPinned size={15}/> Confirm route and pickup points</span>{readiness.route ? <CheckCircle2 size={17}/> : <Clock3 size={17}/>}</div><div className="ops-list-item"><span><Users size={15}/> Review guest manifest</span>{readiness.guests ? <CheckCircle2 size={17}/> : <Clock3 size={17}/>}</div><div className="ops-list-item"><span><CalendarDays size={15}/> Confirm departure date</span>{readiness.date ? <CheckCircle2 size={17}/> : <Clock3 size={17}/>}</div></div><div className="ops-alert">Review the assignment before departure and report missing pickup, guest or vehicle information to the tour manager.</div></div>
    </div>
  </div>;
}
