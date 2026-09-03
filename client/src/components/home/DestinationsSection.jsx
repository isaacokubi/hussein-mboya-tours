import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { getFeaturedDestinations } from "../../api/destinationApi";
import LazyImage from "../common/LazyImage";

export default function DestinationsSection() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDestinations = async () => {
    try {
      const data = await getFeaturedDestinations();
      const normalizedDestinations = Array.isArray(data)
        ? data
        : Array.isArray(data?.destinations)
          ? data.destinations
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.data?.destinations)
              ? data.data.destinations
              : [];

      setDestinations(normalizedDestinations);
    } catch (error) {
      console.error("Failed to load destinations:", error);
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(() => loadDestinations());
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white text-center text-slate-700" aria-live="polite">
        Loading destinations...
      </section>
    );
  }

  if (!destinations.length) {
    return (
      <section className="py-16 bg-white text-center text-slate-700" aria-live="polite">
        No destinations available.
      </section>
    );
  }

  return (
    <section className="py-16 bg-white text-slate-900" aria-labelledby="destinations-heading">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          id="destinations-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center text-slate-900 mb-10"
        >
          Explore Our Destinations
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <Link key={destination._id} to={`/destinations/${destination.slug}`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="rounded-xl shadow-lg overflow-hidden bg-white border border-slate-200 cursor-pointer hover:shadow-2xl transition"
              >
                <LazyImage
                  src={
                    typeof destination.images?.[0] === "string"
                      ? destination.images[0]
                      : destination.images?.[0]?.url || "/images/placeholder.jpg"
                  }
                  alt={destination.name || "Destination"}
                  className="h-48 w-full object-cover"
                />

                <div className="p-6 bg-white">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {destination.name}
                  </h3>
                  <p className="text-slate-600 line-clamp-3">
                    {destination.description || "Discover an unforgettable Kenyan travel experience."}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
