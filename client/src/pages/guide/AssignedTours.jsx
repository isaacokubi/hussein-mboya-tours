import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, MapPin, Users, RefreshCw, Eye, Play, Flag, X } from "lucide-react";
import { getAssignedTours, getTourGuests, updateTourStatus } from "../../api/guideApi";

const idOf = (tour) => tour?._id || tour?.id;
const statusOf = (tour) => String(tour?.status || "assigned").toLowerCase();
const formatDate = (value) => {
  if (!value) return "Date not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date not set" : date.toLocaleDateString();
};

export default function AssignedTours() {
  const queryClient = useQueryClient();
  const [selectedTour, setSelectedTour] = useState(null);
  const [showGuests, setShowGuests] = useState(false);
  const [actionId, setActionId] = useState("");
  const [message, setMessage] = useState("");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["guide-assigned-tours"],
    queryFn: getAssignedTours,
  });

  const tours = Array.isArray(data) ? data : data?.tours || data?.data?.tours || data?.data || [];

  const guestsQuery = useQuery({
    queryKey: ["guide-tour-guests", idOf(selectedTour)],
    queryFn: () => getTourGuests(idOf(selectedTour)),
    enabled: Boolean(selectedTour && showGuests),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateTourStatus(id, status),
    onSuccess: async (_, variables) => {
      setMessage(variables.status === "ongoing" ? "Tour started successfully." : "Tour completed successfully.");
      await queryClient.invalidateQueries({ queryKey: ["guide-assigned-tours"] });
      setSelectedTour((current) => current ? { ...current, status: variables.status } : current);
      setActionId("");
    },
    onError: (error) => {
      setMessage(error?.response?.data?.message || error?.message || "Unable to update tour status.");
      setActionId("");
    },
  });

  const openTour = (tour) => {
    setSelectedTour(tour);
    setShowGuests(false);
    setMessage("");
  };

  const closeTour = () => {
    setSelectedTour(null);
    setShowGuests(false);
    setMessage("");
  };

  const changeStatus = (tour, status) => {
    const id = idOf(tour);
    if (!id) return;
    setActionId(`${id}:${status}`);
    setMessage("");
    statusMutation.mutate({ id, status });
  };

  if (isLoading) return <div className="min-h-screen bg-slate-50 p-8 text-slate-500">Loading assigned tours...</div>;
  if (isError) return <div className="min-h-screen bg-slate-50 p-8 text-red-700">Unable to load assigned tours. Please refresh and try again.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div><h1 className="text-3xl font-bold text-slate-900">Assigned Tours</h1><p className="mt-1 text-slate-500">Manage tours assigned to you and review departure details.</p></div>
          <button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 font-semibold" disabled={isFetching}>{isFetching ? <RefreshCw className="animate-spin" size={17}/> : <RefreshCw size={17}/>} {isFetching ? "Refreshing..." : "Refresh"}</button>
        </header>

        {message && <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800" role="status">{message}</div>}
        {!tours.length && <div className="rounded-2xl bg-white p-10 text-center shadow-sm"><h2 className="text-lg font-bold">No assigned tours</h2><p className="mt-2 text-slate-500">New assignments will appear here.</p></div>}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tours.map((tour) => {
            const id = idOf(tour);
            const status = statusOf(tour);
            const canStart = ["assigned", "scheduled", "upcoming"].includes(status);
            return (
              <article key={id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-3"><h2 className="text-lg font-bold">{tour.title || tour.name || tour.tour?.title || "Assigned tour"}</h2><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700">{status}</span></div>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="flex gap-2"><CalendarDays size={17}/>{formatDate(tour.travelDate || tour.startDate)}</p>
                  <p className="flex gap-2"><MapPin size={17}/>{tour.location || tour.destination?.name || tour.destination || "Location not set"}</p>
                  <p className="flex gap-2"><Users size={17}/>{tour.numberOfGuests || tour.guestsCount || tour.capacity || 0} guests</p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" onClick={() => openTour(tour)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-50"><Eye size={15}/> View / Details</button>
                  {canStart && <button type="button" onClick={() => changeStatus(tour, "ongoing")} disabled={Boolean(actionId)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Play size={15}/> {actionId === `${id}:ongoing` ? "Starting..." : "Start"}</button>}
                  {status === "ongoing" && <button type="button" onClick={() => changeStatus(tour, "completed")} disabled={Boolean(actionId)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Flag size={15}/> {actionId === `${id}:completed` ? "Completing..." : "Complete"}</button>}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {selectedTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5"><div><h2 className="text-xl font-bold">{selectedTour.title || selectedTour.name || selectedTour.tour?.title || "Tour Details"}</h2><p className="text-sm text-slate-500">Tour ID: {idOf(selectedTour)}</p></div><button type="button" onClick={closeTour} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Close"><X size={20}/></button></div>
            <div className="grid gap-5 p-5 md:grid-cols-2">
              <div className="space-y-3"><h3 className="font-semibold">Departure</h3><p><span className="text-slate-500">Date:</span> {formatDate(selectedTour.travelDate || selectedTour.startDate)}</p><p><span className="text-slate-500">Location:</span> {selectedTour.location || selectedTour.destination?.name || selectedTour.destination || "—"}</p><p><span className="text-slate-500">Pickup:</span> {selectedTour.pickupLocation || selectedTour.pickupTime || "—"}</p><p><span className="text-slate-500">Status:</span> {statusOf(selectedTour)}</p></div>
              <div className="space-y-3"><h3 className="font-semibold">Assignment</h3><p><span className="text-slate-500">Guests:</span> {selectedTour.numberOfGuests || selectedTour.guestsCount || selectedTour.capacity || 0}</p><p><span className="text-slate-500">Vehicle:</span> {selectedTour.assignedVehicle?.registrationNumber || selectedTour.assignedVehicle?.plateNumber || selectedTour.vehicle?.registrationNumber || "Not assigned"}</p><p><span className="text-slate-500">Guide:</span> {selectedTour.assignedGuide?.name || selectedTour.guide?.name || "You"}</p></div>
            </div>
            <div className="border-t p-5"><button type="button" onClick={() => setShowGuests((value) => !value)} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-semibold"><Users size={16}/> {showGuests ? "Hide Guests" : "View Guests"}</button>{showGuests && <div className="mt-4">{guestsQuery.isLoading ? <p className="text-slate-500">Loading guests...</p> : guestsQuery.isError ? <p className="text-red-600">Unable to load guests.</p> : <pre className="max-h-64 overflow-auto rounded-lg bg-slate-50 p-4 text-xs">{JSON.stringify(guestsQuery.data?.guests || guestsQuery.data?.data?.guests || guestsQuery.data, null, 2)}</pre>}</div>}</div>
            <div className="flex justify-end border-t p-5"><button type="button" onClick={closeTour} className="rounded-lg border px-4 py-2">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
