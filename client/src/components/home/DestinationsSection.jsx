import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { getFeaturedDestinations } from "../../api/destinationApi";
import { useAuth } from "../../context/AuthContext";

const DESTINATION_IMAGE_FALLBACKS = {
  "maasai-mara": "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=85",
  amboseli: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&w=1200&q=85",
  "tsavo-national-park": "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1200&q=85",
  "lake-naivasha": "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=85",
  watamu: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
};

const getDestinationImage = (destination) => {
  const firstImage = destination?.images?.[0];
  const imageUrl =
    (typeof firstImage === "string" && firstImage.trim()) ||
    firstImage?.url ||
    destination?.featuredImage ||
    destination?.imageUrl ||
    destination?.image;

  if (imageUrl) return imageUrl;

  return (
    DESTINATION_IMAGE_FALLBACKS[destination?.slug] ||
    "/images/image-placeholder.jpg"
  );
};

export default function DestinationsSection() {
  const { user } = useAuth();
  const tenantId = String(user?.tenantId?._id || user?.tenantId || "").trim();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setDestinations([]);

    const loadDestinations = async () => {
      try {
        const data = await getFeaturedDestinations();
        if (!mounted) return;

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
        if (!mounted) return;
        console.error("Failed to load destinations:", error);
        setDestinations([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadDestinations();
    return () => {
      mounted = false;
    };
  }, [tenantId]);

  if (loading) {
    return (
      <section className="py-16 bg-slate-950 text-center text-slate-200" aria-live="polite">
        Loading destinations...
      </section>
    );
  }

  if (!destinations.length) {
    return (
      <section className="py-16 bg-slate-950 text-center text-slate-300" aria-live="polite">
        No destinations available.
      </section>
    );
  }

  return (
    <section className="py-16 bg-slate-950 text-slate-100" aria-labelledby="destinations-heading">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          id="destinations-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center text-white mb-10"
        >
          Explore Our Destinations
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {destinations.map((destination) => {
            const image = getDestinationImage(destination);
            const fallback =
              DESTINATION_IMAGE_FALLBACKS[destination?.slug] ||
              "/images/image-placeholder.jpg";

            return (
              <Link key={destination._id} to={`/destinations/${destination.slug}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="rounded-xl shadow-lg overflow-hidden bg-slate-900 border border-white/10 cursor-pointer hover:shadow-2xl transition"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                    <img
                      src={image}
                      alt={destination.name || "Destination"}
                      className="block h-48 w-full object-cover object-center opacity-100"
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        if (event.currentTarget.dataset.fallbackApplied === "true") return;
                        event.currentTarget.dataset.fallbackApplied = "true";
                        event.currentTarget.src = fallback;
                      }}
                    />
                  </div>

                  <div className="p-6 bg-slate-900">
                    <h3 className="text-xl font-semibold text-white mb-3">{destination.name}</h3>
                    <p className="text-slate-300 line-clamp-3">
                      {destination.description || "Discover an unforgettable Kenyan travel experience."}
                    </p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
