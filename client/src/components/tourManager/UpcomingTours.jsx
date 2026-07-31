import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";

import { getUpcomingTours } from "../../api/tourApi";

export default function UpcomingTours() {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["managerUpcomingTours"],
    queryFn: () =>
      getUpcomingTours({
        limit: 5,
      }),
  });

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE RESPONSE
  |--------------------------------------------------------------------------
  */

  const tours =
    data?.tours ||
    data?.data ||
    [];

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        Loading upcoming tours...
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-red-600">
        {error?.message || "Failed to load tours."}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <CalendarDays className="text-green-700" />

        <h2 className="text-xl font-bold">
          Upcoming Tours
        </h2>
      </div>

      {tours.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          No upcoming tours found.
        </div>
      ) : (
        <div className="space-y-4">
          {tours.map((tour) => (
            <div
              key={tour._id}
              className="flex justify-between items-center border-b pb-4 last:border-b-0"
            >
              <div>
                <h3 className="font-semibold text-lg">
                  {tour.title}
                </h3>

                <p className="text-sm text-gray-600">
                  Destination:{" "}
                  {tour.destination?.name || "N/A"}
                </p>

                <p className="text-sm text-gray-600">
                  Guests:{" "}
                  {tour.bookedSeats ??
                    tour.totalGuests ??
                    0}
                </p>

                <p className="text-sm text-gray-600">
                  Guide:{" "}
                  {tour.guide?.name ||
                    "Not Assigned"}
                </p>

                <p className="text-sm text-gray-500">
                  {tour.startDate
                    ? new Date(
                        tour.startDate
                      ).toLocaleDateString()
                    : ""}
                </p>
              </div>

              <span
                className={`
                  px-3
                  py-1
                  rounded-full
                  text-sm
                  font-medium
                  ${
                    tour.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : tour.status === "Upcoming"
                      ? "bg-blue-100 text-blue-700"
                      : tour.status === "Confirmed"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }
                `}
              >
                {tour.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}