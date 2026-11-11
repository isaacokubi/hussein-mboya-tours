/**
 * Purpose: Tour Guide Dashboard page-level UI component. Main declarations: startDateOf, endDateOf, firstValue, lower, getPickupLocation.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Load lucide-react so this module can use its exported dependencies.
import { CalendarDays, CheckCircle2, Clock3, MapPinned, PlayCircle, RefreshCw, Send, Users, X } from "lucide-react";
// Load react so this module can use its exported dependencies.
import { useMemo, useState } from "react";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load react-router-dom so this module can use its exported dependencies.
import { Link } from "react-router-dom";
// Load ../../api/guideApi so this module can use its exported dependencies.
import { getGuideDashboard, getTourGuests, submitTourReport, updateTourStatus } from "../../api/guideApi";
// Load ../../utils/dashboardData so this module can use its exported dependencies.
import { asArray, firstNumeric, unwrapData } from "../../utils/dashboardData";

// Declare startDateOf for use by the surrounding module or function.
const startDateOf = (tour) => tour?.startDate || tour?.date || tour?.travelDate;
// Declare endDateOf for use by the surrounding module or function.
const endDateOf = (tour) => tour?.endDate || startDateOf(tour);
// Declare firstValue for use by the surrounding module or function.
const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && String(value).trim() !== "");
// Declare lower for use by the surrounding module or function.
const lower = (value) => String(value || "").toLowerCase();

// Declare getPickupLocation for use by the surrounding module or function.
const getPickupLocation = (guest) => firstValue(
  guest?.pickupLocation,
  guest?.customTour?.pickupLocation,
  guest?.booking?.pickupLocation,
  guest?.pickup?.location,
);

// Declare getRouteLabel for use by the surrounding module or function.
const getRouteLabel = (tour) => firstValue(
  tour?.route,
  tour?.itinerary?.route,
  tour?.destination?.name,
  tour?.location,
  tour?.title,
);

// Declare customerName for use by the surrounding module or function.
const customerName = (guest, index) => {
  // Declare customer for use by the surrounding module or function.
  const customer = guest?.customer || guest?.user || {};
  // Declare composed for use by the surrounding module or function.
  const composed = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();
  // Return the result of firstValue() to the caller.
  return firstValue(customer?.name, composed, guest?.customerName, guest?.name, `Guest ${index + 1}`);
};

// Declare formatDate for use by the surrounding module or function.
const formatDate = (value, options = { weekday: "short", day: "numeric", month: "short", year: "numeric" }) => {
  // Declare date for use by the surrounding module or function.
  const date = new Date(value);
  // Return the expression shown below to the caller.
  return Number.isNaN(date.getTime()) ? "Unavailable" : date.toLocaleDateString("en-KE", options);
};

// Declare statusLabel for use by the surrounding module or function.
const statusLabel = (status) => ({ scheduled: "Scheduled", upcoming: "Upcoming", ongoing: "In progress", completed: "Completed", cancelled: "Cancelled" }[lower(status)] || "Status unavailable");

// Define TourGuideDashboard; its parameters and body implement this operation.
export default function TourGuideDashboard() {
  // Declare queryClient for use by the surrounding module or function.
  const queryClient = useQueryClient();
  // Declare [openTour, setOpenTour] for use by the surrounding module or function.
  const [openTour, setOpenTour] = useState(null);
  // Declare [openReadiness, setOpenReadiness] for use by the surrounding module or function.
  const [openReadiness, setOpenReadiness] = useState(null);
  // Declare [reportSummary, setReportSummary] for use by the surrounding module or function.
  const [reportSummary, setReportSummary] = useState("");
  // Declare [reportIssues, setReportIssues] for use by the surrounding module or function.
  const [reportIssues, setReportIssues] = useState("");

  // Declare dashboardQuery for use by the surrounding module or function.
  const dashboardQuery = useQuery({
    queryKey: ["guide-dashboard"],
    queryFn: getGuideDashboard,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
  });

  // Declare payload for use by the surrounding module or function.
  const payload = unwrapData(dashboardQuery.data);
  // Declare tours for use by the surrounding module or function.
  const tours = asArray(payload?.tours ?? payload?.data?.tours ?? dashboardQuery.data?.tours ?? []).filter((tour) => tour?.isDeleted !== true);
  // Declare stats for use by the surrounding module or function.
  const stats = payload?.stats || dashboardQuery.data?.stats || {};
  // Declare today for use by the surrounding module or function.
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  // Declare upcoming for use by the surrounding module or function.
  const upcoming = useMemo(() => tours
    .filter((tour) => !["completed", "cancelled"].includes(lower(tour?.status)))
    .map((tour) => ({ tour, date: new Date(startDateOf(tour) || 0) }))
    .filter(({ date }) => !Number.isNaN(date.getTime()) && date >= today)
    .sort((a, b) => a.date - b.date), [tours, today]);

  // Declare activeTours for use by the surrounding module or function.
  const activeTours = tours.filter((tour) => lower(tour?.status) === "ongoing");
  // Declare nextTour for use by the surrounding module or function.
  const nextTour = upcoming[0]?.tour;
  // Declare nextTourId for use by the surrounding module or function.
  const nextTourId = nextTour?._id || nextTour?.id;
  // Declare selectedTour for use by the surrounding module or function.
  const selectedTour = openTour || nextTour;
  // Declare selectedTourId for use by the surrounding module or function.
  const selectedTourId = selectedTour?._id || selectedTour?.id;

  // Declare guestQuery for use by the surrounding module or function.
  const guestQuery = useQuery({
    queryKey: ["guide-tour-guests", selectedTourId],
    queryFn: () => getTourGuests(selectedTourId),
    enabled: Boolean(selectedTourId),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // Declare guestPayload for use by the surrounding module or function.
  const guestPayload = unwrapData(guestQuery.data);
  // Declare guests for use by the surrounding module or function.
  const guests = asArray(guestPayload?.guests ?? guestPayload?.bookings ?? guestPayload?.data ?? guestQuery.data?.guests ?? guestQuery.data?.bookings ?? []);
  // Declare pickupLocations for use by the surrounding module or function.
  const pickupLocations = [...new Set(guests.map(getPickupLocation).filter(Boolean))];

  // Declare statusMutation for use by the surrounding module or function.
  const statusMutation = useMutation({
    mutationFn: ({ tourId, status }) => updateTourStatus(tourId, status),
    onSuccess: (_, variables) => {
      // Perform the side effect or state update expressed on the following line.
      toast.success(variables.status === "ongoing" ? "Tour started successfully." : "Tour completed successfully.");
      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({ queryKey: ["guide-dashboard"] });
      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({ queryKey: ["guide-tour-guests"] });
    },
    onError: (error) => toast.error(error?.response?.data?.message || error?.message || "The tour status could not be updated."),
  });

  // Declare reportMutation for use by the surrounding module or function.
  const reportMutation = useMutation({
    mutationFn: ({ tourId, reportData }) => submitTourReport(tourId, reportData),
    onSuccess: () => {
      // Perform the side effect or state update expressed on the following line.
      toast.success("Tour report submitted successfully.");
      // Perform the side effect or state update expressed on the following line.
      setReportSummary("");
      // Perform the side effect or state update expressed on the following line.
      setReportIssues("");
      // Perform the side effect or state update expressed on the following line.
      setOpenTour(null);
      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({ queryKey: ["guide-dashboard"] });
    },
    onError: (error) => toast.error(error?.response?.data?.message || error?.message || "The tour report could not be submitted."),
  });

  // Declare assignedTours for use by the surrounding module or function.
  const assignedTours = firstNumeric(stats.totalTours, payload?.count, tours.length);
  // Declare completedTours for use by the surrounding module or function.
  const completedTours = firstNumeric(stats.completedTours, tours.filter((tour) => lower(tour?.status) === "completed").length);
  // Declare assignedGuests for use by the surrounding module or function.
  const assignedGuests = tours.reduce((sum, tour) => sum + firstNumeric(tour?.guests, tour?.guestsCount, 0), 0);
  // Declare departureDate for use by the surrounding module or function.
  const departureDate = nextTour ? new Date(startDateOf(nextTour)) : null;
  // Declare routeReady for use by the surrounding module or function.
  const routeReady = Boolean(nextTour && getRouteLabel(nextTour) && pickupLocations.length > 0);
  // Declare manifestReady for use by the surrounding module or function.
  const manifestReady = Boolean(nextTourId && !guestQuery.isLoading && guests.length > 0);
  // Declare departureReady for use by the surrounding module or function.
  const departureReady = Boolean(departureDate && !Number.isNaN(departureDate.getTime()) && departureDate >= today);
  // Declare readiness for use by the surrounding module or function.
  const readiness = [
    { key: "route", label: "Confirm route and pickup points", ready: routeReady, detail: routeReady ? `${getRouteLabel(nextTour)} · ${pickupLocations.join(", ")}` : "Route and guest pickup information are required.", icon: MapPinned },
    { key: "manifest", label: "Review guest manifest", ready: manifestReady, detail: guestQuery.isLoading ? "Loading assigned guests..." : `${guests.length} guest${guests.length === 1 ? "" : "s"} on the manifest.`, icon: Users },
    { key: "date", label: "Confirm departure date", ready: departureReady, detail: departureReady ? formatDate(departureDate) : "A valid upcoming departure date is required.", icon: CalendarDays },
  ];
  // Declare readinessComplete for use by the surrounding module or function.
  const readinessComplete = Boolean(nextTour && readiness.every((item) => item.ready));

  // Declare startTour for use by the surrounding module or function.
  const startTour = (tour) => {
    // Declare id for use by the surrounding module or function.
    const id = tour?._id || tour?.id;
    // Check the condition (!id) and run the matching branch.
    if (!id) return toast.error("This assignment has no valid tour identifier.");
    // Perform the side effect or state update expressed on the following line.
    statusMutation.mutate({ tourId: id, status: "ongoing" });
  };

  // Declare completeTour for use by the surrounding module or function.
  const completeTour = (tour) => {
    // Declare id for use by the surrounding module or function.
    const id = tour?._id || tour?.id;
    // Check the condition (!id) and run the matching branch.
    if (!id) return toast.error("This assignment has no valid tour identifier.");
    // Perform the side effect or state update expressed on the following line.
    statusMutation.mutate({ tourId: id, status: "completed" });
  };

  // Declare submitReport for use by the surrounding module or function.
  const submitReport = () => {
    // Check the condition (!selectedTourId) and run the matching branch.
    if (!selectedTourId) return toast.error("Select an assigned tour first.");
    // Check the condition (!reportSummary.trim()) and run the matching branch.
    if (!reportSummary.trim()) return toast.error("Add a short tour summary before submitting the report.");
    // Perform the side effect or state update expressed on the following line.
    reportMutation.mutate({
      tourId: selectedTourId,
      reportData: {
        summary: reportSummary.trim(),
        issues: reportIssues.split("\n").map((item) => item.trim()).filter(Boolean),
        photos: [],
      },
    });
  };

  // Check the condition (dashboardQuery.isLoading) and run the matching branch.
  if (dashboardQuery.isLoading) return <div className="ops-page"><div className="ops-card ops-panel">Loading guide operations...</div></div>;

  // Check the condition (dashboardQuery.isError) and run the matching branch.
  if (dashboardQuery.isError) return (
    <div className="ops-page">
      <div className="ops-card ops-panel">
        <div className="ops-panel-title">Guide dashboard unavailable</div>
        <div className="ops-alert">{dashboardQuery.error?.response?.data?.message || dashboardQuery.error?.message || "Unable to load your assigned tours."}</div>
        <button className="btn btn-secondary" type="button" onClick={() => dashboardQuery.refetch()} disabled={dashboardQuery.isFetching}>
          <RefreshCw size={15} /> {dashboardQuery.isFetching ? "Refreshing..." : "Retry"}
        </button>
      </div>
    </div>
  );

  // Return the expression shown below to the caller.
  return (
    <div className="ops-page">
      <div className="ops-page-head">
        <div>
          <div className="ops-page-title">Guide Operations</div>
          <div className="ops-page-subtitle">Assigned departures, guest manifests, tour status and tour-day readiness.</div>
        </div>
        <div className="flex items-center gap-2">
          <Link className="btn btn-secondary" to="/guide/assigned-tours">Assigned Tours</Link>
          <button className="btn btn-secondary" type="button" onClick={() => { dashboardQuery.refetch(); if (selectedTourId) guestQuery.refetch(); }} disabled={dashboardQuery.isFetching || guestQuery.isFetching}>
            <RefreshCw size={15} className={dashboardQuery.isFetching || guestQuery.isFetching ? "spin" : ""} /> {dashboardQuery.isFetching || guestQuery.isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="ops-kpis">
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Assigned Tours</div><div className="ops-kpi-value">{assignedTours}</div><div className="ops-kpi-meta">Tenant-scoped assignments</div></div>
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Next Departure</div><div className="ops-kpi-value">{nextTour ? formatDate(startDateOf(nextTour), { day: "numeric", month: "short" }) : "—"}</div><div className="ops-kpi-meta">{nextTour ? statusLabel(nextTour.status) : "No scheduled assignment"}</div></div>
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Guests</div><div className="ops-kpi-value">{assignedGuests}</div><div className="ops-kpi-meta">Confirmed/active booking guests</div></div>
        <div className="ops-card ops-kpi"><div className="ops-kpi-label">Completed</div><div className="ops-kpi-value">{completedTours}</div><div className="ops-kpi-meta">Tours closed out</div></div>
      </div>

      {activeTours.length > 0 && <div className="ops-card ops-alert" role="status"><strong>{activeTours.length} tour{activeTours.length === 1 ? " is" : "s are"} currently in progress.</strong> Keep guest movements and tour-day updates current.</div>}

      <div className="ops-grid-2">
        <div className="ops-card ops-panel">
          <div className="ops-panel-head"><div><div className="ops-panel-title">Upcoming assignments</div><div className="ops-kpi-meta">Open a tour for guests, status and reporting actions.</div></div><span className="ops-status neutral">{upcoming.length} upcoming</span></div>
          {upcoming.length === 0 ? <div className="ops-alert">No upcoming tours are assigned to you. New assignments will appear here once operations allocates them.</div> : (
            <div className="ops-list">
              {upcoming.slice(0, 10).map(({ tour }) => {
                const tourId = tour?._id || tour?.id;
                const isOngoing = lower(tour?.status) === "ongoing";
                return (
                  <div className="ops-list-item" key={tourId}>
                    <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => setOpenTour(tour)}>
                      <MapPinned size={15} className="shrink-0" />
                      <span className="min-w-0 truncate">{firstValue(tour.title, tour.destination?.name, tour.location, "Assigned tour")}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className={`ops-status ${isOngoing ? "success" : "neutral"}`}>{statusLabel(tour.status)}</span>
                      <span className="hidden text-sm text-slate-500 sm:inline">{formatDate(startDateOf(tour), { day: "numeric", month: "short" })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="ops-card ops-panel">
          <div className="ops-panel-head">
            <div><div className="ops-panel-title">Tour-day readiness</div>{nextTour && <div className="ops-kpi-meta">{firstValue(nextTour.title, getRouteLabel(nextTour), "Upcoming tour")} · {formatDate(startDateOf(nextTour))}</div>}</div>
            <span className={`ops-status ${readinessComplete ? "success" : nextTour ? "warning" : "neutral"}`}>{nextTour ? (readinessComplete ? "Ready for departure" : `${readiness.filter((item) => item.ready).length}/3 ready`) : "No assignment"}</span>
          </div>
          {!nextTour ? <div className="ops-alert">No upcoming assignment to prepare for.</div> : <div className="ops-list">
            {readiness.map((item) => {
              const Icon = item.icon;
              return <button className="ops-list-item" type="button" key={item.key} onClick={() => setOpenReadiness(item.key)}><span><Icon size={15} /> {item.label}</span><span className={`ops-status ${item.ready ? "success" : "warning"}`}>{item.ready ? "Ready" : "Needs attention"}</span></button>;
            })}
          </div>}
        </div>
      </div>

      <div className="ops-card ops-panel">
        <div className="ops-panel-head"><div><div className="ops-panel-title">Guide action center</div><div className="ops-kpi-meta">Use these controls to keep assignment status and tour reporting aligned with operations.</div></div></div>
        <div className="grid gap-3 sm:grid-cols-3">
          <button className="btn btn-secondary justify-center" type="button" onClick={() => nextTour ? setOpenTour(nextTour) : toast.info("There is no upcoming assignment to open.")}><MapPinned size={15} /> Open next assignment</button>
          <button className="btn btn-secondary justify-center" type="button" onClick={() => nextTourId ? setOpenReadiness("manifest") : toast.info("There is no upcoming assignment with a guest manifest.")}><Users size={15} /> Guest manifest</button>
          <button className="btn btn-secondary justify-center" type="button" onClick={() => selectedTour ? setOpenTour(selectedTour) : toast.info("Select an assigned tour before filing a report.")}><Send size={15} /> Submit tour report</button>
        </div>
      </div>

      {openReadiness && nextTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-label="Tour-day readiness details">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><div className="text-xl font-bold text-slate-900">{readiness.find((item) => item.key === openReadiness)?.label}</div><div className="mt-1 text-sm text-slate-500">{firstValue(nextTour.title, getRouteLabel(nextTour), "Upcoming tour")}</div></div><button className="btn btn-secondary" type="button" onClick={() => setOpenReadiness(null)} aria-label="Close readiness details"><X size={17} /></button></div>
            {openReadiness === "route" && <div className="mt-5 space-y-3 text-sm text-slate-700"><div><strong>Route:</strong> {getRouteLabel(nextTour) || "Not configured"}</div><div><strong>Pickup points:</strong> {pickupLocations.length ? pickupLocations.join(", ") : "No guest pickup points recorded"}</div>{!routeReady && <div className="ops-alert">Ask operations to complete the route or guest pickup details before departure.</div>}</div>}
            {openReadiness === "manifest" && <div className="mt-5">{guestQuery.isLoading ? <div className="ops-alert">Loading guest manifest...</div> : guestQuery.isError ? <div className="ops-alert">Guest manifest unavailable: {guestQuery.error?.response?.data?.message || guestQuery.error?.message || "Unable to load guests."}</div> : guests.length === 0 ? <div className="ops-alert">No confirmed or active guests are currently assigned to this tour.</div> : <div className="ops-list">{guests.map((guest, index) => <div className="ops-list-item" key={guest?._id || guest?.id || index}><span><Users size={15} /> {customerName(guest, index)}</span><span className="text-sm text-slate-500">{getPickupLocation(guest) || "Pickup not recorded"}</span></div>)}</div>}</div>}
            {openReadiness === "date" && <div className="mt-5 space-y-3 text-sm text-slate-700"><div><strong>Departure:</strong> {formatDate(startDateOf(nextTour), { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div><div><strong>End:</strong> {formatDate(endDateOf(nextTour), { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div><div><strong>Status:</strong> {departureReady ? "Upcoming departure confirmed." : "Departure date needs attention."}</div></div>}
            <div className="mt-6 flex justify-end gap-2"><button className="btn btn-primary" type="button" onClick={() => setOpenReadiness(null)}>Done</button></div>
          </div>
        </div>
      )}

      {openTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-label="Assigned tour details">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><div className="text-xl font-bold text-slate-900">{firstValue(openTour.title, getRouteLabel(openTour), "Assigned tour")}</div><div className="mt-1 text-sm text-slate-500">{statusLabel(openTour.status)} · {formatDate(startDateOf(openTour))}</div></div><button className="btn btn-secondary" type="button" onClick={() => setOpenTour(null)} aria-label="Close tour details"><X size={17} /></button></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-xl bg-slate-50 p-4"><div className="text-xs font-semibold uppercase text-slate-500">Guests</div><div className="mt-1 text-lg font-bold">{firstNumeric(openTour.guests, openTour.guestsCount, 0)}</div></div><div className="rounded-xl bg-slate-50 p-4"><div className="text-xs font-semibold uppercase text-slate-500">Route</div><div className="mt-1 font-semibold">{getRouteLabel(openTour) || "Unavailable"}</div></div><div className="rounded-xl bg-slate-50 p-4"><div className="text-xs font-semibold uppercase text-slate-500">Start</div><div className="mt-1 font-semibold">{formatDate(startDateOf(openTour), { day: "numeric", month: "short", year: "numeric" })}</div></div><div className="rounded-xl bg-slate-50 p-4"><div className="text-xs font-semibold uppercase text-slate-500">End</div><div className="mt-1 font-semibold">{formatDate(endDateOf(openTour), { day: "numeric", month: "short", year: "numeric" })}</div></div></div>
            <div className="mt-5 flex flex-wrap gap-2">
              {(lower(openTour.status) === "scheduled" || lower(openTour.status) === "upcoming") && <button className="btn btn-primary" type="button" onClick={() => startTour(openTour)} disabled={statusMutation.isPending}><PlayCircle size={15} /> {statusMutation.isPending ? "Updating..." : "Start tour"}</button>}
              {lower(openTour.status) === "ongoing" && <button className="btn btn-primary" type="button" onClick={() => completeTour(openTour)} disabled={statusMutation.isPending}><CheckCircle2 size={15} /> {statusMutation.isPending ? "Updating..." : "Complete tour"}</button>}
              <button className="btn btn-secondary" type="button" onClick={() => { setOpenReadiness("manifest"); }}><Users size={15} /> View guests</button>
            </div>
            <div className="mt-6 border-t border-slate-200 pt-5"><div className="text-sm font-bold text-slate-900">Tour report</div><div className="mt-3 grid gap-3"><textarea value={reportSummary} onChange={(event) => setReportSummary(event.target.value)} rows={3} className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-emerald-500" placeholder="Summarize the tour, guest experience and operational outcome..." /><textarea value={reportIssues} onChange={(event) => setReportIssues(event.target.value)} rows={3} className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-emerald-500" placeholder="Optional: one issue per line" /><div className="flex justify-end"><button className="btn btn-primary" type="button" onClick={submitReport} disabled={reportMutation.isPending}><Send size={15} /> {reportMutation.isPending ? "Submitting..." : "Submit report"}</button></div></div></div>
          </div>
        </div>
      )}
    </div>
  );
}
