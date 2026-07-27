import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { Heart, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Wishlist() {
  const { token } = useAuth();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get(
          `${API_URL}/wishlist`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setWishlist(data || []);
      } catch (err) {
        console.error("Wishlist Error:", err);

        setError(
          err?.response?.data?.message ||
            "Failed to load wishlist."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [token]);

  /*
  |--------------------------------------------------------------------------
  | REQUIRE LOGIN
  |--------------------------------------------------------------------------
  */

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">
          My Wishlist
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-white rounded-2xl shadow-md overflow-hidden"
            >
              <div className="h-56 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR STATE
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6 text-center">
          {error}
        </div>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | EMPTY STATE
  |--------------------------------------------------------------------------
  */

  if (wishlist.length === 0) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white shadow-lg rounded-3xl p-10 text-center">
          <Heart className="mx-auto h-16 w-16 text-red-500 mb-4" />

          <h1 className="text-3xl font-bold mb-4">
            Your Wishlist is Empty
          </h1>

          <p className="text-gray-600 mb-8">
            Save your favorite tours and destinations
            to plan your next adventure with Hussein
            Mboya Tours.
          </p>

          <Link
            to="/tours"
            className="
              inline-flex
              items-center
              px-6
              py-3
              bg-green-600
              hover:bg-green-700
              text-white
              rounded-xl
              transition
            "
          >
            Explore Tours
          </Link>
        </div>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CONTENT
  |--------------------------------------------------------------------------
  */

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="text-red-500" />
        <h1 className="text-3xl font-bold">
          My Wishlist
        </h1>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {wishlist.map((tour) => (
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
              src={
                tour.image ||
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
              }
              alt={tour.name}
              className="w-full h-60 object-cover"
            />

            <div className="p-5">
              <h2 className="text-xl font-bold mb-2">
                {tour.name}
              </h2>

              <div className="flex items-center text-gray-500 text-sm mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                {tour.destination ||
                  "Kenya Adventure"}
              </div>

              <p className="text-gray-600 line-clamp-3 mb-4">
                {tour.description}
              </p>

              {tour.price && (
                <p className="text-green-700 font-bold text-lg mb-4">
                  From KES {tour.price.toLocaleString()}
                </p>
              )}

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
                  transition
                "
              >
                View Tour
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}