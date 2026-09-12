import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Eye,
  RefreshCw,
  UserRound,
  Phone,
  Mail,
  CalendarDays,
  WalletCards,
  CheckCircle2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { getAdminCustomers } from "../../api/customerApi";

const money = (value) =>
  `KES ${Number(value || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const titleCase = (value) =>
  String(value || "individual")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const displayValue = (value) => (value ? String(value) : "—");

export default function Customers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["admin-customers", debouncedSearch, page],
    queryFn: () => getAdminCustomers({ search: debouncedSearch, page, limit: 20 }),
    placeholderData: (previous) => previous,
    staleTime: 15_000,
  });

  const customers = Array.isArray(data?.data) ? data.data : [];
  const total = Number(data?.pagination?.total || 0);
  const pages = Math.max(1, Number(data?.pagination?.pages || 1));

  const metrics = useMemo(() => {
    const active = customers.filter((customer) => customer.isActive !== false).length;
    const confirmedBookings = customers.reduce(
      (sum, customer) => sum + Number(customer.confirmedBookings || 0),
      0
    );
    const confirmedSpend = customers.reduce(
      (sum, customer) => sum + Number(customer.totalSpent || 0),
      0
    );
    return { active, confirmedBookings, confirmedSpend };
  }, [customers]);

  const resetSearch = () => {
    setSearch("");
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl animate-pulse space-y-5">
          <div className="h-32 rounded-3xl bg-slate-200" />
          <div className="h-20 rounded-2xl bg-white ring-1 ring-slate-200" />
          <div className="h-96 rounded-2xl bg-white ring-1 ring-slate-200" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <X size={22} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Unable to load customers</h2>
          <p className="mt-2 text-sm text-slate-500">
            {error?.response?.data?.message || error?.message || "Please try again."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-green-700 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-100 ring-1 ring-white/15">
                <Users size={14} /> Customer relationship management
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Customers</h1>
              <p className="mt-2 max-w-2xl text-sm text-emerald-50/85 sm:text-base">
                Manage genuine customer accounts and review booking activity, confirmed spend and contact details.
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={Users} label="Customer accounts" value={total.toLocaleString("en-KE")} />
          <Metric icon={CheckCircle2} label="Active on this page" value={metrics.active.toLocaleString("en-KE")} />
          <Metric icon={CalendarDays} label="Confirmed bookings" value={metrics.confirmedBookings.toLocaleString("en-KE")} />
          <Metric icon={WalletCards} label="Confirmed spend" value={money(metrics.confirmedSpend)} compact />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
              <input
                type="search"
                autoComplete="off"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search customer name, email or phone..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
              {search && (
                <button
                  type="button"
                  onClick={resetSearch}
                  aria-label="Clear customer search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="text-sm text-slate-500" aria-live="polite">
              {isFetching ? "Updating results…" : `${total.toLocaleString("en-KE")} customer${total === 1 ? "" : "s"}`}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <Header>Customer</Header>
                  <Header>Phone</Header>
                  <Header>Type</Header>
                  <Header>Bookings</Header>
                  <Header>Confirmed spend</Header>
                  <Header align="right">Action</Header>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id} className="border-b border-slate-100 transition last:border-0 hover:bg-emerald-50/40">
                    <td className="p-4">
                      <div className="flex min-w-[250px] items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-700 ring-1 ring-emerald-100">
                          {String(customer.name || "C").trim().charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-bold text-slate-900">{displayValue(customer.name)}</div>
                          <div className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-500">
                            <Mail size={13} /> {displayValue(customer.email)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-700">
                      <span className="inline-flex items-center gap-2"><Phone size={15} className="text-emerald-600" />{displayValue(customer.phone)}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                        {titleCase(customer.customerType)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{Number(customer.totalBookings || 0).toLocaleString("en-KE")}</div>
                      <div className="text-xs text-slate-500">{Number(customer.confirmedBookings || 0).toLocaleString("en-KE")} confirmed</div>
                    </td>
                    <td className="p-4 font-black text-emerald-700">{money(customer.totalSpent)}</td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/admin/customers/${customer._id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                      >
                        <Eye size={15} /> View profile
                      </Link>
                    </td>
                  </tr>
                ))}
                {!customers.length && (
                  <tr>
                    <td colSpan="6" className="p-14 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <UserRound size={25} />
                      </div>
                      <h3 className="mt-4 font-bold text-slate-900">No customers found</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {search ? "Try a different name, email or phone search." : "Customer accounts will appear here when available."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-500">
              Page <span className="font-bold text-slate-800">{page}</span> of <span className="font-bold text-slate-800">{pages}</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} /> Previous
              </button>
              <button
                type="button"
                disabled={page >= pages || isFetching}
                onClick={() => setPage((current) => Math.min(pages, current + 1))}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, compact = false }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className={`mt-2 font-black tracking-tight text-slate-900 ${compact ? "text-lg" : "text-2xl"}`}>{value}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function Header({ children, align = "left" }) {
  return (
    <th className={`whitespace-nowrap p-4 text-${align} text-xs font-black uppercase tracking-wider text-slate-500`}>
      {children}
    </th>
  );
}
