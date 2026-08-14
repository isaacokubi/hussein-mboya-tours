import { useSettings } from "../context/SettingsContext";
import { getTourImage } from "../utils/tourImage";
// client/src/pages/Wishlist.jsx

import { Link, Navigate } from "react-router-dom";

import { Heart, MapPin } from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "../context/AuthContext";

import { getWishlist } from "../api/wishlistApi";


export default function Wishlist(
) {
  const { token } = useAuth();


  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    enabled: Boolean(token),
  });



  if (!token) {
    return <Navigate to="/login" replace />;
  }



  if (isLoading) {
    return (
      <section
        className="
        max-w-7xl
        mx-auto
        px-4
        py-12
        "
      >
        <h1
          className="
          text-3xl
          font-bold
          mb-8
          "
        >
          My Wishlist
        </h1>


        <div
          className="
          grid
          md:grid-cols-2
          lg:grid-cols-3
          gap-6
          "
        >
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="
              animate-pulse
              bg-white
              rounded-2xl
              shadow
              overflow-hidden
              "
            >
              <div
                className="
                h-56
                bg-gray-200
                "
              />

              <div
                className="
                p-5
                space-y-3
                "
              >
                <div
                  className="
                  h-5
                  bg-gray-200
                  rounded
                  "
                />

                <div
                  className="
                  h-4
                  bg-gray-200
                  rounded
                  "
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }



  if (error) {
    return (
      <div
        className="
        max-w-4xl
        mx-auto
        py-12
        px-4
        "
      >
        <div
          className="
          bg-red-50
          text-red-600
          rounded-xl
          p-6
          text-center
          "
        >
          Failed to load wishlist.
        </div>
      </div>
    );
  }



  const wishlist = Array.isArray(data)
    ? data
    : data?.wishlist || [];




  if (wishlist.length === 0) {
    return (
      <section
        className="
        max-w-4xl
        mx-auto
        px-4
        py-16
        "
      >
        <div
          className="
          bg-white
          shadow
          rounded-3xl
          p-10
          text-center
          "
        >
          <Heart
            className="
            mx-auto
            h-16
            w-16
            text-red-500
            mb-4
            "
          />

          <h1
            className="
            text-3xl
            font-bold
            mb-4
            "
          >
            Your Wishlist is Empty
          </h1>


          <p
            className="
            text-gray-600
            mb-8
            "
          >
            Save your favorite tours and destinations for your next adventure.
          </p>


          <Link
            to="/tours"
            className="
            bg-green-600
            hover:bg-green-700
            text-white
            px-6
            py-3
            rounded-xl
            "
          >
            Explore Tours
          </Link>

        </div>
      </section>
    );
  }




  return (
    <section
      className="
      max-w-7xl
      mx-auto
      px-4
      py-12
      "
    >

      <div
        className="
        flex
        items-center
        gap-3
        mb-8
        "
      >

        <Heart
          className="
          text-red-500
          "
        />

        <h1
          className="
          text-3xl
          font-bold
          "
        >
          My Wishlist
        </h1>

      </div>



      <div
        className="
        grid
        md:grid-cols-2
        lg:grid-cols-3
        gap-8
        "
      >

        {wishlist.map((tour) => {


          const media =
            tour.images?.[0] ||
            tour.featuredImage ||
            tour.gallery?.[0] ||
            tour.image;
            typeof media === "object" ? media?.url : media;
          const tourImage = getTourImage(tour);



          return (
            <div
              key={tour._id}
              className="
              bg-white
              rounded-2xl
              shadow-lg
              overflow-hidden
              hover:shadow-2xl
              transition
              "
            >


              <img
                src={tourImage}
                alt={
                  tour.title ||
                  tour.name ||
                  "Tour"
                }
                className="
                w-full
                h-60
                object-cover
                "
                onError={(e) => {
                  e.currentTarget.src =
                    "/hero1.jpeg";
                }}
              />



              <div
                className="
                p-5
                "
              >

                <h2
                  className="
                  text-xl
                  font-bold
                  mb-2
                  "
                >
                  {tour.title || tour.name}
                </h2>



                <div
                  className="
                  flex
                  items-center
                  text-gray-500
                  text-sm
                  mb-3
                  "
                >

                  <MapPin
                    className="
                    h-4
                    w-4
                    mr-1
                    "
                  />


                  {tour.destination?.name ||
                    tour.destination ||
                    "Kenya"}

                </div>




                <p
                  className="
                  text-gray-600
                  line-clamp-3
                  mb-4
                  "
                >
                  {tour.description}
                </p>




                <p
                  className="
                  text-green-700
                  font-bold
                  text-lg
                  mb-4
                  "
                >
                  settings.currency || "KES"{" "}
                  {Number(
                    tour.price || 0
                  ).toLocaleString()}
                </p>




                <Link
                  to={`/tours/${tour.slug || tour._id}`}
                  className="
                  block
                  text-center
                  bg-green-600
                  hover:bg-green-700
                  text-white
                  py-3
                  rounded-xl
                  "
                >
                  View Tour
                </Link>


              </div>

            </div>
          );

        })}

      </div>

    </section>
  );
}
