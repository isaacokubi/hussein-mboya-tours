/**
 * Purpose: Manage Tours page-level UI component. Main declarations: getTourDestination, getTourList, ManageTours.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useState } from "react";
// Load react-router-dom so this module can use its exported dependencies.
import { Link } from "react-router-dom";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load ../../api/adminTourApi so this module can use its exported dependencies.
import { deleteTour, getAdminTours } from "../../api/adminTourApi";

// Declare getTourDestination for use by the surrounding module or function.
const getTourDestination = (tour) => {
  // Declare destination for use by the surrounding module or function.
  const destination = tour?.destination;
  // Check the condition (destination && typeof destination === "object") and run the matching branch.
  if (destination && typeof destination === "object") return destination;
  // Return the expression shown below to the caller.
  return null;
};

// Declare getTourList for use by the surrounding module or function.
const getTourList = (data) => {
  // Check the condition (Array.isArray(data)) and run the matching branch.
  if (Array.isArray(data)) return data;
  // Check the condition (Array.isArray(data?.tours)) and run the matching branch.
  if (Array.isArray(data?.tours)) return data.tours;
  // Check the condition (Array.isArray(data?.data)) and run the matching branch.
  if (Array.isArray(data?.data)) return data.data;
  // Check the condition (Array.isArray(data?.data?.tours)) and run the matching branch.
  if (Array.isArray(data?.data?.tours)) return data.data.tours;
  // Return the collection assembled below to the caller.
  return [];
};

// Define ManageTours; its parameters and body implement this operation.
export default function ManageTours() {
  // Declare queryClient for use by the surrounding module or function.
  const queryClient = useQueryClient();
  // Declare [search, setSearch] for use by the surrounding module or function.
  const [search, setSearch] = useState("");
  // Declare { data, isLoading, error } for use by the surrounding module or function.
  const { data, isLoading, error } = useQuery({ queryKey: ["adminTours"], queryFn: getAdminTours });
  // Declare tours for use by the surrounding module or function.
  const tours = getTourList(data);

  // Declare { mutate: removeTour, isPending } for use by the surrounding module or function.
  const { mutate: removeTour, isPending } = useMutation({
    mutationFn: deleteTour,
    onSuccess: () => {
      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({ queryKey: ["adminTours"] });
      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      // Perform the side effect or state update expressed on the following line.
      toast.success("Tour deleted successfully");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to delete tour"),
  });

  // Declare filteredTours for use by the surrounding module or function.
  const filteredTours = tours.filter((tour) => {
    // Declare destination for use by the surrounding module or function.
    const destination = getTourDestination(tour);
    // Declare haystack for use by the surrounding module or function.
    const haystack = [tour?.title, destination?.name, destination?.slug, tour?.country, tour?.location]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    // Return the result of haystack.includes() to the caller.
    return haystack.includes(search.trim().toLowerCase());
  });

  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) return <div className="flex justify-center py-20">Loading tours...</div>;
  // Check the condition (error) and run the matching branch.
  if (error) return <div className="p-6 text-red-600">Failed loading tours.</div>;

  // Return the expression shown below to the caller.
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tours Management</h1>
          <p className="mt-1 text-sm text-slate-500">Every tour must have a valid destination relationship.</p>
        </div>
        <div className="flex gap-4">
          <input
            type="search"
            placeholder="Search tours or destinations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 rounded-lg border px-4 py-2"
          />
          <Link to="/admin/create-tour" state={{ returnTo: "/admin/tours" }} className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700">
            Add Tour
          </Link>
        </div>
      </div>

      {filteredTours.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow">
          <h2 className="text-xl font-semibold">No tours found</h2>
          {tours.length > 0 && <p className="mt-2 text-sm text-slate-500">Try a different search term.</p>}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredTours.map((tour) => {
            const destination = getTourDestination(tour);
            const destinationSlug = destination?.slug || destination?._id;
            const destinationName = destination?.name || "Destination not assigned";
            const image = tour?.featuredImage?.url || tour?.image || tour?.images?.[0]?.url || tour?.images?.[0] || "/images/tour-placeholder.jpg";

            return (
              <div key={tour._id} className="overflow-hidden rounded-xl bg-white shadow">
                <img src={image} alt={tour.title || "Tour"} className="h-48 w-full object-cover" />
                <div className="p-5">
                  <h2 className="text-xl font-bold">{tour.title}</h2>

                  {destinationSlug ? (
                    <Link to={`/destinations/${destinationSlug}`} className="mt-2 block font-medium text-green-700 hover:underline">
                      📍 {destinationName}
                    </Link>
                  ) : (
                    <p className="mt-2 font-medium text-red-600">⚠ Destination not assigned</p>
                  )}

                  <p className="mt-3 font-bold text-yellow-600">KES {Number(tour.price || 0).toLocaleString()}</p>
                  <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">{tour.status || "active"}</span>

                  <div className="mt-5 flex gap-3">
                    <Link to={`/admin/tours/${tour._id}/edit`} state={{ returnTo: "/admin/tours" }} className="flex-1 rounded bg-blue-600 px-4 py-2 text-center text-white">
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => window.confirm("Are you sure you want to delete this tour?") && removeTour(tour._id)}
                      className="flex-1 rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
