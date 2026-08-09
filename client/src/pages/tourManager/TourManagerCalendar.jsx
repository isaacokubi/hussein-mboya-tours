import { useQuery } from "@tanstack/react-query";
import { getTours } from "../../api/tourManagerApi";

export default function TourManagerCalendar() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["tour-manager-calendar"],
    queryFn: () => getTours(),
  });
  const tours = Array.isArray(data) ? data : data?.tours || data?.data || [];

  if (isLoading) return <div className="p-6">Loading calendar...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load calendar data.</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Tour Calendar</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tours.map((tour) => (
          <div key={tour._id} className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold">{tour.title || tour.name}</h2>
            <p className="text-sm text-gray-500 mt-2">{tour.startDate ? new Date(tour.startDate).toLocaleDateString() : "Date not set"}</p>
            <p className="text-sm text-gray-500">{tour.endDate ? new Date(tour.endDate).toLocaleDateString() : ""}</p>
          </div>
        ))}
        {!tours.length && <p className="text-gray-500">No scheduled tours found.</p>}
      </div>
    </div>
  );
}
