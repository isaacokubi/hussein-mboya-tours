import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { getTours } from "../api/tourApi";

import TourCard from "../components/tours/TourCard";

import TourFilters from "../components/tours/TourFilters";

import SEO from "../components/seo/SEO";

export default function Tours() {
  const [filters, setFilters] = useState({
    country: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["tours", filters],

    queryFn: () => getTours(filters),
  });

  if (isLoading) {
    return (
      <div
        className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-gray-50
        "
      >
        <div
          className="
          text-center
          "
        >
          <div
            className="
            w-14
            h-14
            border-4
            border-yellow-500
            border-t-transparent
            rounded-full
            animate-spin
            mx-auto
            mb-5
            "
          />

          <p
            className="
            text-gray-600
            text-lg
            "
          >
            Discovering amazing tours...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
        min-h-screen
        flex
        items-center
        justify-center
        "
      >
        <div
          className="
          bg-red-50
          border
          border-red-200
          text-red-700
          p-6
          rounded-xl
          "
        >
          Failed to load tours. Please try again later.
        </div>
      </div>
    );
  }

  const tours = data?.tours || [];

  return (
    <>
      <SEO
        title="Luxury Kenya Tours & Safari Adventures"
        description="
        Explore unforgettable safari experiences,
        beach holidays and cultural tours with
        Hussein Mboya Tours.
        "
      />

      <main
        className="
        min-h-screen
        bg-gray-50
        "
      >
        {/* HERO SECTION */}

        <section
          className="
          bg-gradient-to-r
          from-black
          via-gray-900
          to-yellow-700
          text-white
          py-20
          px-6
          "
        >
          <div
            className="
            max-w-7xl
            mx-auto
            "
          >
            <h1
              className="
              text-4xl
              md:text-6xl
              font-extrabold
              mb-5
              "
            >
              Explore Our Tours
            </h1>

            <p
              className="
              text-lg
              md:text-xl
              max-w-3xl
              text-gray-200
              "
            >
              Experience Kenya's breathtaking wildlife, beaches and cultural
              adventures with Hussein Mboya Tours.
            </p>
          </div>
        </section>

        {/* CONTENT */}

        <section
          className="
          max-w-7xl
          mx-auto
          px-6
          py-12
          "
        >
          <TourFilters filters={filters} setFilters={setFilters} />

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
                  font-bold
                  text-gray-700
                  "
              >
                No tours found
              </h2>

              <p
                className="
                  text-gray-500
                  mt-3
                  "
              >
                Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div
              className="
                grid
                sm:grid-cols-2
                lg:grid-cols-3
                gap-8
                mt-12
                "
            >
              {tours.map((tour) => (
                <TourCard key={tour._id} tour={tour} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
