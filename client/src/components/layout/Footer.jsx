import { useSettings } from "../../context/SettingsContext";

import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
  FaPhone,
  FaLocationDot,
  FaEnvelope,
} from "react-icons/fa6";

export default function Footer() {
  const { user } = useAuth();
  const { companyName, supportEmail, supportPhone } = useSettings();

  const year = new Date().getFullYear();

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE USER ROLE
  |--------------------------------------------------------------------------
  */

  const userRole =
    typeof user?.role === "string"
      ? user.role.toLowerCase()
      : user?.role?.name?.toLowerCase() ||
        user?.roles?.[0]?.name?.toLowerCase() ||
        "";

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
        {/* ---------------------------------------------------------------- */}
        {/* COMPANY */}
        {/* ---------------------------------------------------------------- */}

        <div>
          <h2 className="text-2xl font-bold text-white">
            {companyName}
          </h2>

          <p className="mt-4 text-gray-400 leading-relaxed">
            Discover Kenya and East Africa through unforgettable safaris,
            wildlife adventures, luxury holidays, beach escapes, mountain
            expeditions, and tailor-made travel experiences.
          </p>

          <div className="mt-6 space-y-3 text-sm">
            <a
              href={`tel:${supportPhone.replace(/\s+/g, "")}`}
              className="flex items-center gap-2 hover:text-green-400 transition"
            >
              <FaPhone />
              {supportPhone}
            </a>

            <a
              href={`mailto:${supportEmail || "support@example.com"}`}
              className="flex items-center gap-2 hover:text-green-400 transition"
            >
              <FaEnvelope />
              {supportEmail || "support@example.com"}
            </a>

            <div className="flex items-center gap-2">
              <FaLocationDot />
              Nairobi, Kenya
            </div>
          </div>

          {/* Social Media */}

          <div className="flex gap-4 mt-6">
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-green-400 transition"
            >
              <FaFacebookF size={20} />
            </a>

            <a
              href="#"
              aria-label="Instagram"
              className="hover:text-green-400 transition"
            >
              <FaInstagram size={20} />
            </a>

            <a
              href="#"
              aria-label="X"
              className="hover:text-green-400 transition"
            >
              <FaXTwitter size={20} />
            </a>

            <a
              href="#"
              aria-label="YouTube"
              className="hover:text-green-400 transition"
            >
              <FaYoutube size={20} />
            </a>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* EXPLORE */}
        {/* ---------------------------------------------------------------- */}

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

            <li>
              <Link to="/about" className="hover:text-green-400 transition">
                About Us
              </Link>
            </li>

            <li>
              <Link to="/contact" className="hover:text-green-400 transition">
                Contact
              </Link>
            </li>

            {!user && (
              <>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-green-400 transition"
                  >
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

        {/* ---------------------------------------------------------------- */}
        {/* DESTINATIONS */}
        {/* ---------------------------------------------------------------- */}

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Popular Destinations
          </h3>

          <ul className="space-y-3">
            <li>
              <Link
                to="/destinations/maasai-mara"
                className="hover:text-green-400 transition"
              >
                Maasai Mara
              </Link>
            </li>

            <li>
              <Link
                to="/destinations/amboseli"
                className="hover:text-green-400 transition"
              >
                Amboseli National Park
              </Link>
            </li>

            <li>
              <Link
                to="/destinations/diani-beach"
                className="hover:text-green-400 transition"
              >
                Diani Beach
              </Link>
            </li>

            <li>
              <Link
                to="/destinations/tsavo"
                className="hover:text-green-400 transition"
              >
                Tsavo National Park
              </Link>
            </li>

            <li>
              <Link
                to="/destinations/lake-naivasha"
                className="hover:text-green-400 transition"
              >
                Lake Naivasha
              </Link>
            </li>

            <li>
              <Link
                to="/destinations/watamu"
                className="hover:text-green-400 transition"
              >
                Watamu Marine Park
              </Link>
            </li>
          </ul>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* SERVICES & ROLE LINKS */}
        {/* ---------------------------------------------------------------- */}

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Travel Services
          </h3>

          <ul className="space-y-3">
            <li>
              <Link
                to="/tours?category=luxury"
                className="hover:text-green-400 transition"
              >
                Luxury Safaris
              </Link>
            </li>

            <li>
              <Link
                to="/tours?category=wildlife"
                className="hover:text-green-400 transition"
              >
                Wildlife Tours
              </Link>
            </li>

            <li>
              <Link
                to="/tours?category=beach"
                className="hover:text-green-400 transition"
              >
                Beach Holidays
              </Link>
            </li>

            <li>
              <Link
                to="/tours?category=group"
                className="hover:text-green-400 transition"
              >
                Group Adventures
              </Link>
            </li>

            <li>
              <Link
                to="/tours?category=honeymoon"
                className="hover:text-green-400 transition"
              >
                Honeymoon Packages
              </Link>
            </li>

            <li>
              <Link
                to="/airport-transfers"
                className="hover:text-green-400 transition"
              >
                Airport Transfers
              </Link>
            </li>
          </ul>

          {/* ADMIN */}

          {userRole === "admin" && (
            <div className="mt-8">
              <h4 className="text-white font-semibold mb-3">Admin Panel</h4>

              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/admin" className="hover:text-green-400">
                    Dashboard
                  </Link>
                </li>

                <li>
                  <Link to="/admin/manage-tours" className="hover:text-green-400">
                    Manage Tours
                  </Link>
                </li>

                <li>
                  <Link to="/admin/tours/add" className="hover:text-green-400">
                    Add Tour
                  </Link>
                </li>

                <li>
                  <Link to="/admin/analytics" className="hover:text-green-400">
                    Analytics
                  </Link>
                </li>

                <li>
                  <Link to="/admin/customers" className="hover:text-green-400">
                    Customers
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* AGENT */}

          {userRole === "agent" && (
            <div className="mt-8">
              <h4 className="text-white font-semibold mb-3">Agent Portal</h4>

              <Link to="/agent" className="hover:text-green-400 transition">
                Agent Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* FOOTER BOTTOM */}
      {/* ---------------------------------------------------------------- */}

      <div className="border-t border-gray-800">
        <div
          className="
          max-w-7xl
          mx-auto
          px-6
          py-6
          flex
          flex-col
          lg:flex-row
          justify-between
          items-center
          gap-4
          "
        >
          <p className="text-sm text-gray-500 text-center lg:text-left">
            © {year} Coherent  Tours. All Rights Reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link
              to="/privacy"
              className="hover:text-green-400 transition"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms"
              className="hover:text-green-400 transition"
            >
              Terms & Conditions
            </Link>

            <Link
              to="/refund-policy"
              className="hover:text-green-400 transition"
            >
              Refund Policy
            </Link>
          </div>

          <p className="text-sm text-gray-500 text-center lg:text-right">
            Creating unforgettable African travel experiences.
          </p>
        </div>
      </div>
    </footer>
  );
}