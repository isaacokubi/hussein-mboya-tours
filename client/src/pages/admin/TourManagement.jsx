import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Eye, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { deleteTour, getAdminTours } from "../../api/adminTourApi";
import Loader from "../../components/common/Loader";

export default function TourManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-tours"],
    queryFn: () => getAdminTours({ limit: 100 }),
  });

  const tours = Array.isArray(data) ? data : data?.tours || data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: deleteTour,
    onSuccess: () => {
      toast.success("Tour deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-tours"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete tour");
    },
  });

  const filteredTours = tours.filter((tour) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [tour.title, tour.name, tour.destination?.name, tour.location]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  const totalPages = Math.max(1, Math.ceil(filteredTours.length / pageSize));
  const visibleTours = filteredTours.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [search]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (isLoading) return <Loader />;
  if (isError) {
    return <div className="p-6"><div className="rounded-lg bg-red-100 p-4 text-red-700">Failed to load tours.</div></div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tour Management</h1>
          <p className="text-gray-500">Create, update and manage all tours</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/tours/add")}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700"
        >
          <Plus size={18} /> Add Tour
        </button>
      </div>

      <div className="flex gap-4 rounded-xl bg-white p-4 shadow">
        <div className="flex flex-1 items-center rounded-lg border px-3">
          <Search size={20} className="text-gray-400" />
          <input
            type="search"
            placeholder="Search tours..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full p-2 outline-none"
          />
        </div>
        <button type="button" onClick={() => refetch()} className="flex items-center gap-2 rounded-lg border px-4 hover:bg-gray-100">
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Tour</th>
              <th className="p-4">Destination</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleTours.length === 0 ? (
              <tr><td colSpan="5" className="p-6 text-center text-gray-500">No tours available</td></tr>
            ) : visibleTours.map((tour) => (
              <tr key={tour._id} className="border-t">
                <td className="p-4 font-semibold">{tour.title || tour.name || "Untitled tour"}</td>
                <td className="p-4 text-center">{tour.destination?.name || tour.destination || "-"}</td>
                <td className="p-4 text-center">KES {Number(tour.price || 0).toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">{tour.status || "draft"}</span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button type="button" title="View tour" onClick={() => navigate(`/tours/${tour.slug || tour._id}`)} className="text-blue-600 hover:text-blue-800">
                      <Eye size={18} />
                    </button>
                    <button
                      type="button"
                      title="Edit tour"
                      onClick={() => navigate(`/admin/tours/edit/${tour._id}`)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      type="button"
                      title="Delete tour"
                      onClick={() => deleteMutation.mutate(tour._id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-800 disabled:opacity-40"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow">
        <span className="text-sm text-gray-500">Page {page} of {totalPages} · {filteredTours.length} tour(s)</span>
        <div className="flex gap-2">
          <button type="button" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border px-4 py-2 disabled:opacity-40">Previous</button>
          <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}
