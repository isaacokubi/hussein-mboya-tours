import { useEffect, useMemo, useState } from "react";
import { Car, CalendarDays, MapPin, Users, CheckCircle2, Clock3, Wrench, RefreshCw } from "lucide-react";
import axios from "../../api/axios";

const unwrap = (payload) => payload?.data ?? payload ?? {};
const idOf = (value) => value?._id || value?.id || value;

export default function DriverDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (background = false) => {
    try {
      setError("");
      if (background) setRefreshing(true); else setLoading(true);
      const response = await axios.get("/driver/dashboard");
      setDashboard(unwrap(response));
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load your driver dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const tours = useMemo(() => {
    const source = dashboard?.assignedTours || dashboard?.upcomingTours || dashboard?.tours || [];
    return Array.isArray(source) ? source : [];
  }, [dashboard]);

  const vehicle = dashboard?.vehicle || dashboard?.assignedVehicle || dashboard?.profile?.vehicle;
  const today = new Date();
  const todayTrips = tours.filter((tour) => {
    const date = tour?.startDate || tour?.date || tour?.tourDate;
    if (!date) return false;
    const parsed = new Date(date);
    return parsed.toDateString() === today.toDateString();
  });

  const nextTour = tours
    .map((tour) => ({ tour, date: new Date(tour?.startDate || tour?.date || tour?.tourDate || 0) }))
    .filter(({ date }) => date >= today)
    .sort((a, b) => a.date - b.date)[0]?.tour;

  const stats = dashboard?.stats || dashboard?.summary || {};
  const totalTours = stats.totalTours ?? dashboard?.totalTours ?? tours.length;
  const completedTours = stats.completedTours ?? dashboard?.completedTours ?? 0;
  const ongoingTours = stats.ongoingTours ?? dashboard?.ongoingTours ?? 0;

  if (loading) {
    return <div className="ops-page"><div className="ops-card ops-panel">Loading driver operations…</div></div>;
  }

  return (
    <div className="ops-page">
      <div className="ops-page-head">
        <div>
          <div className="ops-page-title">Driver Operations</div>
          <div className="ops-page-subtitle">
            {dashboard?.driver?.name || dashboard?.profile?.name || "Your"} — assignments, pickups and vehicle readiness.
          </div>
        </div>
        <button className="btn btn-secondary" type="button" onClick={() => loadDashboard(true)} disabled={refreshing}>
          <RefreshCw size={15} className={refreshing ? "spin" : ""} /> Refresh
        </button>
      </div>

      {error && <div className="ops-card ops-alert" role="alert">{error}</div>}

      <div className="ops-kpis">
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Today's Trips</div><div className="ops-kpi-value">{todayTrips.length}</div><div className="ops-kpi-meta">Assigned movements</div></div>
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Next Pickup</div><div className="ops-kpi-value">{nextTour ? new Date(nextTour.startDate || nextTour.date || nextTour.tourDate).toLocaleDateString() : "—"}</div><div className="ops-kpi-meta">Next scheduled tour</div></div>
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Vehicle</div><div className="ops-kpi-value">{vehicle?.registrationNumber || vehicle?.plateNumber || vehicle?.registration || vehicle?.name || "—"}</div><div className="ops-kpi-meta">Assigned fleet unit</div></div>
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Completed Tours</div><div className="ops-kpi-value">{completedTours}</div><div className="ops-kpi-meta">{ongoingTours} currently ongoing</div></div>
      </div>

      <div className="ops-grid-2">
        <div className="ops-card ops-panel">
          <div className="ops-panel-head"><div className="ops-panel-title">Trip control</div><CalendarDays size={17} /></div>
          <div className="ops-list">
            <div className="ops-list-item"><span><CalendarDays size={15} /> Today's schedule</span><span className="ops-status neutral">{todayTrips.length ? `${todayTrips.length} trip${todayTrips.length > 1 ? "s" : ""}` : "None"}</span></div>
            <div className="ops-list-item"><span><MapPin size={15} /> Next destination</span><span className="ops-status neutral">{nextTour?.destination?.name || nextTour?.destinationName || nextTour?.location || "Not assigned"}</span></div>
            <div className="ops-list-item"><span><Users size={15} /> Guests</span><span className="ops-status neutral">{nextTour?.guestCount ?? nextTour?.numberOfGuests ?? nextTour?.passengers ?? "—"}</span></div>
            <div className="ops-list-item"><span><Clock3 size={15} /> Status</span><span className="ops-status ok">{nextTour?.status || "Ready"}</span></div>
          </div>
        </div>

        <div className="ops-card ops-panel">
          <div className="ops-panel-head"><div className="ops-panel-title">Vehicle & readiness</div><Car size={17} /></div>
          <div className="ops-list">
            <div className="ops-list-item"><span><Car size={15} /> Vehicle</span><span>{vehicle?.registrationNumber || vehicle?.plateNumber || "Not assigned"}</span></div>
            <div className="ops-list-item"><span><Wrench size={15} /> Vehicle status</span><span className="ops-status ok">{vehicle?.status || "Ready"}</span></div>
            <div className="ops-list-item"><span><CheckCircle2 size={15} /> Total tours</span><span>{totalTours}</span></div>
          </div>
          <div className="ops-alert">Report tyre, fuel, mechanical or safety issues before departure.</div>
        </div>
      </div>
    </div>
  );
}
