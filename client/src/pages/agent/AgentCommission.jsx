import { useSettings } from "../../context/SettingsContext";
import { useQuery } from "@tanstack/react-query";
import { fetchAgentCommission } from "../../api/agentApi";

export default function AgentCommission(
) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["agent-commission"],
    queryFn: fetchAgentCommission,
  });
  const rows = data?.data || data || [];
  return (
    <section className="p-6 md:p-8">
      <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Finance</p><h1 className="text-3xl font-bold">My Commissions</h1><p className="text-slate-500">Track every commission generated from your bookings.</p></div>
      {isLoading ? <p>Loading commissions...</p> : isError ? <p className="text-red-600">Unable to load commissions.</p> : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"><div className="overflow-x-auto"><table className="w-full">
          <thead className="bg-slate-50"><tr><th className="p-4 text-left">Booking</th><th className="p-4 text-left">Amount</th><th className="p-4 text-left">Rate</th><th className="p-4 text-left">Status</th></tr></thead>
          <tbody>{rows.map((c) => <tr key={c._id} className="border-t"><td className="p-4">{c.booking?.bookingNumber || "-"}</td><td className="p-4 font-semibold">KES {Number(c.amount || 0).toLocaleString()}</td><td className="p-4">{c.rate || 0}%</td><td className="p-4 capitalize">{c.status || "pending"}</td></tr>)}{!rows.length && <tr><td colSpan="4" className="p-8 text-center text-slate-500">No commissions yet.</td></tr>}</tbody>
        </table></div></div>
      )}
    </section>
  );
}
