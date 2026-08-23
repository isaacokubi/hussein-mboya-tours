import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, Users } from "lucide-react";
import { toast } from "react-toastify";
import { getDashboard } from "../../../api/adminApi";
import { approveAgent, getAgents } from "../../../api/adminAgentApi";
import DashboardHeader from "./DashboardHeader";
import StatsGrid from "./StatsGrid";
import PopularTours from "./PopularTours";
import RecentBookings from "./RecentBookings";
import PaymentAnalytics from "./PaymentAnalytics";
import QuickActions from "./QuickActions";
import SystemHealth from "./SystemHealth";

const unwrap = (payload) => payload?.data ?? payload ?? {};
const asArray = (value) => (Array.isArray(value) ? value : []);

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getDashboard,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const {
    data: agents = [],
    isLoading: agentsLoading,
    isError: agentsError,
  } = useQuery({
    queryKey: ["agents"],
    queryFn: getAgents,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const approve = useMutation({
    mutationFn: approveAgent,
    onSuccess: () => {
      toast.success("Agent approved successfully.");
      void queryClient.invalidateQueries({ queryKey: ["agents"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (mutationError) => {
      toast.error(
        mutationError?.response?.data?.message || "Unable to approve agent."
      );
    },
  });

  useEffect(() => {
    const refresh = () => {
      void refetch();
      void queryClient.invalidateQueries({ queryKey: ["agents"] });
    };
    window.addEventListener("dashboard:data-changed", refresh);
    return () => window.removeEventListener("dashboard:data-changed", refresh);
  }, [refetch, queryClient]);

  const dashboard = useMemo(() => unwrap(data), [data]);
  const summary = dashboard.summary ?? {};
  const paymentStats = dashboard.paymentStats ?? {};
  const recentBookings = asArray(dashboard.recentBookings);
  const popularTours = asArray(dashboard.popularTours);
  const monthlyRevenue = asArray(dashboard.monthlyRevenue);
  const bookingStatus = asArray(dashboard.status);
  const pendingAgents = useMemo(
    () => agents.filter((agent) => !agent.isApproved),
    [agents]
  );

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 p-8 text-gray-600">Loading admin dashboard...</div>;
  }

  if (isError) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.message || "Dashboard request failed.";
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl rounded-xl border border-red-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-red-700">Unable to load Admin Dashboard</h2>
          <p className="mt-2 text-gray-600">
            {status === 401 ? "Your session has expired. Please sign in again." : status === 403 ? "Your account is not authorized to use the Admin Dashboard." : message}
          </p>
          <button type="button" onClick={() => void refetch()} disabled={isFetching} className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-white disabled:opacity-60">
            {isFetching ? "Retrying..." : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 bg-gray-50 p-6 lg:p-8">
      <DashboardHeader />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Business Overview</h2>
          <p className="text-sm text-slate-500">Live tenant-scoped operational, booking and payment metrics.</p>
        </div>
        <button type="button" onClick={() => void refetch()} disabled={isFetching} className="rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-sm disabled:opacity-60">
          {isFetching ? "Refreshing..." : "Refresh Dashboard"}
        </button>
      </div>

      <StatsGrid stats={dashboard} summary={summary} />

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-amber-200">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-amber-600" />
              <h2 className="text-xl font-bold text-slate-900">Agent Approvals</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Review and approve agent accounts before they begin agent operations.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
            <Users className="h-4 w-4" />
            {agentsLoading ? "Loading..." : `${pendingAgents.length} pending`}
          </div>
        </div>

        {agentsError ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Unable to load agent approval requests. Use the Agents management page to retry.
          </div>
        ) : agentsLoading ? (
          <div className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Loading agent approval requests...</div>
        ) : pendingAgents.length === 0 ? (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-2 font-semibold text-emerald-800">
              <CheckCircle2 className="h-5 w-5" />
              All agent accounts are approved
            </div>
            <p className="mt-1 text-sm text-emerald-700">There are no agent approval requests waiting for admin action.</p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingAgents.slice(0, 10).map((agent) => (
                  <tr key={agent._id} className="border-t border-slate-100">
                    <td className="px-4 py-4 font-semibold text-slate-900">{agent.user?.name || agent.name || "Unnamed agent"}</td>
                    <td className="px-4 py-4 text-slate-600">{agent.companyName || "—"}</td>
                    <td className="px-4 py-4 text-slate-600">{agent.user?.email || agent.email || "—"}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        Pending approval
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => approve.mutate(agent._id)}
                        disabled={approve.isPending}
                        className="rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {approve.isPending && approve.variables === agent._id ? "Approving..." : "Approve Agent"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pendingAgents.length > 10 && (
              <div className="border-t bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Showing the first 10 pending requests. Open Agent Management for the complete queue.
              </div>
            )}
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2"><RecentBookings bookings={recentBookings} /></div>
        <PaymentAnalytics payments={paymentStats} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PopularTours tours={popularTours} />
        <SystemHealth />
      </div>

      {(monthlyRevenue.length > 0 || bookingStatus.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-5 text-xl font-bold">Revenue Trend</h2>
            {monthlyRevenue.length === 0 ? <p className="text-gray-500">No completed payment revenue yet.</p> : (
              <div className="space-y-3">
                {monthlyRevenue.slice(-6).map((item) => (
                  <div key={item.month} className="flex items-center justify-between border-b pb-2">
                    <span className="text-gray-600">{item.month}</span>
                    <strong>Ksh {Number(item.amount || 0).toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-5 text-xl font-bold">Booking Status</h2>
            {bookingStatus.length === 0 ? <p className="text-gray-500">No bookings available.</p> : (
              <div className="space-y-3">
                {bookingStatus.map((item) => (
                  <div key={item._id || "unknown"} className="flex items-center justify-between border-b pb-2">
                    <span className="capitalize text-gray-600">{String(item._id || "unknown").replace(/[_-]/g, " ")}</span>
                    <strong>{Number(item.count || 0).toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <QuickActions />
    </div>
  );
}
