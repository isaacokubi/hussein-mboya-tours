import { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard, Plane, Heart, ChevronDown, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";

const normalizeRole = (user) => {
  if (!user) return "";
  if (typeof user.role === "string") return user.role.toLowerCase().replace(/[\s-]/g, "_");
  if (user.role?.name) return String(user.role.name).toLowerCase().replace(/[\s-]/g, "_");
  if (user.roles?.[0]?.name) return String(user.roles[0].name).toLowerCase().replace(/[\s-]/g, "_");
  return "";
};
const initialsFor = (name) => { const words = String(name || "Company").trim().split(/\s+/).filter(Boolean); if (!words.length) return "CO"; if (words.length === 1) return words[0].slice(0, 2).toUpperCase(); return `${words[0][0]}${words[1][0]}`.toUpperCase(); };

export default function Navbar() {
  const { user, logout } = useAuth();
  const { settings = {} } = useSettings() || {};
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const companyName = String(settings.companyName || (user ? "Company" : "Global Tours")).trim();
  const logoUrl = settings.companyLogo || settings.logo || "";
  const initials = useMemo(() => initialsFor(companyName), [companyName]);
  const role = normalizeRole(user);
  const compactRole = role.replace(/[\s_-]/g, "");
  const isAdmin = ["admin", "superadmin"].includes(compactRole);
  const isAgent = role === "agent"; const isGuide = role === "guide"; const isManager = ["manager", "tour_manager", "tourmanager"].includes(role); const isFinance = role === "financeofficer"; const isCustomer = !role || role === "customer";
  const dashboardLink = isAdmin ? { label: "Admin", path: "/admin" } : isManager ? { label: "Manager", path: "/tour-manager/dashboard" } : isAgent ? { label: "Agent", path: "/agent" } : isGuide ? { label: "Guide", path: "/guide/dashboard" } : isFinance ? { label: "Finance", path: "/finance/dashboard" } : { label: "Dashboard", path: "/dashboard" };
  const publicLinks = [["Home", "/"], ["Destinations", "/destinations"], ["Tours", "/tours"], ["About", "/about"], ["Contact", "/contact"]];
  const closeMobile = () => setMobileOpen(false);
  const submitSearch = (event) => { event.preventDefault(); const value = search.trim(); navigate(value ? `/tours?search=${encodeURIComponent(value)}` : "/tours"); setSearchOpen(false); closeMobile(); };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 shadow-2xl backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={closeMobile}>
          {logoUrl ? <img src={logoUrl} alt={companyName} className="h-11 w-11 rounded-2xl object-cover shadow-lg ring-1 ring-white/20" /> : <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 font-black text-lg text-slate-950 shadow-lg">{initials}</div>}
          <div className="min-w-0"><h2 className="truncate text-xl font-black tracking-tight text-white">{companyName}</h2><p className="truncate text-xs text-emerald-300">Tours & Travel SaaS</p></div>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">{publicLinks.map(([label, path]) => <NavLink key={path} to={path} end={path === "/"} className={({ isActive }) => `text-sm font-semibold transition ${isActive ? "text-emerald-300" : "text-slate-300 hover:text-white"}`}>{label}</NavLink>)}</nav>
        <div className="hidden items-center gap-3 lg:flex">
          <button type="button" onClick={() => setSearchOpen((v) => !v)} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-300" aria-label="Search tours"><Search size={19} /></button>
          {!user ? <><Link to="/login" className="px-2 text-sm font-semibold text-slate-200 hover:text-white">Login</Link><Link to="/register" className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">Register</Link><Link to="/tours" className="rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-emerald-300">Book Now</Link></> : <><Link to={dashboardLink.path} className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950"><LayoutDashboard size={17} />{dashboardLink.label}</Link><div className="relative"><button type="button" onClick={() => setProfileOpen((v) => !v)} className="flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-white hover:bg-white/10"><User size={17} /><span className="max-w-[120px] truncate">{user.name}</span><ChevronDown size={15} /></button>{profileOpen && <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"><div className="border-b px-4 py-3 font-semibold text-gray-700">Account menu</div>{isCustomer && <><Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex gap-3 px-4 py-3 hover:bg-gray-100"><LayoutDashboard size={18} />Dashboard</Link><Link to="/my-bookings" onClick={() => setProfileOpen(false)} className="flex gap-3 px-4 py-3 hover:bg-gray-100"><Plane size={18} />My Bookings</Link><Link to="/wishlist" onClick={() => setProfileOpen(false)} className="flex gap-3 px-4 py-3 hover:bg-gray-100"><Heart size={18} />Wishlist</Link></>}<button type="button" onClick={() => { setProfileOpen(false); logout(); }} className="flex w-full gap-3 px-4 py-3 text-red-600 hover:bg-red-50"><LogOut size={18} />Logout</button></div>}</div></>}
        </div>
        <button type="button" onClick={() => setMobileOpen((v) => !v)} className="text-white lg:hidden" aria-label="Toggle navigation">{mobileOpen ? <X size={29} /> : <Menu size={29} />}</button>
      </div>
      {searchOpen && <form onSubmit={submitSearch} className="absolute left-1/2 top-[5.5rem] hidden w-[min(92vw,640px)] -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl lg:flex"><Search className="m-3 text-emerald-300" size={20} /><input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tours, destinations or experiences..." className="flex-1 bg-transparent text-white outline-none placeholder:text-slate-500" /><button className="rounded-xl bg-emerald-400 px-5 font-bold text-slate-950">Search</button></form>}
      {mobileOpen && <div className="fixed right-0 top-20 z-40 h-[calc(100vh-5rem)] w-80 max-w-full overflow-y-auto border-l border-white/10 bg-slate-950 text-white shadow-2xl lg:hidden"><div className="space-y-2 p-5">{publicLinks.map(([label, path]) => <NavLink key={path} to={path} end={path === "/"} onClick={closeMobile} className={({ isActive }) => `block rounded-xl px-4 py-3 ${isActive ? "bg-emerald-400 text-slate-950 font-bold" : "hover:bg-white/10"}`}>{label}</NavLink>)}<form onSubmit={submitSearch} className="mt-5 flex gap-2 rounded-xl border border-white/10 bg-white/5 p-2"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tours..." className="min-w-0 flex-1 bg-transparent px-2 outline-none" /><button aria-label="Search" className="rounded-lg bg-emerald-400 p-2 text-slate-950"><Search size={18} /></button></form><hr className="my-5 border-white/10" />{!user ? <><Link to="/login" onClick={closeMobile} className="block rounded-xl px-4 py-3 hover:bg-white/10">Login</Link><Link to="/register" onClick={closeMobile} className="mt-2 block rounded-xl border border-white/10 px-4 py-3 text-center">Register</Link><Link to="/tours" onClick={closeMobile} className="mt-2 block rounded-xl bg-emerald-400 px-4 py-3 text-center font-bold text-slate-950">Book Now</Link></> : <><Link to={dashboardLink.path} onClick={closeMobile} className="block rounded-xl bg-emerald-400 px-4 py-3 font-bold text-slate-950">{dashboardLink.label}</Link>{isCustomer && <><Link to="/my-bookings" onClick={closeMobile} className="mt-2 block rounded-xl px-4 py-3 hover:bg-white/10">My Bookings</Link><Link to="/wishlist" onClick={closeMobile} className="mt-2 block rounded-xl px-4 py-3 hover:bg-white/10">Wishlist</Link></>}<button type="button" onClick={() => { closeMobile(); logout(); }} className="mt-5 w-full rounded-xl bg-red-600 py-3 font-bold">Logout</button></>}</div></div>}
    </header>
  );
}
