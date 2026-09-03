import { CalendarDays, Car, UserRound, Users, MapPin } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "Date not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date not set" : date.toLocaleDateString();
};

const resourceName = (resource, fallback = "Not Assigned") => {
  if (!resource) return fallback;
  if (typeof resource === "string") return resource;
  return resource.name || resource.fullName || resource.registrationNumber || resource.registration || fallback;
};

export default function UpcomingTours({ tours = [] }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <div className="mb-6 flex items-center gap-3">
        <CalendarDays className="text-green-700" />
        <div>
          <h2 className="text-xl font-bold">Upcoming Tours</h2>
          <p className="text-sm text-gray-500">Scheduled tenant tours and live resource assignments</p>
        </div>
      </div>
      {tours.length === 0 ? (
        <div className="py-8 text-center text-gray-500">No upcoming tours found.</div>
      ) : (
        <div className="space-y-4">
          {tours.map((tour) => {
            const status = typeof tour.status === "object"
              ? tour.status?.status || "upcoming"
              : tour.status || "upcoming";
            const guide = tour.assignedGuide || tour.guide;
            const driver = tour.assignedDriver || tour.driver;
            const vehicle = tour.assignedVehicle || tour.vehicle;
            const guests = Number(tour.guests ?? tour.bookedSlots ?? tour.bookedSeats ?? tour.totalGuests ?? 0);
            const capacity = Number(tour.capacity || 0);
            const occupancy = Number(tour.occupancyRate ?? (capacity ? Math.round((guests / capacity) * 100) : 0));
            const startDate = tour.startDate || tour.date;
            const endDate = tour.endDate;
            return (
              <div key={tour._id || tour.id} className="rounded-lg border p-4 hover:bg-gray-50">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold">{tour.title || tour.name || "Untitled tour"}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-600"><MapPin size={14} />{tour.destination?.name || tour.location || "Destination not set"}</p>
                    <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                      <p className="flex items-center gap-2"><Users size={15} />Guests: {guests}{capacity ? ` / ${capacity}` : ""}</p>
                      <p className="flex items-center gap-2"><UserRound size={15} />Guide: {resourceName(guide)}</p>
                      <p className="flex items-center gap-2"><UserRound size={15} />Driver: {resourceName(driver)}</p>
                      <p className="flex items-center gap-2"><Car size={15} />Vehicle: {resourceName(vehicle)}</p>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {formatDate(startDate)}{endDate ? ` – ${formatDate(endDate)}` : ""}
                      {capacity ? ` • ${Math.min(100, Math.max(0, occupancy))}% occupied` : ""}
                    </p>
                  </div>
                  <span className="w-fit shrink-0 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium capitalize text-gray-700">{status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
