// src/components/layout/Navbar.jsx

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  const location = useLocation();

  /*
  |--------------------------------------------------------------------------
  | ACTIVE LINK STYLE
  |--------------------------------------------------------------------------
  */

  const activeClass = (path) => {
    return location.pathname === path
      ? "text-green-600 font-bold border-b-2 border-green-600"
      : "text-gray-700 hover:text-green-600";
  };

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE USER ROLE
  |--------------------------------------------------------------------------
  */

  const role =
    user?.role?.name

      ?.toLowerCase()

      .replace(/\s+/g, "") ||
    user?.legacyRole

      ?.toLowerCase()

      .replace(/\s+/g, "") ||
    "customer";

  /*
  |--------------------------------------------------------------------------
  | ROLE CHECKS
  |--------------------------------------------------------------------------
  */

  const isCustomer = role === "customer";

  const isAdmin = role === "admin" || role === "superadmin";

  const isTourManager = role === "tourmanager" || role === "manager";

  const isBookingAgent = role === "bookingagent" || role === "agent";

  const isFinanceOfficer =
    role === "financeofficer" || role === "finance_officer";

  const isTourGuide = role === "guide" || role === "tour_guide";

  return (
    <nav
      className="
      sticky
      top-0
      z-50
      bg-white/90
      backdrop-blur-md
      shadow-lg
      border-b
      border-gray-200
      "
    >
      <div
        className="
        max-w-7xl
        mx-auto
        px-6
        py-4
        flex
        justify-between
        items-center
        "
      >
        {/* LOGO */}

        <Link
          to="/"
          className="
          text-2xl
          font-extrabold
          text-yellow-600
          tracking-wide
          hover:scale-105
          transition
          "
        >
          Hussein Mboya Tours
        </Link>

        <div
          className="
          flex
          items-center
          gap-5
          text-sm
          font-medium
          "
        >
          {/* PUBLIC LINKS */}

          <Link to="/" className={`transition ${activeClass("/")}`}>
            Home
          </Link>

          <Link
            to="/destinations"
            className={`transition ${activeClass("/destinations")}`}
          >
            Destinations
          </Link>

          <Link to="/tours" className={`transition ${activeClass("/tours")}`}>
            Tours
          </Link>

          {/* CUSTOMER PORTAL */}

          {user && isCustomer && (
            <>
              <Link
                to="/dashboard"
                className={`transition ${activeClass("/dashboard")}`}
              >
                My Dashboard
              </Link>

              <Link
                to="/bookings"
                className={`transition ${activeClass("/bookings")}`}
              >
                My Bookings
              </Link>

              <Link
                to="/wishlist"
                className={`transition ${activeClass("/wishlist")}`}
              >
                Wishlist
              </Link>

              <Link
                to="/profile"
                className={`transition ${activeClass("/profile")}`}
              >
                Profile
              </Link>

              <span
                className="
                bg-yellow-100
                text-yellow-700
                px-3
                py-1
                rounded-full
                font-semibold
                "
              >
                ⭐ {user?.loyaltyPoints || 0}
              </span>
            </>
          )}

          {/* ADMIN */}

          {user && isAdmin && (
            <Link
              to="/admin"
              className="
              bg-green-600
              text-white
              px-4
              py-2
              rounded-xl
              shadow-md
              hover:bg-green-700
              transition
              font-semibold
              "
            >
              Admin Dashboard
            </Link>
          )}

          {/* TOUR MANAGER */}

          {user && isTourManager && (
            <Link
              to="/tour_manager/dashboard"
              className="
              bg-blue-600
              text-white
              px-4
              py-2
              rounded-xl
              shadow-md
              hover:bg-blue-700
              transition
              font-semibold
              "
            >
              Tour Manager
            </Link>
          )}

          {/* BOOKING AGENT */}

          {user && isBookingAgent && (
            <Link
              to="/agent"
              className="
              bg-purple-600
              text-white
              px-4
              py-2
              rounded-xl
              shadow-md
              hover:bg-purple-700
              transition
              font-semibold
              "
            >
              Agent Portal
            </Link>
          )}

          {/* FINANCE OFFICER */}

          {user && isFinanceOfficer && (
            <Link
              to="/finance/dashboard"
              className="
              bg-yellow-600
              text-white
              px-4
              py-2
              rounded-xl
              shadow-md
              hover:bg-yellow-700
              transition
              font-semibold
              "
            >
              Finance Dashboard
            </Link>
          )}

          {/* TOUR GUIDE */}

          {user && isTourGuide && (
            <Link
              to="/guide/dashboard"
              className="
              bg-orange-600
              text-white
              px-4
              py-2
              rounded-xl
              shadow-md
              hover:bg-orange-700
              transition
              font-semibold
              "
            >
              Guide Portal
            </Link>
          )}

          {/* AUTH */}

          {user ? (
            <button
              onClick={logout}
              className="
              text-red-600
              hover:text-red-800
              font-semibold
              transition
              "
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className={`transition ${activeClass("/login")}`}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="
                bg-green-600
                text-white
                px-5
                py-2
                rounded-xl
                shadow-md
                hover:bg-green-700
                transition
                "
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
