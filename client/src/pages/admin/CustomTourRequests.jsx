import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  DollarSign,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Users,
  UserRound,
  XCircle,
} from "lucide-react";
import {
  assignCustomTourResources,
  getAdminCustomTourRequests,
  quoteCustomTourRequest,
} from "../../api/customTourApi";
import { getAgents } from "../../api/adminAgentApi";
import { getDrivers, getGuides } from "../../api/tourApi";

const KES = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

const getList = (value, keys = []) => {
  if (Array.isArray(value)) return value;
  for (const key of keys) if (Array.isArray(value?.[key])) return value[key];
  return [];
};

const getCustomer = (request) =>
  request?.customer || request?.user || request?.guestContact || {};

const getStatusMeta = (status) => {
  const normalized = String(status || "pending").toLowerCase();
  const meta = {
    pending: {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 ring-amber-200",
      icon: Clock3,
    },
    quoted: {
      label: "Quoted",
      className: "bg-blue-50 text-blue-700 ring-blue-200",
      icon: Send,
    },
    converted: {
      label: "Converted",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      icon: CheckCircle2,
    },
    rejected: {
      label: "Declined",
      className: "bg-rose-50 text-rose-700 ring-rose-200",
      icon: XCircle,
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-slate-100 text-slate-600 ring-slate-200",
      icon: XCircle,
    },
  };
  return meta[normalized] || {
    label: normalized.replace(/_/g, " "),
    className: "bg-slate-100 text-slate-600 ring-slate-200",
    icon: FileText,
  };
};

export default function CustomTourRequests() {
  const qc = useQueryClient();
  const [amounts, setAmounts] = useState({});
  const [notes, setNotes] = useState({});
  const [resources, setResources] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const requestsQuery = useQuery({
    queryKey: ["admin-custom-tour-requests"],
    queryFn: getAdminCustomTourRequests,
  });
  const agentsQuery = useQuery({ queryKey: ["admin-agents"], queryFn: getAgents });
  const guidesQuery = useQuery({ queryKey: ["custom-guides"], queryFn: getGuides });
  const driversQuery = useQuery({ queryKey: ["custom-drivers"], queryFn: getDrivers });

  const requests = getList(requestsQuery.data, ["requests", "data"]);
  const agents = getList(agentsQuery.data, ["agents", "data"]);
  const guides = getList(guidesQuery.data, ["guides", "data"]);
  const drivers = getList(driversQuery.data, ["drivers", "data"]);

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter((request) => {
      const customer = getCustomer(request);
      const haystack = [
        request?.destination,
        request?.requirements,
        customer?.name,
        customer?.email,
        request?.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !term || haystack.includes(term);
      const matchesStatus =
        statusFilter === "all" || String(request?.status || "pending").toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const metrics = useMemo(() => {
    const pending = requests.filter((r) => r.status === "pending").length;
    const quoted = requests.filter((r) => r.status === "quoted").length;
    const converted = requests.filter((r) => r.status === "converted").length;
    const value = requests.reduce((sum, r) => sum + Number(r.quotedAmount || 0), 0);
    return { total: requests.length, pending, quoted, converted, value };
  }, [requests]);

  const refresh = async () => {
    await Promise.all([
      requestsQuery.refetch(),
      agentsQuery.refetch(),
      guidesQuery.refetch(),
      driversQuery.refetch(),
    ]);
  };

  const assignMutation = useMutation({
    mutationFn: assignCustomTourResources,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-custom-tour-requests"] }),
  });

  const quoteMutation = useMutation({
    mutationFn: quoteCustomTourRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-custom-tour-requests"] });
    },
  });

  const updateResource = (id, key, value) =>
    setResources((current) => ({
      ...current,
      [id]: { ...(current[id] || {}), [key]: value },
    }));

  const isBusy =
    requestsQuery.isFetching ||
    agentsQuery.isFetching ||
    guidesQuery.isFetching ||
    driversQuery.isFetching;

  if (requestsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 p-4 sm:p-6">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
          <div className="rounded-2xl bg-white px-8 py-7 text-center shadow-lg ring-1 ring-slate-200">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-3 text-sm font-semibold text-slate-700">Loading custom tour requests</p>
            <p className="mt-1 text-xs text-slate-500">Preparing requests, resources and customer details…</p>
          </div>
        </div>
      </div>
    );
  }

  if (requestsQuery.isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-lg">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
          <h2 className="mt-3 text-lg font-bold text-slate-900">Unable to load custom tour requests</h2>
          <p className="mt-1 text-sm text-slate-500">
            {requestsQuery.error?.response?.data?.message || "Please refresh and try again."}
          </p>
          <button
            onClick={refresh}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 text-white shadow-xl">
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ring-white/20">
                <Sparkles className="h-3.5 w-3.5" /> Sales & Operations
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Custom Tour Requests</h1>
              <p className="mt-1 max-w-2xl text-sm text-sky-100">
                Review bespoke travel requests, prepare quotes, assign operational resources and keep customers moving toward conversion.
              </p>
            </div>
            <button
              onClick={refresh}
              disabled={isBusy}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/25 transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isBusy ? "animate-spin" : ""}`} />
              {isBusy ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          {[
            ["Total Requests", metrics.total, "bg-sky-50 text-sky-700 ring-sky-200", FileText],
            ["Pending", metrics.pending, "bg-amber-50 text-amber-700 ring-amber-200", Clock3],
            ["Quoted", metrics.quoted, "bg-blue-50 text-blue-700 ring-blue-200", Send],
            ["Converted", metrics.converted, "bg-emerald-50 text-emerald-700 ring-emerald-200", CheckCircle2],
            ["Quoted Value", KES.format(metrics.value), "bg-violet-50 text-violet-700 ring-violet-200", DollarSign],
          ].map(([label, value, style, Icon]) => (
            <div key={label} className={`rounded-xl bg-white p-3.5 shadow-sm ring-1 ${style.split(" ").filter((x) => x.startsWith("ring-")).join(" ")}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
                <span className={`rounded-lg p-2 ${style.split(" ").filter((x) => !x.startsWith("ring-")).join(" ")}`}><Icon className="h-4 w-4" /></span>
              </div>
              <p className="mt-2 truncate text-xl font-extrabold text-slate-900">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search destination, customer, email or requirements…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-9 text-sm font-semibold capitalize text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="quoted">Quoted</option>
                  <option value="converted">Converted</option>
                  <option value="rejected">Declined</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-500">{filteredRequests.length} shown</span>
          </div>
        </section>

        <section className="space-y-3">
          {filteredRequests.map((request) => {
            const customer = getCustomer(request);
            const status = getStatusMeta(request.status);
            const StatusIcon = status.icon;
            const id = request._id;
            const selected = resources[id] || {};
            const quoteAmount = amounts[id] ?? request.quotedAmount ?? "";
            const guideOptions = guides.filter((item) => item?.availability === "available" || item?.status === "active");
            const driverOptions = drivers.filter((item) => item?.availability === "available" || item?.status === "active");
            const agentOptions = agents.filter((item) => item?.status === "active" && item?.isApproved !== false);

            return (
              <article key={id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-sky-50 px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-indigo-700">Custom request</span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ${status.className}`}>
                          <StatusIcon className="h-3.5 w-3.5" /> {status.label}
                        </span>
                      </div>
                      <h2 className="mt-2 flex items-center gap-2 text-lg font-extrabold text-slate-900 sm:text-xl">
                        <MapPin className="h-5 w-5 shrink-0 text-indigo-600" />
                        <span className="truncate">{request.destination || "Custom destination"}</span>
                      </h2>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5 font-semibold"><UserRound className="h-3.5 w-3.5" /> {customer?.name || "Guest customer"}</span>
                        <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {customer?.email || "No email"}</span>
                        <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {request.durationDays || 0} days</span>
                        <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {request.people || 0} people</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-white px-4 py-3 text-left shadow-sm ring-1 ring-slate-200 lg:min-w-[150px] lg:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quoted value</p>
                      <p className="mt-1 text-lg font-extrabold text-indigo-700">{KES.format(Number(request.quotedAmount || 0))}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_1.2fr]">
                  <div className="space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                      <div className="mb-1.5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                        <MessageSquare className="h-3.5 w-3.5 text-sky-600" /> Customer requirements
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{request.requirements || "No additional requirements provided."}</p>
                    </div>
                    {request.adminNotes && (
                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5">
                        <p className="text-[11px] font-extrabold uppercase tracking-wide text-indigo-600">Latest admin message</p>
                        <p className="mt-1 text-sm leading-5 text-indigo-900">{request.adminNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">Operational assignment</p>
                        <p className="text-xs text-slate-500">Allocate available resources for this request.</p>
                      </div>
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Resources</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Guide</span>
                        <select value={selected.guide || ""} onChange={(e) => updateResource(id, "guide", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                          <option value="">Unassigned</option>
                          {guideOptions.map((item) => <option key={item._id} value={item._id}>{item.name || item.user?.name || item.email}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Driver</span>
                        <select value={selected.driver || ""} onChange={(e) => updateResource(id, "driver", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                          <option value="">Unassigned</option>
                          {driverOptions.map((item) => <option key={item._id} value={item._id}>{item.name || item.user?.name || item.email}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">Agent</span>
                        <select value={selected.agent || ""} onChange={(e) => updateResource(id, "agent", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                          <option value="">Unassigned</option>
                          {agentOptions.map((item) => <option key={item._id} value={item._id}>{item.user?.name || item.companyName || item.email}</option>)}
                        </select>
                      </label>
                    </div>
                    <button
                      onClick={() => assignMutation.mutate({ id, ...selected })}
                      disabled={assignMutation.isPending}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-xs font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {assignMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {assignMutation.isPending ? "Saving assignment…" : "Save resource assignment"}
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50/80 p-4 sm:p-5">
                  <div className="grid gap-3 lg:grid-cols-[180px_1fr_auto] lg:items-end">
                    <label>
                      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Quote amount (KES)</span>
                      <div className="relative">
                        <DollarSign className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          min="0"
                          value={quoteAmount}
                          onChange={(e) => setAmounts((current) => ({ ...current, [id]: e.target.value }))}
                          placeholder="0"
                          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-8 pr-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>
                    </label>
                    <label>
                      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Message to customer</span>
                      <input
                        value={notes[id] ?? request.adminNotes ?? ""}
                        onChange={(e) => setNotes((current) => ({ ...current, [id]: e.target.value }))}
                        placeholder="Add a professional message with the quote…"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>
                    <div className="flex gap-2 lg:justify-end">
                      <button
                        onClick={() => quoteMutation.mutate({ id, status: "quoted", quotedAmount: Number(quoteAmount || 0), adminNotes: notes[id] || "" })}
                        disabled={quoteMutation.isPending}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 lg:flex-none"
                      >
                        {quoteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Send quote
                      </button>
                      <button
                        onClick={() => quoteMutation.mutate({ id, status: "rejected", quotedAmount: 0, adminNotes: notes[id] || "Request declined" })}
                        disabled={quoteMutation.isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-xs font-extrabold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <XCircle className="h-4 w-4" /> Decline
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {!filteredRequests.length && (
            <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-200">
              <Search className="mx-auto h-9 w-9 text-slate-300" />
              <h3 className="mt-3 text-base font-extrabold text-slate-800">No matching requests</h3>
              <p className="mt-1 text-sm text-slate-500">Try a different search term or status filter.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
