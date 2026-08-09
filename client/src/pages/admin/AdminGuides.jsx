import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

export default function AdminGuides() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-guides"],
    queryFn: async () => (await api.get("/staff", {
      params: { position: "guide", status: "active", limit: 100 },
    })).data,
  });

  const guides = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.guides)
      ? data.guides
      : [];

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
            </tr>
          </thead>
          <tbody>
            {guides.map((guide) => (
              <tr key={guide._id} className="border-t">
                <td className="p-4 font-medium">{guide.name}</td>
                <td className="p-4">{guide.email || "—"}</td>
                <td className="p-4">{guide.phone || "—"}</td>
                <td className="p-4 capitalize">{guide.availability || "—"}</td>
                <td className="p-4 capitalize">{guide.status || "active"}</td>
              </tr>
            ))}
            {!guides.length && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  No active guides found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
