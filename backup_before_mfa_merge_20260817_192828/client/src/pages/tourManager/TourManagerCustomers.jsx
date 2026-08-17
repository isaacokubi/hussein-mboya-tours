import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Users,
  UserCheck,
  UserPlus,
  Mail,
  Phone,
  MoreHorizontal,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  UserRound,
  CalendarDays,
} from "lucide-react";

import { getCustomers } from "../../api/tourManagerApi";

export default function TourManagerCustomers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["manager-customers"],
    queryFn: getCustomers,
  });

  const customers = useMemo(() => {
    const result =
      data?.customers ||
      data?.data ||
      data ||
      [];

    return Array.isArray(result) ? result : [];
  }, [data]);

  const getCustomerStatus = (customer) => {
    const status = String(
      customer?.status ||
        customer?.accountStatus ||
        customer?.customerStatus ||
        "active"
    ).toLowerCase();

    return status === "inactive" ||
      status === "blocked" ||
      status === "suspended"
      ? "inactive"
      : "active";
  };

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const name = String(customer?.name || "").toLowerCase();
      const email = String(customer?.email || "").toLowerCase();
      const phone = String(customer?.phone || "").toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        phone.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        getCustomerStatus(customer) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => getCustomerStatus(customer) === "active"
  ).length;

  const inactiveCustomers = customers.filter(
    (customer) => getCustomerStatus(customer) === "inactive"
  ).length;

  const getBookingsCount = (customer) => {
    return (
      customer?.bookingsCount ??
      customer?.totalBookings ??
      customer?.bookings?.length ??
      0
    );
  };

  const getInitials = (name = "") => {
    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!parts.length) return "CU";

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const formatName = (name) => {
    if (!name) return "Unnamed Customer";

    return String(name)
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatPhone = (phone) => {
    if (!phone) return "No phone number";
    return phone;
  };

  if (isLoading) {
    return (
      <section className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="animate-pulse">
            <div className="h-8 w-64 rounded-lg bg-slate-200" />
            <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
              />
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="h-16 animate-pulse bg-slate-100" />

            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse border-t border-slate-100 bg-white"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <Users className="h-7 w-7 text-red-600" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Unable to load customers
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              {error?.response?.data?.message ||
                error?.message ||
                "Something went wrong while loading the customer list."}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HEADER */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <Users className="h-4 w-4" />
              Customer Management
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Customers
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Manage and review customers across your tours, bookings and
              travel experiences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isFetching ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* STAT CARDS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Customers
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalCustomers}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Registered customers
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Customers
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {activeCustomers}
                </p>

                <p className="mt-1 text-xs text-emerald-600">
                  Currently active
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Inactive Customers
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {inactiveCustomers}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Inactive or suspended
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <UserPlus className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOMER LIST */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* TOOLBAR */}

          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Customer Directory
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredCustomers.length} of {totalCustomers} customers
                  displayed
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {/* SEARCH */}

                <div className="relative min-w-0 sm:w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, email or phone..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                {/* STATUS FILTER */}

                <div className="relative">
                  <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                    className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="all">All Customers</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP TABLE */}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Bookings
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => {
                  const name = formatName(customer?.name);
                  const status = getCustomerStatus(customer);
                  const bookings = getBookingsCount(customer);

                  return (
                    <tr
                      key={
                        customer?._id ||
                        customer?.id ||
                        `${customer?.email}-${name}`
                      }
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                            {getInitials(customer?.name)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Customer
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="space-y-1.5">
                          {customer?.email ? (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="h-4 w-4 text-slate-400" />
                              <span>{customer.email}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              No email
                            </span>
                          )}

                          {customer?.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Phone className="h-4 w-4 text-slate-400" />
                              <span>{formatPhone(customer.phone)}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                          <CalendarDays className="h-4 w-4 text-slate-500" />
                          {bookings}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                            status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              status === "active"
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />

                          {status === "active"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                          aria-label={`Actions for ${name}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}

          <div className="divide-y divide-slate-100 md:hidden">
            {filteredCustomers.map((customer) => {
              const name = formatName(customer?.name);
              const status = getCustomerStatus(customer);
              const bookings = getBookingsCount(customer);

              return (
                <div
                  key={
                    customer?._id ||
                    customer?.id ||
                    `${customer?.email}-${name}`
                  }
                  className="p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                        {getInitials(customer?.name)}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-slate-900">
                          {name}
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Customer
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500"
                      aria-label={`Actions for ${name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-5 space-y-3">
                    {customer?.email && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}

                    {customer?.phone && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>{formatPhone(customer.phone)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      {bookings} booking{bookings === 1 ? "" : "s"}
                    </div>

                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                        status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          status === "active"
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                        }`}
                      />

                      {status === "active"
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* EMPTY STATE */}

          {!filteredCustomers.length && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <UserRound className="h-7 w-7 text-slate-400" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No customers found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {search
                  ? `No customers match "${search}". Try a different search term.`
                  : "There are currently no customers matching the selected filter."}
              </p>

              {(search || statusFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
