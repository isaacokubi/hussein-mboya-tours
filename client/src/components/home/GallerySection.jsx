// client/src/components/home/GallerySection.jsx

import { useQuery } from "@tanstack/react-query";
import { getFeaturedGallery } from "../../api/galleryApi";
import LazyImage from "../common/LazyImage";

export default function GallerySection() {
  const {
    data: images = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["gallery", "featured"],
    queryFn: getFeaturedGallery,
    retry: 2,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <section className="py-20 text-center" aria-live="polite">
        Loading gallery...
      </section>
    );
  }

  // A gallery is optional homepage content. Do not render a red error state
  // when the tenant has no gallery records yet or the public endpoint is
  // temporarily unavailable. The page should remain usable and offer a
  // retry without exposing an internal API failure to visitors.
  if (isError) {
    return (
      <section className="py-20 text-center" aria-live="polite">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-3">Safari Gallery</h2>
          <p className="text-gray-600 mb-6">
            Our gallery is being updated. Please check back shortly.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center justify-center rounded-lg px-5 py-3 font-semibold bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white" aria-labelledby="safari-gallery-heading">
      <div className="max-w-7xl mx-auto px-6">
        <h2
          id="safari-gallery-heading"
          className="text-4xl font-bold text-center mb-12"
        >
          Safari Gallery
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {images.map((item) => (
            <div
              key={item._id || item.id || item.image?.publicId || item.image?.url}
              className="overflow-hidden rounded-2xl shadow-lg group bg-gray-100"
            >
              <LazyImage
                src={
                  typeof item.image === "string"
                    ? item.image
                    : item.image?.url
                }
                alt={item.title || "Safari experience"}
                className="h-72 w-full object-cover group-hover:scale-110 transition duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
