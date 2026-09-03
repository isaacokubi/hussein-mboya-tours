import { getTourImage, TOUR_FALLBACK_IMAGES } from "../../utils/tourImage";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getFeaturedTours } from "../../api/tourApi";
import LazyImage from "../common/LazyImage";

export default function FeaturedTours() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["featuredTours"],
    queryFn: getFeaturedTours,
    staleTime: 1000 * 60 * 5,
  });

  const tours = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <section className="py-20 text-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-96 bg-white/10 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-20 text-center text-slate-100">
        <p className="text-red-300 font-semibold">Failed to load featured tours.</p>
        <p className="text-slate-400 mt-2">{error?.message}</p>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-slate-100">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-white mb-12">Featured Tours</h2>

        {tours.length === 0 ? (
          <div className="text-center">
            <p className="text-slate-300 text-lg">No featured tours available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour, index) => {
              const fallbackImage =
                TOUR_FALLBACK_IMAGES[index % TOUR_FALLBACK_IMAGES.length];

              return (
                <div
                  key={tour._id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="relative">
                    <LazyImage
                      src={getTourImage(tour)}
                      fallback={fallbackImage}
                      alt={tour?.title || "Tour"}
                      className="h-64 w-full object-cover"
                    />

                    <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                      Featured
                    </div>
                  </div>

                  <div className="p-6 bg-white">
                    <h3 className="text-xl font-bold text-slate-900">
                      {tour?.title || "African Adventure Tour"}
                    </h3>

                    <p className="text-slate-600 mt-2">
                      {tour?.destination?.name || "Kenya"}
                    </p>

                    {tour?.duration && (
                      <p className="text-sm text-slate-500 mt-2">
                        Duration: {tour.duration}
                      </p>
                    )}

                    {tour?.price && (
                      <p className="text-emerald-600 font-bold text-lg mt-4">
                        KES {Number(tour.price).toLocaleString()}
                      </p>
                    )}

                    <Link
                      to={`/tours/${tour?.slug || tour?._id}`}
                      className="block mt-5 bg-emerald-600 hover:bg-emerald-700 text-white text-center py-3 rounded-lg font-semibold transition"
                    >
                      View Tour
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
