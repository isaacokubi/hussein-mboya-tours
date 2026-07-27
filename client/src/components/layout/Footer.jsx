import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Footer() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div
        className="
          max-w-7xl
          mx-auto
          px-6
          py-16
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-10
        "
      >
        {/* Company Information */}

        <div>
          <h2 className="text-2xl font-bold text-white">Hussein Mboya Tours</h2>

          <p className="mt-4 text-gray-400 leading-relaxed">
            Discover Kenya and East Africa through unforgettable safaris, luxury
            holidays, wildlife adventures, beach escapes, and tailor-made travel
            experiences.
          </p>

          <div className="mt-6 space-y-3">
            <p>📞 0733439762</p>
            <p>📍 Nairobi, Kenya</p>
            <p>🦁 Luxury Safaris & Adventures</p>
          </div>
        </div>

        {/* Explore */}

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Explore</h3>

          <ul className="space-y-3">
            <li>
              <Link to="/" className="hover:text-green-400 transition">
                Home
              </Link>
            </li>

            <li>
              <Link
                to="/destinations"
                className="hover:text-green-400 transition"
              >
                Destinations
              </Link>
            </li>

            <li>
              <Link to="/tours" className="hover:text-green-400 transition">
                Tours
              </Link>
            </li>

            {!user && (
              <>
                <li>
                  <Link to="/login" className="hover:text-green-400 transition">
                    Login
                  </Link>
                </li>

                <li>
                  <Link
                    to="/register"
                    className="hover:text-green-400 transition"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}

            {user && (
              <>
                <li>
                  <Link
                    to="/dashboard"
                    className="hover:text-green-400 transition"
                  >
                    Dashboard
                  </Link>
                </li>

                <li>
                  <Link
                    to="/profile"
                    className="hover:text-green-400 transition"
                  >
                    Profile
                  </Link>
                </li>

                <li>
                  <Link
                    to="/wishlist"
                    className="hover:text-green-400 transition"
                  >
                    Wishlist
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Popular Destinations */}

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Popular Destinations
          </h3>

          <ul className="space-y-3">
            <li>Maasai Mara</li>
            <li>Amboseli National Park</li>
            <li>Diani Beach</li>
            <li>Tsavo National Park</li>
            <li>Lake Naivasha</li>
            <li>Watamu Marine Park</li>
          </ul>
        </div>

        {/* Travel Services */}

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Travel Services
          </h3>

          <ul className="space-y-3">
            <li>Luxury Safaris</li>
            <li>Wildlife Tours</li>
            <li>Beach Holidays</li>
            <li>Group Adventures</li>
            <li>Honeymoon Packages</li>
            <li>Airport Transfers</li>
          </ul>

          {/* Admin Links */}

          {user?.role === "admin" && (
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-2">Admin Panel</h4>

              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/admin" className="hover:text-green-400">
                    Dashboard
                  </Link>
                </li>

                <li>
                  <Link to="/admin/tours" className="hover:text-green-400">
                    Manage Tours
                  </Link>
                </li>

                <li>
                  <Link to="/admin/add-tour" className="hover:text-green-400">
                    Add Tour
                  </Link>
                </li>

                <li>
                  <Link to="/admin/analytics" className="hover:text-green-400">
                    Analytics
                  </Link>
                </li>

                <li>
                  <Link to="/admin/crm" className="hover:text-green-400">
                    CRM
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Agent Links */}

          {user?.role === "agent" && (
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-2">Agent Portal</h4>

              <Link to="/agent" className="hover:text-green-400">
                Agent Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer */}

      <div className="border-t border-gray-800">
        <div
          className="
            max-w-7xl
            mx-auto
            px-6
            py-6
            flex
            flex-col
            md:flex-row
            justify-between
            items-center
            gap-4
          "
        >
          <p className="text-sm text-gray-500 text-center md:text-left">
            © {year} Hussein Mboya Tours. All Rights Reserved.
          </p>

          <p className="text-sm text-gray-500 text-center md:text-right">
            Explore • Discover • Experience Africa
          </p>
        </div>
      </div>
    </footer>
  );
}
