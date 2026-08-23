import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Clock3, MapPinned, RefreshCw, Users } from "lucide-react";
import { getGuideDashboard } from "../../api/guideApi";

const unwrap = (payload) => payload?.data || payload || {};
const startDateOf = (tour) => tour?.startDate || tour?.date || tour?.travelDate;

export default function TourGuideDashboard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["guide-dashboard"],
    queryFn: getGuideDashboard,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  const payload = unwrap(data);
  const tours = Array.isArray(payload?.tours)
    ? payload.tours
    : Array.isArray(payload?.data?.tours)
      ? payload.data.tours
      : [];
  const stats = payload?.stats || {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = tours
    .filter((tour) => !["completed", "cancelled"].includes(String(tour?.status || "").toLowerCase()))
    .map((tour) => ({ tour, date: new Date(startDateOf(tour) || 0) }))
    .filter(({ date }) => !Number.isNaN(date.getTime()) && date >= today)
    .sort((a, b) => a.date - b.date);

  const nextTour = upcoming[0]?.tour;
  const guests = tours.reduce((sum, tour) => sum + Number(tour?.guests || tour?.guestsCount || 0), 0);
  const assignedTours = Number(stats.totalTours ?? tours.length);
  const completedTours = Number(stats.completedTours ?? tours.filter((tour) => tour?.status === "completed").length);

  if (isLoading) {
    return <div className="ops-page"><div className="ops-card ops-panel">Loading guide operations…</div></div>;
  }

  if (isError) {
    return (
      <div className="ops-page">
        <div className="ops-card ops-panel">
          <div className="ops-panel-title">Guide dashboard unavailable</div>
          <div className="ops-alert">{error?.response?.data?.message || error?.message || "Unable to load your assigned tours."}</div>
          <button className="btn btn-secondary" type="button" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={15} /> {isFetching ? "Refreshing…" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ops-page">
      <div className="ops-page-head">
        <div>
          <div className="ops-page-title">Guide Operations</div>
          <div className="ops-page-subtitle">Assigned departures, guests and tour-day readiness.</div>
        </div>
        <button className="btn btn-secondary" type="button" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={15} className={isFetching ? "spin" : ""} /> {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="ops-kpis">
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Assigned Tours</div><div className="ops-kpi-value">{assignedTours}</div><div className="ops-kpi-meta">Live assignments</div></div>
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Next Departure</div><div className="ops-kpi-value">{nextTour ? new Date(startDateOf(nextTour)).toLocaleDateString() : "—"}</div><div className="ops-kpi-meta">Scheduled date</div></div>
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Guests</div><div className="ops-kpi-value">{guests}</div><div className="ops-kpi-meta">Across assigned tours</div></div>
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Completed</div><div className="ops-kpi-value">{completedTours}</div><div className="ops-kpi-meta">Tours closed out</div></div>
      </div>

      <div className="ops-grid-2">
        <div className="ops-card ops-panel">
          <div className="ops-panel-head"><div className="ops-panel-title">Upcoming assignments</div><span className="ops-status neutral">{upcoming.length} upcoming</span></div>
          {upcoming.length === 0 ? <div className="ops-alert">No upcoming tours are assigned to you.</div> : (
            <div className="ops-list">
              {upcoming.slice(0, 5).map(({ tour }) => (
                <div className="ops-list-item" key={tour._id}>
                  <span><MapPinned size={15} /> {tour.title || tour.destination?.name || tour.location || "Tour"}</span>
                  <span className="ops-status neutral">{new Date(startDateOf(tour)).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ops-card ops-panel">
          <div className="ops-panel-head"><div className="ops-panel-title">Tour-day readiness</div><CheckCircle2 size={17} /></div>
          <div className="ops-list">
            <div className="ops-list-item"><span><MapPinned size={15}/> Confirm route and pickup points</span><CheckCircle2 size={17}/></div>
            <div className="ops-list-item"><span><Users size={15}/> Review guest manifest</span><Clock3 size={17}/></div>
            <div className="ops-list-item"><span><CalendarDays size={15}/> Confirm departure date</span><Clock3 size={17}/></div>
          </div>
        </div>
      </div>
    </div>
  );
}
