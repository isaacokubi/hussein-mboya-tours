import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "../../api/axios";

export default function AdminGuides() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-guides"],
    queryFn: async () => (await api.get("/staff", {
      params: { position: "guide", status: "active", limit: 10 },
    })).data,
  });

  const guides = useMemo(
      () =>
        Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.guides)
            ? data.guides
            : [],
      [data]
    );

  const availabilityMutation = useMutation({
    mutationFn: async ({ id, availability }) => {
      const response = await api.put(`/staff/${id}`, { availability });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Guide availability updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-guides"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to update guide availability.");
    },
  });

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(guides.length / pageSize));
  const visibleGuides = useMemo(
    () => guides.slice((page - 1) * pageSize, page * pageSize),
    [guides, page]
  );

  if (isLoading) return <div className="p-6">Loading guides...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load guides.</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Guide Management</h1>
        <p className="text-gray-600 mt-1">Active tour guides available for tour assignments.</p>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Availability</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Update availability</th>
            </tr>
          </thead>
          <tbody>
            {visibleGuides.map((guide) => (
              <tr key={guide._id} className="border-t">
                <td className="p-4 font-medium">{guide.name}</td>
                <td className="p-4">{guide.email || "—"}</td>
                <td className="p-4">{guide.phone || "—"}</td>
                <td className="p-4 capitalize">{guide.availability || "—"}</td>
                <td className="p-4 capitalize">{guide.status || "active"}</td>
                <td className="p-4">
                  <select
                    value={guide.availability || "available"}
                    disabled={availabilityMutation.isPending}
                    onChange={(e) => availabilityMutation.mutate({ id: guide._id, availability: e.target.value })}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="leave">On Leave</option>
                    <option value="offline">Offline</option>
                  </select>
                </td>
              </tr>
            ))}
            {!guides.length && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  No active guides found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded border px-3 py-2 disabled:opacity-40">Previous</button>
          <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded bg-gray-900 px-3 py-2 text-white disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}
