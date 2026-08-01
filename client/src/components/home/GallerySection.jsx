// client/src/components/home/GallerySection.jsx

import { useQuery } from "@tanstack/react-query";
import { getFeaturedGallery } from "../../api/galleryApi";
import LazyImage from "../common/LazyImage";

export default function GallerySection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["gallery"],
    queryFn: getFeaturedGallery,
  });

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE API RESPONSE
  |--------------------------------------------------------------------------
  */

  const images = Array.isArray(data) ? data : data?.gallery || data?.data || [];

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (isLoading) {
    return (
      <section className="py-20 text-center">
        <p className="text-lg">Loading gallery...</p>
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
        <p className="text-red-500">Failed to load gallery.</p>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | EMPTY STATE
  |--------------------------------------------------------------------------
  */

  if (!images.length) {
    return (
      <section className="py-20 text-center">
        <p className="text-gray-500">No gallery images available.</p>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | IMAGE URL HANDLER
  |--------------------------------------------------------------------------
  */

  const getImageUrl = (image) => {
    if (!image) {
      return "/placeholder.jpg";
    }

    // Cloudinary / external URL
    if (image.startsWith("http")) {
      return image;
    }

    // Local backend image
    return `${import.meta.env.VITE_API_URL}${image}`;
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2
          className="
          text-4xl
          font-bold
          text-center
          mb-12
          "
        >
          Safari Gallery
        </h2>

        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-6
          "
        >
          {images.map((item) => (
            <div
              key={item._id}
              className="
                overflow-hidden
                rounded-xl
                shadow-md
                "
            >
              <LazyImage
                src={getImageUrl(item.image?.url)}
                alt={item.title || "Safari image"}
                className="
                  rounded-xl
                  h-72
                  w-full
                  object-cover
                  hover:scale-105
                  transition
                  duration-500
                  "
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
