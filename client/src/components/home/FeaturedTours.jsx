import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getFeaturedTours } from "../../api/tourApi";

export default function FeaturedTours() {
  const {
    data: tours = [],
    isLoading,
  } = useQuery({
    queryKey: ["featuredTours"],
    queryFn: getFeaturedTours,
  });

  if (isLoading) {
    return (
      <section className="py-20 text-center">
        Loading tours...
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-100">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          Featured Tours
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <div
              key={tour._id}
              className="bg-white rounded-xl overflow-hidden shadow-lg"
            >
              <img
                src={tour.image}
                alt={tour.title}
                className="h-64 w-full object-cover"
              />

              <div className="p-6">
                <h3 className="text-xl font-bold">
                  {tour.title}
                </h3>

                <p className="text-green-600 font-bold mt-3">
                  ${tour.price}
                </p>

                <Link
                  to={`/tours/${tour._id}`}
                  className="block mt-5 bg-green-600 text-white text-center py-3 rounded-lg"
                >
                  View Tour
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}