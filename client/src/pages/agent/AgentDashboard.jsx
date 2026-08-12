import { Link } from "react-router-dom";
import {
  Map,
  CalendarDays,
  Users,
  CheckCircle,
  Wallet,
  FileText,
  UserRoundCheck,
} from "lucide-react";

import { useAgentDashboard } from "../../hooks/useAgentDashboard";
import DashboardCard from "../../components/agent/DashboardCard";
import AssignmentNotifications from "../../components/notifications/AssignmentNotifications";

export default function AgentDashboard() {
  const {
    stats,
    isLoading,
    error,
    bookings = [],
  } = useAgentDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 sm:text-xl">
            Loading Coherent Tours Agent Portal...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:p-6 sm:text-base">
          {error?.response?.data?.message ||
            error?.message ||
            "Unable to load agent dashboard. Please try again later."}
        </div>
      </div>
    );
  }

  const safeStats = stats || {};

  const formatCurrency = (value = 0) =>
    `KES ${Number(value || 0).toLocaleString("en-KE")}`;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50">
      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 md:p-8">

        {/* Approval Notice */}
        {!safeStats.isApproved && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 sm:mb-6 sm:p-5">
            <strong>Agent account pending approval.</strong>
            <span className="mt-1 block sm:inline sm:ml-1">
              Your dashboard is available, but operational agent features
              will unlock after an administrator approves your account.
            </span>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold leading-tight text-gray-800 sm:text-3xl md:text-4xl">
            Welcome Back, Agent
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 sm:text-base">
            Manage Coherent Tours bookings, guests, safari activities and
            commissions.
          </p>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <AssignmentNotifications />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">

          <DashboardCard
            title="Assigned Tours"
            value={safeStats.assignedTours || 0}
            icon={<Map size={24} />}
            description="Active safari assignments"
          />

          <DashboardCard
            title="Upcoming Departures"
            value={safeStats.upcomingTours || 0}
            icon={<CalendarDays size={24} />}
            description="Upcoming tour bookings"
          />

          <DashboardCard
            title="Total Guests"
            value={safeStats.totalGuests || 0}
            icon={<Users size={24} />}
            description="Guests handled"
          />

          <DashboardCard
            title="Completed Tours"
            value={safeStats.completedTours || 0}
            icon={<CheckCircle size={24} />}
            description="Successfully completed safaris"
          />

        </div>

        {/* Financial Statistics */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-5">

          <DashboardCard
            title="Commission Earned"
            value={formatCurrency(safeStats.totalCommission)}
            icon={<Wallet size={24} />}
            description="Your total safari commissions"
            trend={
              safeStats.commissionGrowth
                ? `${safeStats.commissionGrowth}% this month`
                : null
            }
          />

          <DashboardCard
            title="Wallet Balance"
            value={formatCurrency(safeStats.walletBalance)}
            icon={<Wallet size={24} />}
            description="Available withdrawal balance"
          />

        </div>

        {/* Quick Actions */}
        <section className="mt-8 sm:mt-10">
          <h2 className="mb-4 text-xl font-bold text-gray-800 sm:mb-5 sm:text-2xl">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">

            <ActionCard
              title="Manage Bookings"
              description="View customer reservations, payments and travel schedules."
              icon={<FileText size={28} />}
              color="green"
              href="/agent/bookings"
            />

            <ActionCard
              title="Manage Guests"
              description="View guest profiles, requirements and travel information."
              icon={<UserRoundCheck size={28} />}
              color="blue"
              href="/agent/customers"
            />

            <ActionCard
              title="Submit Tour Report"
              description="Complete safari reports after tour completion."
              icon={<FileText size={28} />}
              color="orange"
              href="/agent/quotes"
            />

          </div>
        </section>

        {/* Recent Activity */}
        <section className="mt-8 rounded-2xl border bg-white p-4 shadow-sm sm:mt-10 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
              Recent Activity
            </h2>

            {bookings.length > 0 && (
              <Link
                to="/agent/bookings"
                className="shrink-0 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                View all
              </Link>
            )}
          </div>

          {bookings?.length ? (
            <div className="mt-4 space-y-3">
              {bookings.map((booking) => (
                <Link
                  key={booking._id}
                  to="/agent/bookings"
                  className="block rounded-xl border border-gray-100 p-4 transition hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <span className="break-words font-semibold text-gray-800">
                      {booking.tour?.title || "Tour booking"}
                    </span>

                    <span className="w-fit rounded-full bg-gray-100 px-2.5 py-1 text-xs capitalize text-gray-600">
                      {booking.status || "pending"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    KES{" "}
                    {Number(
                      booking.totalAmount || 0
                    ).toLocaleString("en-KE")}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-500">
                No recent bookings yet.
              </p>

              <Link
                to="/agent/bookings"
                className="mt-3 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Manage bookings
              </Link>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
  color,
  href = "#",
}) {
  const colors = {
    green: "bg-green-700 hover:bg-green-800",
    blue: "bg-blue-700 hover:bg-blue-800",
    orange: "bg-orange-600 hover:bg-orange-700",
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm sm:p-6">

      <div className="mb-4 text-gray-700">
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-gray-800">
        {title}
      </h3>

      <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">
        {description}
      </p>

      <Link
        to={href}
        className={`mt-5 inline-flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition sm:w-fit ${colors[color] || colors.green}`}
      >
        Open
      </Link>

    </div>
  );
}
