import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard, Plane, Heart, ChevronDown, Phone, Map, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";

const normalizeRole = (user) => {
  if (!user) return "";
  if (typeof user.role === "string") return user.role.toLowerCase().replace(/[\s-]/g, "_");
  if (user.role?.name) return String(user.role.name).toLowerCase().replace(/[\s-]/g, "_");
  if (user.roles?.[0]?.name) return String(user.roles[0].name).toLowerCase().replace(/[\s-]/g, "_");
  return "";
};

const initialsFor = (name) => {
  const words = String(name || "Global Tours").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "GT";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { settings = {} } = useSettings() || {};
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const companyName = String(settings.companyName || "Global Tours").trim();
  const logoUrl = settings.companyLogo || settings.logo || "";
  const initials = useMemo(() => initialsFor(companyName), [companyName]);
  const role = normalizeRole(user);
  const compactRole = role.replace(/[\s_-]/g, "");
  const isAdmin = ["admin", "superadmin"].includes(compactRole);
  const isAgent = role === "agent";
  const isGuide = role === "guide";
  const isManager = ["manager", "tour_manager", "tourmanager"].includes(role);
  const isFinance = role === "financeofficer";
  const isCustomer = !role || role === "customer";

  const dashboardLink = isAdmin
    ? { label: "Admin", path: "/admin" }
    : isManager
      ? { label: "Manager", path: "/tour-manager/dashboard" }
      : isAgent
        ? { label: "Agent", path: "/agent" }
        : isGuide
          ? { label: "Guide", path: "/guide/dashboard" }
          : isFinance
            ? { label: "Finance", path: "/finance/dashboard" }
            : { label: "Dashboard", path: "/dashboard" };

  const publicLinks = [
    ["Home", "/"],
    ["Destinations", "/destinations"],
    ["Tours", "/tours"],
    ["About", "/about"],
    ["Contact", "/contact"],
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-green-950 via-green-900 to-emerald-800 shadow-xl border-b border-yellow-500/30 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 min-w-0" onClick={closeMobile}>
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} className="h-11 w-11 rounded-full object-cover bg-white shadow-lg" />
          ) : (
            <div className="h-11 w-11 shrink-0 rounded-full bg-yellow-500 text-green-950 flex items-center justify-center font-extrabold text-lg shadow-lg" aria-hidden="true">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-extrabold text-xl text-white tracking-wide truncate max-w-[240px]">{companyName}</h2>
            <p className="text-xs text-yellow-300 truncate max-w-[240px]">{settings.websiteUrl || "Tours & Travel"}</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {publicLinks.map(([label, path]) => (
            <NavLink key={path} to={path} end={path === "/"} className={({ isActive }) => `font-medium transition duration-300 ${isActive ? "text-yellow-400 font-bold" : "text-white hover:text-yellow-300"}`}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <button type="button" className="p-2 rounded-full text-white hover:bg-white/10 transition" aria-label="Search"><Search size={20} /></button>
          {!user ? (
            <>
              <Link to="/login" className="text-white font-medium hover:text-yellow-300 transition">Login</Link>
              <Link to="/register" className="bg-yellow-500 hover:bg-yellow-600 text-green-950 shadow-lg px-5 py-2.5 rounded-lg font-semibold transition">Register</Link>
              <Link to="/tours" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-green-950 hover:scale-105 shadow-xl px-5 py-2.5 rounded-lg font-semibold transition">Book Now</Link>
            </>
          ) : (
            <>
              <Link to={dashboardLink.path} className="bg-yellow-500 text-green-950 hover:bg-yellow-400 shadow-lg px-4 py-2 rounded-lg flex items-center gap-2 transition">
                <LayoutDashboard size={18} /> {dashboardLink.label}
              </Link>
              <div className="relative">
                <button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-2 border border-white/30 text-white rounded-lg px-3 py-2 hover:bg-white/10">
                  <User size={18} /><span className="max-w-[120px] truncate">{user.name}</span><ChevronDown size={16} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border overflow-hidden z-50">
                    <div className="border-b px-4 py-3 font-semibold text-gray-700">Account menu</div>
                    {isCustomer && (
                      <>
                        <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"><LayoutDashboard size={18} />Dashboard</Link>
                        <Link to="/my-bookings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"><Plane size={18} />My Bookings</Link>
                        <Link to="/wishlist" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"><Heart size={18} />Wishlist</Link>
                      </>
                    )}
                    <button type="button" onClick={() => { setProfileOpen(false); logout(); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50"><LogOut size={18} />Logout</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <button type="button" onClick={() => setMobileOpen((open) => !open)} className="lg:hidden text-white" aria-label="Toggle navigation menu">
          {mobileOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed top-20 right-0 w-80 max-w-full h-[calc(100vh-5rem)] bg-gradient-to-b from-green-950 to-green-900 text-white shadow-2xl border-l z-40 overflow-y-auto">
          <div className="p-6 space-y-2">
            {publicLinks.map(([label, path]) => (
              <NavLink key={path} to={path} end={path === "/"} onClick={closeMobile} className={({ isActive }) => `block rounded-lg px-4 py-3 transition ${isActive ? "bg-green-100 text-green-700 font-semibold" : "hover:bg-white/10 text-white"}`}>
                {label}
              </NavLink>
            ))}
            <hr className="my-4 border-white/20" />
            {!user ? (
              <>
                <Link to="/login" onClick={closeMobile} className="block rounded-lg px-4 py-3 hover:bg-white/10">Login</Link>
                <Link to="/register" onClick={closeMobile} className="block text-center bg-green-700 text-white rounded-lg py-3 mt-3">Register</Link>
                <Link to="/tours" onClick={closeMobile} className="block text-center bg-yellow-500 text-green-950 rounded-lg py-3 mt-3">Book Now</Link>
              </>
            ) : (
              <>
                <div className="pb-4 border-b border-white/20"><h3 className="font-bold text-lg">{user.name}</h3><p className="text-sm text-white/70 capitalize">{dashboardLink.label}</p></div>
                <Link to={dashboardLink.path} onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10"><LayoutDashboard size={18} />Dashboard</Link>
                {isCustomer && <>
                  <Link to="/my-bookings" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10"><Plane size={18} />My Bookings</Link>
                  <Link to="/wishlist" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10"><Heart size={18} />Wishlist</Link>
                </>}
                <button type="button" onClick={() => { closeMobile(); logout(); }} className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg flex justify-center items-center gap-2"><LogOut size={18} />Logout</button>
              </>
            )}
            <hr className="my-6 border-white/20" />
            <div className="space-y-3 text-sm text-white/80">
              {settings.supportPhone && <div className="flex items-center gap-2"><Phone size={16} />{settings.supportPhone}</div>}
              {(settings.city || settings.country) && <div className="flex items-center gap-2"><Map size={16} />{settings.city || ""}{settings.city && settings.country ? ", " : ""}{settings.country || ""}</div>}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
