import { useSettings } from "../../../context/SettingsContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WalletCards, CheckCircle, Clock3, CircleDollarSign } from "lucide-react";
import { toast } from "react-toastify";
import { getCommissions, approveCommission, payCommission } from "../../../api/commissionApi";

export default function Commissions(
) {
  const qc = useQueryClient();
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["commissions"],
    queryFn: getCommissions,
  });

  const approve = useMutation({
    mutationFn: approveCommission,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commissions"] });
      toast.success("Commission approved.");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Unable to approve commission."),
  });

  const pay = useMutation({
    mutationFn: ({ id, payload }) => payCommission(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commissions"] });
      toast.success("Agent funds confirmed and recorded as paid.");
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Unable to confirm commission payment."),
  });

  if (isLoading) return <div className="p-6">Loading commissions...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load commissions.</div>;

  const total = data.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const paid = data.filter((c) => c.status === "paid").reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const pending = data.filter((c) => !["paid", "cancelled", "rejected"].includes(c.status)).reduce((sum, c) => sum + Number(c.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Finance</p>
          <h1 className="text-3xl font-bold text-slate-900">Agent Commissions</h1>
          <p className="text-slate-500">Approve commissions and confirm the exact funds paid to each agent.</p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {[
            ["Total accrued", total, WalletCards],
            ["Paid", paid, CheckCircle],
            ["Outstanding", pending, Clock3],
          ].map(([label, value, Icon]) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex justify-between"><span className="text-sm text-slate-500">{label}</span><Icon className="text-emerald-700" /></div>
              <p className="mt-2 text-3xl font-bold">KES {value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50"><tr>
                <th className="p-4 text-left">Agent</th><th className="p-4 text-left">Booking</th><th className="p-4 text-left">Amount</th><th className="p-4 text-left">Rate</th><th className="p-4 text-left">Status</th><th className="p-4 text-right">Control</th>
              </tr></thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c._id} className="border-t">
                    <td className="p-4"><div className="font-semibold">{c.agent?.user?.name || c.agent?.companyName || "-"}</div><div className="text-sm text-slate-500">{c.agent?.user?.email || c.agent?.email || ""}</div></td>
                    <td className="p-4">{c.booking?.bookingNumber || "-"}</td>
                    <td className="p-4 font-semibold">KES {Number(c.amount || 0).toLocaleString()}</td>
                    <td className="p-4">{c.rate || 0}%</td>
                    <td className="p-4 capitalize">{c.status || "pending"}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {c.status === "pending" && (
                          <button onClick={() => approve.mutate(c._id)} disabled={approve.isPending} className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white">
                            <CheckCircle size={15} /> Approve
                          </button>
                        )}
                        {["pending", "approved", "processing"].includes(c.status) && (
                          <button
                            onClick={() => {
                              const reference = window.prompt("Enter payment reference / transaction ID:", "");
                              if (reference === null) return;
                              pay.mutate({ id: c._id, payload: { paymentMethod: "MPESA", paymentReference: reference, transactionId: reference } });
                            }}
                            disabled={pay.isPending}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
                          >
                            <CircleDollarSign size={15} /> Confirm funds
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!data.length && <tr><td colSpan="6" className="p-8 text-center text-slate-500">No commissions found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
