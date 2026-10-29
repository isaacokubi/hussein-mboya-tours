import { useState } from "react";
import { useTenant } from "../context/TenantContext";
import { useSettings } from "../context/SettingsContext";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import DestinationCard from "../components/destinations/DestinationCard";

export default function Destinations() {
  const { tenant } = useTenant();
  const { settings } = useSettings();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["destinations", page],
    queryFn: async () => {
      const response = await api.get("/destinations", { params: { page, limit: 24 } });
      const payload = response.data || {};
      return {
        destinations: Array.isArray(payload) ? payload : (Array.isArray(payload.data) ? payload.data : []),
        total: Number(payload?.pagination?.total ?? payload?.count ?? (Array.isArray(payload) ? payload.length : payload?.data?.length ?? 0)),
        pagination: payload?.pagination || null,
      };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading destinations...</div>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center text-slate-700"><h2 className="text-2xl font-bold">We are refreshing our destination guide.</h2><p>Please try again shortly.</p></div>

  const destinations = data?.destinations || [];
  const destinationCount = data?.total ?? destinations.length;
  const totalPages = Number(data?.pagination?.pages || 1);

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Explore Destinations</h1>
            <p className="text-gray-600 mt-3">Discover amazing places and unforgettable experiences with {settings?.companyName || tenant?.name || "Hussein Mboya Tours"}.</p>
          </div>
          <div className="bg-white rounded-full px-5 py-2 shadow-sm text-gray-700 font-semibold">{destinationCount} {destinationCount === 1 ? "Destination" : "Destinations"}</div>
        </div>
        {destinations.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center">No destinations available.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((destination) => <DestinationCard key={destination._id} destination={destination} />)}
          </div>
        )}
        {totalPages > 1 && <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Destination pages">
          <button type="button" className="rounded-lg border bg-white px-4 py-2 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
          <span aria-live="polite" className="text-sm text-slate-700">Page {page} of {totalPages}</span>
          <button type="button" className="rounded-lg border bg-white px-4 py-2 disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</button>
        </nav>}
      </div>
    </div>
  );
}
