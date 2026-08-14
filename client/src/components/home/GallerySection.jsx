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


  



  if (isLoading) {

    return (
      <section className="py-20 text-center">
        Loading gallery...
      </section>
    );

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
      <section className="py-20 text-center">
        No gallery images found.
      </section>
    );

  }



  return (

    <section
      className="
        py-20
        bg-white
      "
    >

      <div
        className="
          max-w-7xl
          mx-auto
          px-6
        "
      >


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
            sm:grid-cols-2
            md:grid-cols-3
            gap-8
          "
        >


          {(Array.isArray(images) ? images : []).map((item) => (

            <div
              key={item._id}
              className="
                overflow-hidden
                rounded-2xl
                shadow-lg
                group
                bg-gray-100
              "
            >


              <LazyImage

                src={
                  typeof item.image === "string"
                    ? item.image
                    : item.image?.url
                }

                alt={
                  item.title ||
                  "Safari experience"
                }

                className="
                  h-72
                  w-full
                  object-cover
                  group-hover:scale-110
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