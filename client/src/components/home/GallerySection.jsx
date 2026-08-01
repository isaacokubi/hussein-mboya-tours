// client/src/components/home/GallerySection.jsx

import { useQuery } from "@tanstack/react-query";
import { getFeaturedGallery } from "../../api/galleryApi";
import LazyImage from "../common/LazyImage";

export default function GallerySection() {
  const {
    data: images = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["gallery"],

    queryFn: getFeaturedGallery,
  });

  console.log("Gallery images:", images);

  if (isLoading) {
    return <section className="py-20 text-center">Loading gallery...</section>;
  }

  if (isError) {
    return (
      <section className="py-20 text-center text-red-500">
        Failed to load gallery.
      </section>
    );
  }

  if (!Array.isArray(images) || images.length === 0) {
    return (
      <section className="py-20 text-center">No gallery images found.</section>
    );
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Safari Gallery</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {images.map((item) => (
            <div key={item._id} className="overflow-hidden rounded-xl">
              {/* <LazyImage
                src={item.image?.url}
                alt={item.title || "Safari"}
                className="
                  rounded-xl
                  h-72
                  w-full
                  object-cover
                  hover:scale-105
                  transition
                  duration-500
                "
              /> */}
              
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
