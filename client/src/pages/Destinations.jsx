import { useTenant } from "../context/TenantContext";
import { useSettings } from "../context/SettingsContext";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import DestinationCard from "../components/destinations/DestinationCard";

export default function Destinations() {
  const { tenant } = useTenant();
  const { settings } = useSettings();
  const tenantId = String(tenant?._id || tenant?.id || "").trim();

  const { data, isLoading, error } = useQuery({
    queryKey: ["destinations", tenantId || "public"],
    queryFn: async () => {
      const response = await api.get("/destinations", { params: { page: 1, limit: 100 } });
      const payload = response.data || {};
      return {
        destinations: Array.isArray(payload)
          ? payload
          : (Array.isArray(payload.data) ? payload.data : []),
        total: Number(payload?.pagination?.total ?? payload?.count ?? (Array.isArray(payload) ? payload.length : payload?.data?.length ?? 0)),
      };
    },
    staleTime: 1000 * 60 * 10,
    enabled: Boolean(tenantId || tenant),
  });

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">Loading destinations...</div>;
  if (error) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400">Failed to load destinations.</div>;

  const destinations = data?.destinations || [];
  const destinationCount = data?.total ?? destinations.length;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Explore Destinations</h1>
            <p className="mt-3 text-slate-300">
              Discover amazing places and unforgettable experiences with {settings?.companyName || tenant?.name || "Your Travel Company"}.
            </p>
          </div>
          <div className="rounded-full border border-slate-800 bg-slate-900 px-5 py-2 font-semibold text-slate-200 shadow-sm">
            {destinationCount} {destinationCount === 1 ? "Destination" : "Destinations"}
          </div>
        </div>

        {destinations.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-300 shadow-xl">
            No destinations available.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => (
              <DestinationCard key={destination._id || destination.slug} destination={destination} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
