import { useQuery } from "@tanstack/react-query";
import { getDriverDashboard } from "../../api/driverApi";
import AssignmentNotifications from "../../components/notifications/AssignmentNotifications";
import MobileDashboardNav from "../../components/common/MobileDashboardNav";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date not set";

export default function DriverDashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["driver-dashboard"],
    queryFn: getDriverDashboard,
    staleTime: 30_000,
  });

  if (isLoading) return <div className="min-h-screen bg-slate-50 p-8">Loading driver dashboard...</div>;
  if (isError) return <div className="p-8 text-red-600">{error?.response?.data?.message || error?.message || "Unable to load driver dashboard."}</div>;

  const tours = data?.tours || data?.data?.tours || [];
  const stats = data?.stats || {};

  return (
    <>
      <MobileDashboardNav role="driver" title="Driver Dashboard" />
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 to-emerald-900 p-6 text-white shadow-xl md:p-8">
          <p className="text-sm text-emerald-200">Transport Operations</p>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">Driver Dashboard</h1>
          <p className="mt-2 text-slate-200">View assigned tours, passengers, guides and vehicles in one place.</p>
        </div>

        <div className="my-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            ["Assigned Tours", stats.totalTours ?? tours.length],
            ["Upcoming", stats.upcomingTours ?? 0],
            ["Ongoing", stats.ongoingTours ?? 0],
            ["Completed", stats.completedTours ?? 0],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <AssignmentNotifications />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {tours.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm lg:col-span-2">
              No tours are currently assigned to you.
            </div>
          ) : tours.map((tour) => (
            <article key={tour._id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{tour.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{tour.destination?.name || tour.location || tour.country || "Destination not set"}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">{tour.status || "scheduled"}</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-400">Start</span><p className="font-semibold">{formatDate(tour.startDate || tour.date)}</p></div>
                <div><span className="text-slate-400">End</span><p className="font-semibold">{formatDate(tour.endDate || tour.startDate || tour.date)}</p></div>
                <div><span className="text-slate-400">Passengers</span><p className="font-semibold">{tour.guests || 0}</p></div>
                <div><span className="text-slate-400">Bookings</span><p className="font-semibold">{tour.bookings || 0}</p></div>
                <div><span className="text-slate-400">Guide</span><p className="font-semibold">{tour.assignedGuide?.name || "Not assigned"}</p></div>
                <div><span className="text-slate-400">Vehicle</span><p className="font-semibold">{tour.assignedVehicle?.name || "Not assigned"}</p></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
