import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Plus, Search, RefreshCw, Eye, Pencil, Star, CheckCircle2, XCircle } from "lucide-react";

import { getAdminDestinations } from "../../api/adminDestinationApi";

const DestinationManagement = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  const {
    data: destinations = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-destinations"],
    queryFn: getAdminDestinations,
  });

  const filteredDestinations = useMemo(() => {
    const term = search.trim().toLowerCase();

    return destinations.filter((destination) => {
      const matchesSearch = !term || [
        destination.name,
        destination.country,
        destination.description,
      ].some((value) => String(value || "").toLowerCase().includes(term));

      const status = String(destination.status || "active").toLowerCase();
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const matchesFeatured = featuredFilter === "all"
        || (featuredFilter === "featured" && destination.featured)
        || (featuredFilter === "standard" && !destination.featured);

      return matchesSearch && matchesStatus && matchesFeatured;
    });
  }, [destinations, search, statusFilter, featuredFilter]);

  const activeCount = destinations.filter((d) => String(d.status || "active").toLowerCase() === "active").length;
  const featuredCount = destinations.filter((d) => Boolean(d.featured)).length;
  const inactiveCount = destinations.length - activeCount;

  const getImageUrl = (destination) => {
    const image = destination.images?.[0]?.url || destination.images?.[0];
    if (!image) return "";
    return image.startsWith("http")
      ? image
      : `${import.meta.env.VITE_API_URL?.replace("/api", "") || window.location.origin}${image}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 p-6">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-32 rounded-3xl bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-3"><div className="h-28 rounded-2xl bg-white" /><div className="h-28 rounded-2xl bg-white" /><div className="h-28 rounded-2xl bg-white" /></div>
          <div className="h-14 rounded-2xl bg-white" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"><div className="h-96 rounded-3xl bg-white" /><div className="h-96 rounded-3xl bg-white" /><div className="h-96 rounded-3xl bg-white" /></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 p-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-xl">
          <XCircle className="mx-auto mb-3 h-12 w-12 text-rose-500" />
          <h1 className="text-xl font-bold text-slate-900">Unable to load destinations</h1>
          <p className="mt-2 text-sm text-slate-500">{error.message || "Please try again."}</p>
          <button onClick={() => refetch()} className="mt-5 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 px-5 py-2.5 font-semibold text-white shadow-lg hover:shadow-xl">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 p-6 text-white shadow-2xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                <MapPin className="h-4 w-4" /> Destination portfolio
              </div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Destination Management</h1>
              <p className="mt-2 max-w-2xl text-sm text-sky-100 sm:text-base">
                Manage the destinations customers discover, compare and book across the platform.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 font-semibold text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-60">
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                {isFetching ? "Refreshing…" : "Refresh"}
              </button>
              <button type="button" onClick={() => navigate("/admin/create-destination")} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-bold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
                <Plus className="h-5 w-5" /> Add Destination
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-indigo-100 p-5 shadow-lg">
            <div className="flex items-center justify-between"><p className="text-sm font-semibold text-sky-700">Total destinations</p><MapPin className="h-5 w-5 text-indigo-600" /></div>
            <p className="mt-2 text-3xl font-black text-indigo-900">{destinations.length}</p>
            <p className="mt-1 text-xs text-slate-500">Available in your destination catalogue</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-100 p-5 shadow-lg">
            <div className="flex items-center justify-between"><p className="text-sm font-semibold text-emerald-700">Active</p><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
            <p className="mt-2 text-3xl font-black text-emerald-900">{activeCount}</p>
            <p className="mt-1 text-xs text-slate-500">Currently visible for operations</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 p-5 shadow-lg">
            <div className="flex items-center justify-between"><p className="text-sm font-semibold text-amber-700">Featured</p><Star className="h-5 w-5 fill-amber-400 text-amber-500" /></div>
            <p className="mt-2 text-3xl font-black text-amber-900">{featuredCount}</p>
            <p className="mt-1 text-xs text-slate-500">Priority destinations on the storefront</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-xl backdrop-blur sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search destination, country or description…" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100">
              <option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
            <select value={featuredFilter} onChange={(e) => setFeaturedFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100">
              <option value="all">All destinations</option><option value="featured">Featured only</option><option value="standard">Standard only</option>
            </select>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Showing {filteredDestinations.length} of {destinations.length}</span>
            {inactiveCount > 0 && <span>{inactiveCount} inactive</span>}
          </div>
        </section>

        {filteredDestinations.length === 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xl">
            <MapPin className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">No destinations found</h2>
            <p className="mt-2 text-sm text-slate-500">Try adjusting your search or filters, or add a new destination.</p>
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredDestinations.map((destination) => {
              const status = String(destination.status || "active").toLowerCase();
              const imageUrl = getImageUrl(destination);

              return (
                <article key={destination._id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-sky-100 via-indigo-100 to-violet-100">
                    {imageUrl ? (
                      <img src={imageUrl} alt={destination.name || "Destination"} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><MapPin className="h-14 w-14 text-indigo-300" /></div>
                    )}
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-gradient-to-b from-black/45 to-transparent p-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur ${status === "active" ? "bg-emerald-500/90 text-white" : "bg-rose-500/90 text-white"}`}>
                        {status === "active" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {status}
                      </span>
                      {destination.featured && <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold text-amber-950 shadow-lg"><Star className="h-3.5 w-3.5 fill-current" /> Featured</span>}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-black text-slate-900">{destination.name || "Unnamed destination"}</h2>
                        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-indigo-600"><MapPin className="h-4 w-4" />{destination.country || "Country not specified"}</p>
                      </div>
                    </div>
                    <p className="mt-4 min-h-[3.5rem] text-sm leading-6 text-slate-600">{destination.description || "No destination description has been provided."}</p>

                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs">
                      <div className="rounded-xl bg-slate-50 p-3"><p className="font-semibold text-slate-400">STATUS</p><p className={`mt-1 font-bold ${status === "active" ? "text-emerald-600" : "text-rose-600"}`}>{status}</p></div>
                      <div className="rounded-xl bg-slate-50 p-3"><p className="font-semibold text-slate-400">FEATURED</p><p className="mt-1 font-bold text-indigo-600">{destination.featured ? "Yes" : "No"}</p></div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => navigate(`/admin/edit-destination/${destination._id}`)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-sky-700 hover:to-indigo-700 hover:shadow-lg"><Pencil className="h-4 w-4" /> Edit</button>
                      <button type="button" onClick={() => navigate(`/admin/destinations/${destination._id}`)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"><Eye className="h-4 w-4" /> View</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
};

export default DestinationManagement;
