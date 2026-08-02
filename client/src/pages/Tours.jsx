import { useQuery } from "@tanstack/react-query";

import { Link, useParams } from "react-router-dom";

import { getTours } from "../api/tourApi";

export default function Tours() {
  const { slug } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-tours", slug],
    queryFn: () =>
      getTours(slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : null),
  });

  if (isLoading) {
    return (
      <div
        className="
          min-h-[400px]
          flex
          items-center
          justify-center
        "
      >
        <div
          className="
            w-10
            h-10
            border-4
            border-green-600
            border-t-transparent
            rounded-full
            animate-spin
          "
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
          max-w-7xl
          mx-auto
          px-6
          py-20
          text-center
          text-red-600
        "
      >
        Failed to load tours.
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | API RESPONSE:
  |
  | {
  |   success:true,
  |   data:[]
  | }
  |--------------------------------------------------------------------------
  */

  const tours = Array.isArray(data) ? data : data?.data || [];

  return (
    <div
      className="
        max-w-7xl
        mx-auto
        px-6
        py-12
      "
    >
      <div
        className="
          mb-10
        "
      >
        <h1
          className="
            text-4xl
            font-bold
            text-gray-800
          "
        >
          Explore Our Tours
        </h1>

        <p
          className="
            text-gray-600
            mt-3
          "
        >
          Discover unforgettable African adventures with Hussein Mboya Tours.
        </p>

        {slug && (
          <p
            className="
              mt-2
              text-sm
              text-green-600
              font-medium
            "
          >
            Category slug: {slug}
          </p>
        )}
      </div>

      {tours.length === 0 ? (
        <div
          className="
            text-center
            py-20
          "
        >
          <h2
            className="
              text-2xl
              font-semibold
            "
          >
            No tours available
          </h2>
        </div>
      ) : (
        <div
          className="
            grid
            md:grid-cols-2
            lg:grid-cols-3
            gap-8
          "
        >
          {tours.map((tour) => (
            <div
              key={tour._id}
              className="
                bg-white
                rounded-2xl
                shadow
                overflow-hidden
                hover:shadow-xl
                transition
              "
            >
              <img
                src={
                  tour.images?.[0] ||
                  tour.image ||
                  "/images/tour-placeholder.jpg"
                }
                alt={tour.title}
                className="
                  w-full
                  h-56
                  object-cover
                "
              />

              <div
                className="
                  p-6
                "
              >
                <h2
                  className="
                    text-xl
                    font-bold
                    text-gray-800
                  "
                >
                  {tour.title}
                </h2>

                <p
                  className="
                    text-gray-600
                    mt-2
                  "
                >
                  📍{" "}
                  {tour.destination?.name ||
                    tour.destination ||
                    tour.country ||
                    "Kenya"}
                </p>

                <p
                  className="
                    text-gray-600
                    mt-4
                    line-clamp-3
                  "
                >
                  {tour.description}
                </p>

                <div
                  className="
                    flex
                    justify-between
                    items-center
                    mt-6
                  "
                >
                  <span
                    className="
                      text-green-700
                      font-bold
                      text-xl
                    "
                  >
                    KES {Number(tour.price || 0).toLocaleString()}
                  </span>

                  <Link
                    to={`/tours/${tour._id}`}
                    className="
                      bg-green-600
                      text-white
                      px-5
                      py-2
                      rounded-lg
                      hover:bg-green-700
                    "
                  >
                    View Tour
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
