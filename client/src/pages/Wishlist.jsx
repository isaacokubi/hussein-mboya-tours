/**
 * Purpose: Wishlist page-level UI component. Main declarations: Wishlist.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { getTourImage } from "../utils/tourImage";
// client/src/pages/Wishlist.jsx

// Load react-router-dom so this module can use its exported dependencies.
import { Link, Navigate } from "react-router-dom";

// Load lucide-react so this module can use its exported dependencies.
import { Heart, MapPin } from "lucide-react";

// Load @tanstack/react-query so this module can use its exported dependencies.
import { useQuery } from "@tanstack/react-query";

// Load ../context/AuthContext so this module can use its exported dependencies.
import { useAuth } from "../context/AuthContext";

// Load ../api/wishlistApi so this module can use its exported dependencies.
import { getWishlist } from "../api/wishlistApi";


// Define Wishlist; its parameters and body implement this operation.
export default function Wishlist(
) {
  // Declare { token } for use by the surrounding module or function.
  const { token } = useAuth();


  // Declare { data, isLoading, error, } for use by the surrounding module or function.
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    enabled: Boolean(token),
  });



  // Check the condition (!token) and run the matching branch.
  if (!token) {
    // Return the expression shown below to the caller.
    return <Navigate to="/login" replace />;
  }



  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) {
    // Return the expression shown below to the caller.
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



  // Check the condition (error) and run the matching branch.
  if (error) {
    // Return the expression shown below to the caller.
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



  // Declare wishlist for use by the surrounding module or function.
  const wishlist = Array.isArray(data)
    ? data
    : data?.wishlist || [];




  // Check the condition (wishlist.length === 0) and run the matching branch.
  if (wishlist.length === 0) {
    // Return the expression shown below to the caller.
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




  // Return the expression shown below to the caller.
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
                  KES{" "}
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
