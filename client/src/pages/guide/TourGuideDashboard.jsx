import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Clock3, MapPinned, RefreshCw, Users, X } from "lucide-react";
import { useState } from "react";
import { getGuideDashboard, getTourGuests } from "../../api/guideApi";
import { asArray, firstNumeric, numeric, unwrapData } from "../../utils/dashboardData";

const startDateOf = (tour) => tour?.startDate || tour?.date || tour?.travelDate;

const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");

const getPickupLocation = (guest) => firstValue(
  guest?.pickupLocation,
  guest?.customTour?.pickupLocation,
  guest?.booking?.pickupLocation,
  guest?.pickup?.location,
);

const getRouteLabel = (tour) => firstValue(
  tour?.route,
  tour?.itinerary?.route,
  tour?.destination?.name,
  tour?.location,
  tour?.title,
);

const getReadinessStatus = (ready, loading = false) => {
  if (loading) return { label: "Checking", className: "neutral", icon: Clock3 };
  return ready
    ? { label: "Ready", className: "success", icon: CheckCircle2 }
    : { label: "Needs attention", className: "warning", icon: Clock3 };
};

export default function TourGuideDashboard() {
  const [openReadiness, setOpenReadiness] = useState(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["guide-dashboard"],
    queryFn: getGuideDashboard,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
  });

  const payload = unwrapData(data);
  const rawTours = payload?.tours ?? payload?.data?.tours ?? data?.tours ?? [];
  const tours = asArray(rawTours).filter((tour) => tour?.isDeleted !== true);
  const stats = payload?.stats || data?.stats || {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = tours
    .filter((tour) => !["completed", "cancelled"].includes(String(tour?.status || "").toLowerCase()))
    .map((tour) => ({ tour, date: new Date(startDateOf(tour) || 0) }))
    .filter(({ date }) => !Number.isNaN(date.getTime()) && date >= today)
    .sort((a, b) => a.date - b.date);

  const nextTour = upcoming[0]?.tour;
  const nextTourId = nextTour?._id || nextTour?.id;

  const { data: guestData, isLoading: guestsLoading, isFetching: guestsFetching, refetch: refetchGuests } = useQuery({
    queryKey: ["guide-tour-guests", nextTourId],
    queryFn: () => getTourGuests(nextTourId),
    enabled: Boolean(nextTourId),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const guestPayload = unwrapData(guestData);
  const guests = asArray(guestPayload?.guests ?? guestPayload?.bookings ?? guestPayload?.data ?? guestData?.guests ?? guestData?.bookings ?? []);
  const pickupLocations = [...new Set(guests.map(getPickupLocation).filter(Boolean))];
  const routeReady = Boolean(nextTour && getRouteLabel(nextTour) && pickupLocations.length > 0);
  const manifestReady = Boolean(nextTourId && !guestsLoading && guests.length > 0);
  const departureDate = nextTour ? new Date(startDateOf(nextTour)) : null;
  const departureReady = Boolean(departureDate && !Number.isNaN(departureDate.getTime()) && departureDate >= today);
  const readiness = [
    {
      key: "route",
      label: "Confirm route and pickup points",
      ready: routeReady,
      detail: routeReady
        ? `${getRouteLabel(nextTour)} · ${pickupLocations.join(", ")}`
        : "Route and at least one guest pickup point are required.",
      icon: MapPinned,
    },
    {
      key: "manifest",
      label: "Review guest manifest",
      ready: manifestReady,
      detail: guestsLoading ? "Loading assigned guests..." : `${guests.length} guest${guests.length === 1 ? "" : "s"} on the manifest.`,
      icon: Users,
    },
    {
      key: "date",
      label: "Confirm departure date",
      ready: departureReady,
      detail: departureReady ? departureDate.toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "A valid upcoming departure date is required.",
      icon: CalendarDays,
    },
  ];

  const readinessComplete = Boolean(nextTour && readiness.every((item) => item.ready));

  const guestsForModal = openReadiness === "manifest" ? guests : [];

  const assignedGuests = tours.reduce((sum, tour) => sum + firstNumeric(tour?.guests, tour?.guestsCount, 0), 0);
  const assignedTours = firstNumeric(stats.totalTours, payload?.count, tours.length);
  const completedTours = firstNumeric(
    stats.completedTours,
    tours.filter((tour) => String(tour?.status || "").toLowerCase() === "completed").length,
  );

  if (isLoading) return <div className="ops-page"><div className="ops-card ops-panel">Loading guide operations...</div></div>;

  if (isError) {
    return (
      <div className="ops-page">
        <div className="ops-card ops-panel">
          <div className="ops-panel-title">Guide dashboard unavailable</div>
          <div className="ops-alert">{error?.response?.data?.message || error?.message || "Unable to load your assigned tours."}</div>
          <button className="btn btn-secondary" type="button" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={15} /> {isFetching ? "Refreshing..." : "Retry"}
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
        <button className="btn btn-secondary" type="button" onClick={() => { refetch(); if (nextTourId) refetchGuests(); }} disabled={isFetching || guestsFetching}>
          <RefreshCw size={15} className={isFetching || guestsFetching ? "spin" : ""} /> {isFetching || guestsFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="ops-kpis">
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Assigned Tours</div><div className="ops-kpi-value">{numeric(assignedTours)}</div><div className="ops-kpi-meta">Live assignments</div></div>
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Next Departure</div><div className="ops-kpi-value">{nextTour ? new Date(startDateOf(nextTour)).toLocaleDateString() : "—"}</div><div className="ops-kpi-meta">Scheduled date</div></div>
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Guests</div><div className="ops-kpi-value">{numeric(assignedGuests)}</div><div className="ops-kpi-meta">Across assigned tours</div></div>
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Completed</div><div className="ops-kpi-value">{numeric(completedTours)}</div><div className="ops-kpi-meta">Tours closed out</div></div>
      </div>

      <div className="ops-grid-2">
        <div className="ops-card ops-panel">
          <div className="ops-panel-head"><div className="ops-panel-title">Upcoming assignments</div><span className="ops-status neutral">{upcoming.length} upcoming</span></div>
          {upcoming.length === 0 ? <div className="ops-alert">No upcoming tours are assigned to you.</div> : (
            <div className="ops-list">
              {upcoming.slice(0, 10).map(({ tour }) => (
                <div className="ops-list-item" key={tour._id || tour.id}>
                  <span><MapPinned size={15} /> {tour.title || tour.destination?.name || tour.location || "Tour"}</span>
                  <span className="ops-status neutral">{new Date(startDateOf(tour)).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ops-card ops-panel">
          <div className="ops-panel-head">
            <div>
              <div className="ops-panel-title">Tour-day readiness</div>
              {nextTour && <div className="ops-kpi-meta">{nextTour.title || getRouteLabel(nextTour)} · {departureDate.toLocaleDateString()}</div>}
            </div>
            <span className={`ops-status ${readinessComplete ? "success" : "warning"}`}>
              {readinessComplete ? "Ready for departure" : `${readiness.filter((item) => item.ready).length}/3 ready`}
            </span>
          </div>

          {!nextTour ? (
            <div className="ops-alert">No upcoming assignment to prepare for.</div>
          ) : (
            <div className="ops-list">
              {readiness.map((item) => {
                const status = getReadinessStatus(item.ready, item.key === "manifest" && guestsLoading);
                const StatusIcon = status.icon;
                const ItemIcon = item.icon;
                return (
                  <button className="ops-list-item" type="button" key={item.key} onClick={() => setOpenReadiness(item.key)}>
                    <span><ItemIcon size={15} /> {item.label}</span>
                    <span className="ops-status-group">
                      <span className={`ops-status ${status.className}`}>{status.label}</span>
                      <StatusIcon size={17} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {openReadiness && nextTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Tour-day readiness details">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-bold">{readiness.find((item) => item.key === openReadiness)?.label}</div>
                <div className="mt-1 text-sm text-gray-500">{nextTour.title || getRouteLabel(nextTour)}</div>
              </div>
              <button className="btn btn-secondary" type="button" onClick={() => setOpenReadiness(null)} aria-label="Close readiness details"><X size={17} /></button>
            </div>

            {openReadiness === "route" && (
              <div className="mt-5 space-y-3">
                <div><strong>Route:</strong> {getRouteLabel(nextTour) || "Not configured"}</div>
                <div><strong>Pickup points:</strong> {pickupLocations.length ? pickupLocations.join(", ") : "No guest pickup points recorded"}</div>
                {!routeReady && <div className="ops-alert">Ask the operations team to complete the route or guest pickup details before departure.</div>}
              </div>
            )}

            {openReadiness === "manifest" && (
              <div className="mt-5">
                {guestsLoading ? <div className="ops-alert">Loading guest manifest...</div> : guestsForModal.length === 0 ? <div className="ops-alert">No confirmed guests are currently assigned to this tour.</div> : (
                  <div className="ops-list">
                    {guestsForModal.map((guest, index) => {
                      const customer = guest?.customer || guest?.user || {};
                      return (
                        <div className="ops-list-item" key={guest?._id || guest?.id || index}>
                          <span><Users size={15} /> {customer?.name || guest?.customerName || guest?.name || `Guest ${index + 1}`}</span>
                          <span className="text-sm text-gray-500">{getPickupLocation(guest) || "Pickup not set"}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {openReadiness === "date" && (
              <div className="mt-5 space-y-3">
                <div><strong>Departure:</strong> {departureDate.toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
                <div><strong>Status:</strong> {departureReady ? "Confirmed as an upcoming departure." : "Departure date needs attention."}</div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              {openReadiness === "manifest" && <button className="btn btn-secondary" type="button" onClick={() => refetchGuests()} disabled={guestsFetching}><RefreshCw size={15} /> Refresh manifest</button>}
              <button className="btn btn-primary" type="button" onClick={() => setOpenReadiness(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
