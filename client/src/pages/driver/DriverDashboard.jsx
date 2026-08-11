import { useQuery } from "@tanstack/react-query";
import { FaCalendarAlt, FaCar, FaCheckCircle, FaClock, FaMapMarkerAlt, FaUserTie } from "react-icons/fa";
import { getDriverDashboard } from "../../api/driverApi";
import AssignmentNotifications from "../../components/notifications/AssignmentNotifications";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-KE", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date not set";

export default function DriverDashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["driverDashboard"],
    queryFn: getDriverDashboard,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 p-8"><div className="mx-auto max-w-7xl animate-pulse"><div className="h-32 rounded-3xl bg-slate-200" /></div></div>;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-2xl rounded-2xl bg-red-50 p-6 text-red-700">
          {error?.response?.data?.message || "Unable to load driver dashboard."}
        </div>
      </div>
    );
  }

  const tours = data?.tours || data?.data?.tours || [];
  const stats = data?.stats || {};

  const cards = [
    ["Assigned Tours", stats.totalTours || tours.length, <FaCalendarAlt />],
    ["Upcoming", stats.upcomingTours || 0, <FaClock />],
    ["Ongoing", stats.ongoingTours || 0, <FaMapMarkerAlt />],
    ["Completed", stats.completedTours || 0, <FaCheckCircle />],
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 to-emerald-900 p-6 text-white shadow-xl md:p-8">
          <p className="text-sm font-medium text-emerald-200">Driver Operations</p>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">Driver Dashboard</h1>
          <p className="mt-2 max-w-2xl text-slate-200">Your assigned safari transport, schedules and tour instructions in one place.</p>
        </header>

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

        <h2 className="mb-4 text-2xl font-bold text-slate-900">My Assigned Tours</h2>

        <div className="grid gap-5 lg:grid-cols-2">
          {tours.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm lg:col-span-2">
              No tours are currently assigned to you.
            </div>
          ) : tours.map((tour) => (
            <article key={tour._id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{tour.title || "Untitled Tour"}</h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <FaMapMarkerAlt /> {tour.destination?.name || tour.location || "Destination not set"}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                  {tour.status || "upcoming"}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-400">Start</span><p className="font-semibold">{formatDate(tour.startDate || tour.date)}</p></div>
                <div><span className="text-slate-400">End</span><p className="font-semibold">{formatDate(tour.endDate || tour.startDate || tour.date)}</p></div>
                <div className="flex items-center gap-2"><FaCar className="text-emerald-600" />{tour.assignedVehicle?.name || "No vehicle"}</div>
                <div className="flex items-center gap-2"><FaUserTie className="text-emerald-600" />{tour.assignedGuide?.name || "No guide"}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
