import { useQuery } from "@tanstack/react-query";
import { Package, RefreshCw } from "lucide-react";
import { getPackages } from "../../api/packageApi";

export default function AgentPackages() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({ queryKey: ["agent-packages"], queryFn: getPackages });
  const packages = Array.isArray(data) ? data : data?.packages || data?.data?.packages || data?.data || [];
  return <div className="min-h-screen bg-slate-50 p-4 md:p-8"><div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-wrap justify-between gap-4"><div><h1 className="text-3xl font-bold">Tour Packages</h1><p className="mt-1 text-slate-500">Browse packages available to your agency and use them when preparing quotes.</p></div><button onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 font-semibold">{isFetching ? <RefreshCw className="animate-spin" size={17}/> : <RefreshCw size={17}/>} Refresh</button></header>
    {isLoading && <div className="rounded-2xl bg-white p-8 shadow-sm">Loading packages...</div>}
    {isError && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">Unable to load packages.</div>}
    {!isLoading && !isError && !packages.length && <div className="rounded-2xl bg-white p-10 text-center shadow-sm"><Package className="mx-auto" size={34}/><h2 className="mt-3 font-bold">No packages available</h2><p className="mt-1 text-slate-500">Published packages will appear here.</p></div>}
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{packages.map((pkg) => <article key={pkg._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-bold">{pkg.name || pkg.title || "Tour package"}</h2><p className="mt-2 text-sm text-slate-500">{pkg.description || "Package details are available from the package record."}</p><div className="mt-4 flex justify-between text-sm"><span>{pkg.duration || pkg.durationDays ? `${pkg.duration || pkg.durationDays} days` : "Flexible duration"}</span><strong>{pkg.price ? `KES ${Number(pkg.price).toLocaleString()}` : "Contact for price"}</strong></div></article>)}</div>
  </div></div>;
}
