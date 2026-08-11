import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaCalendarAlt, FaCar, FaCheckCircle, FaClock, FaMapMarkerAlt, FaUsers, FaUserTie } from "react-icons/fa";
import { toast } from "react-toastify";
import { getGuideDashboard, updateTourStatus } from "../../api/guideApi";
import AssignmentNotifications from "../../components/notifications/AssignmentNotifications";
import MobileDashboardNav from "../../components/common/MobileDashboardNav";

const startOfDay = (value) => {
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }) : "Date not set";

const statusClass = {
  upcoming: "bg-blue-50 text-blue-700",
  scheduled: "bg-blue-50 text-blue-700",
  ongoing: "bg-amber-50 text-amber-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function TourGuideDashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["guideDashboard"],
    queryFn: getGuideDashboard,
  });

  const tours = data?.tours || data?.data?.tours || [];
  const stats = data?.stats || {};

  const nextTour = useMemo(
    () => tours.find((tour) => {
      const start = startOfDay(tour.startDate || tour.date);
      return tour.status !== "completed" && tour.status !== "cancelled" && start >= startOfDay(new Date());
    }),
    [tours]
  );

  const mutation = useMutation({
    mutationFn: (id) => updateTourStatus(id, "ongoing"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guideDashboard"] });
      toast.success("Tour started successfully.");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "The tour cannot be started yet."),
  });

  const canStart = (tour) => {
    const start = startOfDay(tour.startDate || tour.date);
    return start.getTime() === startOfDay(new Date()).getTime() && tour.status !== "ongoing" && tour.status !== "completed";
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-7xl animate-pulse"><div className="h-10 w-64 rounded bg-slate-200" /><div className="mt-6 h-32 rounded-2xl bg-slate-200" /></div></div>;
  }

  if (isError) {
    return <div className="p-8 text-red-600">{error?.response?.data?.message || error?.message || "Failed to load guide dashboard."}</div>;
  }

  const cards = [
    ["Assigned Tours", stats.totalTours ?? tours.length, <FaCalendarAlt />],
    ["Upcoming", tours.filter((t) => ["upcoming", "scheduled"].includes(t.status)).length, <FaClock />],
    ["Ongoing", stats.ongoingTours ?? tours.filter((t) => t.status === "ongoing").length, <FaMapMarkerAlt />],
    ["Completed", stats.completedTours ?? tours.filter((t) => t.status === "completed").length, <FaCheckCircle />],
  ];

  return (
    <>
      <MobileDashboardNav role="guide" title="Guide Dashboard" />
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 to-emerald-900 p-6 text-white shadow-xl md:p-8">
          <p className="text-sm font-medium text-emerald-200">Guide Operations</p>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">Guide Dashboard</h1>
          <p className="mt-2 max-w-2xl text-slate-200">Stay on top of your assigned trips, guests, transport and daily tour operations.</p>
          {nextTour && (
            <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <FaCalendarAlt />
              <span>Next trip: <strong>{nextTour.title}</strong> · {formatDate(nextTour.startDate || nextTour.date)}</span>
            </div>
          )}
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map(([label, value, icon]) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{label}</span>
                <span className="text-emerald-600">{icon}</span>
              </div>
              <div className="mt-3 text-3xl font-bold text-slate-900">{value}</div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <AssignmentNotifications />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">My Tours</h2>
            <p className="text-sm text-slate-500">Only start a tour on its exact scheduled start date.</p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {tours.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm lg:col-span-2">No tours are currently assigned to you.</div>
          ) : tours.map((tour) => {
            const start = tour.startDate || tour.date;
            const end = tour.endDate || start;
            const guests = Number(tour.guests || 0);
            const cls = statusClass[tour.status] || "bg-slate-100 text-slate-700";
            const startAllowed = canStart(tour);

            return (
              <article key={tour._id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start justify-between border-b border-slate-100 p-5">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{tour.title || "Untitled Tour"}</h3>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><FaMapMarkerAlt /> {tour.destination?.name || tour.location || tour.country || "Destination not set"}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${cls}`}>{tour.status || "upcoming"}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 p-5 text-sm">
                  <div><span className="text-slate-400">Start</span><p className="mt-1 font-semibold text-slate-800">{formatDate(start)}</p></div>
                  <div><span className="text-slate-400">End</span><p className="mt-1 font-semibold text-slate-800">{formatDate(end)}</p></div>
                  <div className="flex items-center gap-2"><FaUsers className="text-emerald-600" /><span><strong>{guests}</strong> guests</span></div>
                  <div className="flex items-center gap-2"><FaCar className="text-emerald-600" /><span>{tour.assignedVehicle?.name || "No vehicle"}</span></div>
                  <div className="flex items-center gap-2"><FaUserTie className="text-emerald-600" /><span>{tour.assignedDriver?.name || "No driver"}</span></div>
                  <div><span className="text-slate-400">Duration</span><p className="font-semibold">{tour.duration || `${tour.durationDetails?.days || 1} day(s)`}</p></div>
                </div>

                <div className="border-t border-slate-100 p-5">
                  <button
                    type="button"
                    onClick={() => mutation.mutate(tour._id)}
                    disabled={!startAllowed || mutation.isPending}
                    title={!startAllowed ? "The tour can only be started on its exact start date." : "Start this tour"}
                    className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                  >
                    {tour.status === "ongoing" ? "Tour In Progress" : mutation.isPending ? "Starting..." : startAllowed ? "Start Tour Today" : "Start Available On Start Date"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}
