import { CalendarDays } from "lucide-react";

export default function UpcomingTours({ tours = [] }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <div className="mb-6 flex items-center gap-3">
        <CalendarDays className="text-green-700" />
        <h2 className="text-xl font-bold">Upcoming Tours</h2>
      </div>
      {tours.length === 0 ? (
        <div className="py-8 text-center text-gray-500">No upcoming tours found.</div>
      ) : (
        <div className="space-y-4">
          {tours.map((tour) => {
            const status = typeof tour.status === "object"
              ? tour.status?.status || "upcoming"
              : tour.status || "upcoming";
            return (
              <div key={tour._id} className="flex flex-col gap-3 border-b pb-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{tour.title || tour.name || "Untitled tour"}</h3>
                  <p className="text-sm text-gray-600">Destination: {tour.destination?.name || "N/A"}</p>
                  <p className="text-sm text-gray-600">Guests: {tour.bookedSeats ?? tour.totalGuests ?? 0}</p>
                  <p className="text-sm text-gray-600">Guide: {tour.guide?.name || "Not Assigned"}</p>
                  <p className="text-sm text-gray-500">{tour.startDate ? new Date(tour.startDate).toLocaleDateString() : "Date not set"}</p>
                </div>
                <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-sm font-medium capitalize text-gray-700">{status}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
