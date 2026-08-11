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

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE RESPONSE
  |--------------------------------------------------------------------------
  */

 const tours = data || [];

  console.log("FEATURED TOURS RESPONSE:", data);

  console.log("FEATURED TOURS ARRAY:", tours);

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (isLoading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  h-96
                  bg-gray-200
                  animate-pulse
                  rounded-xl
                "
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR STATE
  |--------------------------------------------------------------------------
  */

  if (isError) {
    return (
      <section className="py-20 text-center">
        <p className="text-red-600 font-semibold">
          Failed to load featured tours.
        </p>

        <p className="text-gray-500 mt-2">{error?.message}</p>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | COMPONENT
  |--------------------------------------------------------------------------
  */

  return (
    <section
      className="
        py-20
        bg-gradient-to-b
        from-white
        via-gray-50
        to-green-50
      "
    >
      <div className="container mx-auto px-6">
        <h2
          className="
            text-4xl
            font-bold
            text-center
            mb-12
          "
        >
          Featured Tours
        </h2>

        {tours.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 text-lg">
              No featured tours available.
            </p>
          </div>
        ) : (
          <div
            className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-3
                gap-8
              "
          >
            {(Array.isArray(tours) ? tours : []).map((tour) => (
              <div
                key={tour._id}
                className="
                      bg-white
                      rounded-2xl
                      overflow-hidden
                      shadow-lg
                      hover:shadow-2xl
                      transition-all
                      duration-300
                      hover:-translate-y-2
                    "
              >
                <div className="relative">
                  <LazyImage
                    src={
                      tour?.images?.[0]?.url ||
                      tour?.images?.[0] ||
                      tour?.destination?.images?.[0]?.url ||
                      tour?.image ||
                      "/placeholder-tour.jpg"
                    }
                    alt={tour?.title || "Tour"}
                    className="
                          h-64
                          w-full
                          object-cover
                        "
                  />

                  <div
                    className="
                          absolute
                          top-4
                          left-4
                          bg-yellow-500
                          text-white
                          px-3
                          py-1
                          rounded-full
                          text-sm
                          font-semibold
                        "
                  >
                    Featured
                  </div>
                </div>

                <div className="p-6">
                  <h3
                    className="
                          text-xl
                          font-bold
                        "
                  >
                    {tour?.title || "African Adventure Tour"}
                  </h3>

                  <p
                    className="
                          text-gray-600
                          mt-2
                        "
                  >
                    {tour?.destination?.name || "Kenya"}
                  </p>

                  {tour?.duration && (
                    <p
                      className="
                              text-sm
                              text-gray-500
                              mt-2
                            "
                    >
                      Duration: {tour.duration}
                    </p>
                  )}

                  {tour?.price && (
                    <p
                      className="
                              text-green-600
                              font-bold
                              text-lg
                              mt-4
                            "
                    >
                      KES {Number(tour.price).toLocaleString()}
                    </p>
                  )}

                  <Link
                    to={`/tours/${tour?.slug || tour?._id}`}
                    className="
                          block
                          mt-5
                          bg-green-600
                          hover:bg-green-700
                          text-white
                          text-center
                          py-3
                          rounded-lg
                          transition
                        "
                  >
                    View Tour
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
