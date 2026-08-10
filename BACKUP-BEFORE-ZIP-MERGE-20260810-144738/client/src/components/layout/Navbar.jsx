import { useState, useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Map,
  Plane,
  Heart,
  Phone,
  Info,
  ChevronDown,
  Search,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE ROLE
  |--------------------------------------------------------------------------
  */

  const role = useMemo(() => {
    if (!user) return "";

    if (typeof user.role === "string") {
      return user.role.toLowerCase();
    }

    if (user.role?.name) {
      return user.role.name.toLowerCase();
    }

    if (user.roles?.length) {
      return user.roles[0].name.toLowerCase();
    }

    return "";
  }, [user]);

  const isAdmin = role === "admin";

  const isAgent = role === "agent";

  const isGuide = role === "guide";

  const isManager =
  role === "manager" ||
  role === "tour_manager" ||
  role === "tourmanager";

  const isFinance = role === "financeofficer";

  const isCustomer = !role || role === "customer";

  /*
  |--------------------------------------------------------------------------
  | PUBLIC LINKS
  |--------------------------------------------------------------------------
  */

  const publicLinks = [
    {
      name: "Home",
      path: "/",
    },

    {
      name: "Destinations",
      path: "/destinations",
    },

    {
      name: "Tours",
      path: "/tours",
    },

    {
      name: "About",
      path: "/about",
    },

    {
      name: "Contact",
      path: "/contact",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD LINK
  |--------------------------------------------------------------------------
  */

  const dashboardLink = (() => {
    if (isAdmin)
      return {
        label: "Admin",
        path: "/admin",
      };

    if (isManager)
      return {
        label: "Manager",
        path: "/tour-manager/dashboard",
      };

    if (isAgent)
      return {
        label: "Agent",
        path: "/agent",
      };

    if (isGuide)
      return {
        label: "Guide",
        path: "/guide/dashboard",
      };

    if (isFinance)
      return {
        label: "Finance",
        path: "/finance/dashboard",
      };

    return {
      label: "Dashboard",
      path: "/dashboard",
    };
  })();

  const linkClass = ({ isActive }) =>
`
transition
duration-300
font-medium
${
isActive
?
"text-yellow-400 font-bold"
:
"text-white hover:text-yellow-300"
}
`;

  return (
    <header
      className="
    sticky
    top-0
    z-50
    bg-gradient-to-r
    from-green-950
    via-green-900
    to-emerald-800
    shadow-xl
    border-b
    border-yellow-500/30
    backdrop-blur-lg
  "
    >
      <div
        className="
    max-w-7xl
    mx-auto
    h-20
    px-6
    flex
    items-center
    justify-between
  "
      >
        {/* ------------------------------------------------ */}
        {/* LOGO */}
        {/* ------------------------------------------------ */}

        <Link to="/" className="flex items-center gap-3">
         <div
  className="
    h-11
    w-11
    rounded-full
    bg-yellow-500
    text-green-950
    flex
    items-center
    justify-center
    font-extrabold
    text-lg
    shadow-lg
  "
>
  CT
</div>


<div>

<h2
className="
font-extrabold
text-xl
text-white
tracking-wide
"
>
Coherent Tours
</h2>


<p
className="
text-xs
text-yellow-300
"
>
Explore Africa
</p>


</div>
        </Link>

        {/* ------------------------------------------------ */}
        {/* DESKTOP NAVIGATION */}
        {/* ------------------------------------------------ */}

        <nav className="hidden lg:flex items-center gap-8">
          {publicLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/"}
              className={linkClass}
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* ------------------------------------------------ */}
        {/* RIGHT SIDE */}
        {/* ------------------------------------------------ */}

        <div className="hidden lg:flex items-center gap-4">
          <button
            className="
p-2
rounded-full
text-white
hover:bg-white/10
transition
"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {!user && (
            <>
              <Link to="/login" className="
text-white
font-medium
hover:text-yellow-300
transition
">
                Login
              </Link>

              <Link
                to="/register"
                className="bg-yellow-500
hover:bg-yellow-600
text-green-950
shadow-lg px-5 py-2.5 rounded-lg font-semibold transition"
              >
                Register
              </Link>

              <Link
                to="/tours"
                className="bg-gradient-to-r
from-yellow-400
to-yellow-600
text-green-950
hover:scale-105
shadow-xl px-5 py-2.5 rounded-lg font-semibold transition"
              >
                Book Now
              </Link>
            </>
          )}

          {user && (
            <>
              <Link
                to={dashboardLink.path}
                className="bg-yellow-500
text-green-950
hover:bg-yellow-400
shadow-lg px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-800 transition"
              >
                <LayoutDashboard size={18} />

                {dashboardLink.label}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 border rounded-lg px-3 py-2 hover:bg-gray-50"
                >
                  <User size={18} />

                  <span className="max-w-[120px] truncate">{user.name}</span>

                  <ChevronDown size={16} />
                </button>{" "}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: 10,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                      className="
                      absolute
                      right-0
                      mt-3
                      w-56
                      bg-white
                      rounded-xl
                      shadow-xl
                      border
                      overflow-hidden
                      z-50
                      "
                    >
                      {isCustomer && (
                        <>
                          <Link
                            to="/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
                          >
                            <LayoutDashboard size={18} />
                            Dashboard
                          </Link>

                          <Link
                            to="/my-bookings"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
                          >
                            <Plane size={18} />
                            My Bookings
                          </Link>

                          <Link
                            to="/wishlist"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
                          >
                            <Heart size={18} />
                            Wishlist
                          </Link>

                          <Link
                            to="/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
                          >
                            <User size={18} />
                            Profile
                          </Link>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                        }}
                        className="
                        w-full
                        flex
                        items-center
                        gap-3
                        px-4
                        py-3
                        text-red-600
                        hover:bg-red-50
                        "
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* ------------------------------------------------ */}
        {/* MOBILE MENU BUTTON */}
        {/* ------------------------------------------------ */}

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>{" "}
      {/* ------------------------------------------------ */}
      {/* MOBILE MENU */}
      {/* ------------------------------------------------ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{
              opacity: 0,
              x: "100%",
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: "100%",
            }}
            transition={{
              duration: 0.25,
            }}
            className="
            lg:hidden
            fixed
            top-20
            right-0
            w-80
            max-w-full
            h-[calc(100vh-5rem)]
            bg-gradient-to-b
from-green-950
to-green-900
text-white
            shadow-2xl
            border-l
            z-40
            overflow-y-auto
            "
          >
            <div className="p-6 space-y-2">
              {/* Public Navigation */}

              {publicLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-lg px-4 py-3 transition ${
                      isActive
                        ? "bg-green-100 text-green-700 font-semibold"
                        : "hover:bg-white/10 text-white"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              <hr className="my-4" />

              {!user ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-4 py-3 hover:bg-gray-100"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="
                    block
                    text-center
                    bg-green-700
                    text-white
                    rounded-lg
                    py-3
                    mt-3
                    hover:bg-green-800
                    transition
                    "
                  >
                    Register
                  </Link>

                  <Link
                    to="/tours"
                    onClick={() => setMobileOpen(false)}
                    className="
                    block
                    text-center
                    bg-yellow-500
                    text-white
                    rounded-lg
                    py-3
                    mt-3
                    hover:bg-yellow-600
                    transition
                    "
                  >
                    Book Now
                  </Link>
                </>
              ) : (
                <>
                  <div className="pb-4 border-b">
                    <h3 className="font-bold text-lg">{user.name}</h3>

                    <p className="text-sm text-gray-500 capitalize">
                      {dashboardLink.label}
                    </p>
                  </div>

                  <Link
                    to={dashboardLink.path}
                    onClick={() => setMobileOpen(false)}
                    className="
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    rounded-lg
                    hover:bg-gray-100
                    "
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>

                  {isCustomer && (
                    <>
                      <Link
                        to="/my-bookings"
                        onClick={() => setMobileOpen(false)}
                        className="
                        flex
                        items-center
                        gap-3
                        px-4
                        py-3
                        rounded-lg
                        hover:bg-gray-100
                        "
                      >
                        <Plane size={18} />
                        My Bookings
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setMobileOpen(false)}
                        className="
                        flex
                        items-center
                        gap-3
                        px-4
                        py-3
                        rounded-lg
                        hover:bg-gray-100
                        "
                      >
                        <Heart size={18} />
                        Wishlist
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="
                        flex
                        items-center
                        gap-3
                        px-4
                        py-3
                        rounded-lg
                        hover:bg-gray-100
                        "
                      >
                        <User size={18} />
                        Profile
                      </Link>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="
                    mt-6
                    w-full
                    bg-red-600
                    hover:bg-red-700
                    text-white
                    py-3
                    rounded-lg
                    flex
                    justify-center
                    items-center
                    gap-2
                    transition
                    "
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              )}

              <hr className="my-6" />

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  +254 733 439 762
                </div>

                <div className="flex items-center gap-2">
                  <Map size={16} />
                  Nairobi, Kenya
                </div>

                <div className="flex items-center gap-2">
                  <Info size={16} />
                  Luxury Safaris • Beach Holidays • Tours
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
