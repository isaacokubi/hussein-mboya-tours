import { useTenant } from "../context/TenantContext";
import { useSettings } from "../context/SettingsContext";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { getTours } from "../api/tourApi";
import TourCard from "../components/tours/TourCard";

export default function Tours() {
  const { tenant } = useTenant();
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();

  const destinationId = searchParams.get("destination") || "";
  const category = searchParams.get("category") || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-tours", destinationId, category],
    queryFn: () => getTours({
      ...(destinationId ? { destination: destinationId } : {}),
      ...(category ? { category } : {}),
    }),
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-red-600">
        Failed to load tours.
      </div>
    );
  }

  const tours = Array.isArray(data) ? data : data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Explore Our Tours</h1>
        <p className="text-gray-600 mt-3">
          Discover unforgettable African adventures with {settings?.companyName || tenant?.name || "Your Travel Company"}.
        </p>
        {destinationId && (
          <p className="mt-2 text-sm text-green-600 font-medium">
            Showing tours for this destination only.
          </p>
        )}
        {category && (
          <p className="mt-1 text-sm text-gray-500">Category: {category}</p>
        )}
      </div>

      {tours.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold">No tours available</h2>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <TourCard key={tour._id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  );
}
