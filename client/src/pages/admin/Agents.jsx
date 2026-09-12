import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, CheckCircle2, Clock3, PauseCircle, MapPin, Search, RefreshCw, UserCheck, Building2, Mail, Phone } from "lucide-react";
import { toast } from "react-toastify";
import { getAgents, approveAgent, updateAgentStatus } from "../../api/adminAgentApi";

const STATUS_OPTIONS = ["active", "inactive", "suspended"];
const statusLabel = (status) => ({ active: "Active", inactive: "Inactive", suspended: "Suspended" }[status] || "Unknown");
const statusClass = (status) => ({
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  inactive: "bg-slate-100 text-slate-700 ring-slate-200",
  suspended: "bg-rose-50 text-rose-700 ring-rose-200",
}[status] || "bg-slate-100 text-slate-700 ring-slate-200");
const money = (value) => `KES ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const text = (value, fallback = "—") => String(value ?? "").trim() || fallback;

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div>
        <span className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</span>
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
    </div>
  );
}

export default function Agents() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { data = [], isLoading, isFetching, isError, refetch } = useQuery({ queryKey: ["agents"], queryFn: getAgents, staleTime: 15_000 });

  const approve = useMutation({
    mutationFn: approveAgent,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agents"] }); toast.success("Agent approved successfully."); },
    onError: (error) => toast.error(error?.response?.data?.message || "Unable to approve this agent."),
  });
  const status = useMutation({
    mutationFn: ({ id, value }) => updateAgentStatus(id, value),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agents"] }); toast.success("Agent status updated."); },
    onError: (error) => toast.error(error?.response?.data?.message || "Unable to update agent status."),
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.filter((agent) => {
      const state = !agent.isApproved ? "pending" : agent.status || "inactive";
      const haystack = [agent.user?.name, agent.user?.email, agent.email, agent.companyName, agent.location, agent.phone].filter(Boolean).join(" ").toLowerCase();
      return (!term || haystack.includes(term)) && (filter === "all" || state === filter);
    });
  }, [data, search, filter]);

  const active = data.filter((agent) => agent.isApproved === true && agent.status === "active").length;
  const pending = data.filter((agent) => agent.isApproved !== true).length;
  const suspended = data.filter((agent) => agent.isApproved === true && agent.status === "suspended").length;

  if (isLoading) return <div className="min-h-[60vh] bg-gradient-to-br from-emerald-50 via-slate-50 to-amber-50 p-4 sm:p-6"><div className="mx-auto max-w-7xl animate-pulse rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">Loading agent management…</div></div>;
  if (isError) return <div className="min-h-[60vh] bg-gradient-to-br from-emerald-50 via-slate-50 to-amber-50 p-4 sm:p-6"><div className="mx-auto max-w-7xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800"><h1 className="font-bold">Unable to load agents</h1><p className="mt-1 text-sm">Please refresh and try again.</p><button onClick={() => refetch()} className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800">Retry</button></div></div>;

  return (
    <div className="min-h-full bg-gradient-to-br from-emerald-50 via-slate-50 to-amber-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-600 p-5 text-white shadow-lg sm:p-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-emerald-100"><Building2 className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-[0.2em]">Partner network</span></div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Agent Management</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50">Approve travel partners, monitor real booking performance and manage agent access without mixing approval state with operational status.</p>
            </div>
            <button type="button" onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-bold ring-1 ring-white/30 hover:bg-white/25 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />{isFetching ? "Refreshing…" : "Refresh"}</button>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Users} label="Total agents" value={data.length} tone="bg-emerald-100 text-emerald-700" />
          <Metric icon={CheckCircle2} label="Active & approved" value={active} tone="bg-green-100 text-green-700" />
          <Metric icon={Clock3} label="Awaiting approval" value={pending} tone="bg-amber-100 text-amber-700" />
          <Metric icon={PauseCircle} label="Suspended" value={suspended} tone="bg-rose-100 text-rose-700" />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-slate-900">Travel partner directory</h2><p className="text-xs text-slate-500">Operational figures are sourced from booking and commission records where available.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{rows.length} records</span></div>
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search agent, company, email, phone or location…" className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100" /></div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"><option value="all">All agents</option><option value="active">Active & approved</option><option value="pending">Awaiting approval</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="bg-slate-50"><tr className="border-b border-slate-200"><th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Agent</th><th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Company</th><th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Contact / location</th><th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Bookings</th><th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Commission</th><th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Status</th><th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Action</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((agent) => {
                  const pendingApproval = agent.isApproved !== true;
                  const operationalStatus = agent.status || "inactive";
                  return <tr key={agent._id} className="transition hover:bg-emerald-50/40">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-extrabold text-emerald-800">{text(agent.user?.name, "A").slice(0, 1).toUpperCase()}</div><div className="min-w-0"><div className="font-bold text-slate-900">{text(agent.user?.name)}</div><div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500"><Mail className="h-3 w-3" />{text(agent.email || agent.user?.email)}</div></div></div></td>
                    <td className="px-5 py-4"><div className="font-semibold text-slate-800">{text(agent.companyName, "Amani Trails Safaris")}</div></td>
                    <td className="px-5 py-4"><div className="space-y-1 text-xs text-slate-600"><div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-emerald-600" />{text(agent.phone || agent.user?.phone)}</div><div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-emerald-600" />{text(agent.location)}</div></div></td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900">{Number(agent.totalBookings || 0).toLocaleString("en-KE")}</td>
                    <td className="px-5 py-4 text-right font-extrabold text-emerald-700">{money(agent.totalCommission)}</td>
                    <td className="px-5 py-4">{pendingApproval ? <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200"><Clock3 className="h-3.5 w-3.5" />Pending approval</span> : <select aria-label={`Status for ${text(agent.user?.name)}`} value={STATUS_OPTIONS.includes(operationalStatus) ? operationalStatus : "inactive"} onChange={(e) => status.mutate({ id: agent._id, value: e.target.value })} className={`rounded-full border-0 px-3 py-1.5 text-xs font-bold ring-1 outline-none ${statusClass(operationalStatus)}`} disabled={status.isPending && status.variables?.id === agent._id}>{STATUS_OPTIONS.map((option) => <option key={option} value={option}>{statusLabel(option)}</option>)}</select>}</td>
                    <td className="px-5 py-4 text-right">{pendingApproval ? <button type="button" onClick={() => approve.mutate(agent._id)} disabled={approve.isPending} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60"><UserCheck className="h-3.5 w-3.5" />{approve.isPending && approve.variables === agent._id ? "Approving…" : "Approve"}</button> : <span className="text-xs font-medium text-slate-400">Managed</span>}</td>
                  </tr>;
                })}
                {!rows.length && <tr><td colSpan="7" className="px-6 py-16 text-center"><Users className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-bold text-slate-900">No agents found</p><p className="mt-1 text-sm text-slate-500">Adjust the search or status filter.</p></td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
