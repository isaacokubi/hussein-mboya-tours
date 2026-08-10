import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getGuides } from "../../api/tourManagerApi";

export default function TourManagerGuides() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useQuery({ queryKey: ["tour-manager-guides"], queryFn: getGuides });
  const guides = Array.isArray(data?.guides) ? data.guides : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  if (isLoading) return <div className="p-6">Loading guides...</div>;
  if (isError) return <div className="p-6 text-red-600">{error?.response?.data?.message || "Failed to load guides."}</div>;
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-3xl font-bold">Guides</h1><p className="text-gray-600">Available tour guides for assignments.</p></div>
          <button type="button" onClick={() => navigate("/tour-manager/assignments")} className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white">Tour Assignments</button>
        </div>
        {guides.length === 0 ? <div className="rounded-xl bg-white p-8 text-gray-600 shadow">No available guides found.</div> : <div className="grid gap-5 md:grid-cols-3">{guides.map(guide => <div key={guide._id} className="rounded-xl bg-white p-5 shadow"><h2 className="text-xl font-bold">{guide.name || "Unnamed Guide"}</h2><p className="mt-2 text-gray-600">{guide.email || "No email"}</p><p className="text-gray-600">{guide.phone || "No phone"}</p><p className="mt-2 text-sm capitalize text-gray-500">Availability: {guide.availability || "available"}</p></div>)}</div>}
      </div>
    </div>
  );
}
