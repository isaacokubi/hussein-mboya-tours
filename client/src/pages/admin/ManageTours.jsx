import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteTour, getAdminTours } from "../../api/adminTourApi";

const getTourDestination = (tour) => {
  const destination = tour?.destination;
  if (destination && typeof destination === "object") return destination;
  return null;
};

const getTourList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.tours)) return data.tours;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.tours)) return data.data.tours;
  return [];
};

export default function ManageTours() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery({ queryKey: ["adminTours"], queryFn: getAdminTours });
  const tours = getTourList(data);

  const { mutate: removeTour, isPending } = useMutation({
    mutationFn: deleteTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTours"] });
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      toast.success("Tour deleted successfully");
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to delete tour"),
  });

  const filteredTours = tours.filter((tour) => {
    const destination = getTourDestination(tour);
    const haystack = [tour?.title, destination?.name, destination?.slug, tour?.country, tour?.location]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  });

  if (isLoading) return <div className="flex justify-center py-20">Loading tours...</div>;
  if (error) return <div className="p-6 text-red-600">Failed loading tours.</div>;

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
          <Link to="/tour-manager/create-tour" className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700">
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
                    <Link to={`/tour-manager/edit-tour/${tour._id}`} className="flex-1 rounded bg-blue-600 px-4 py-2 text-center text-white">
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
