import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, CircleDollarSign, Clock3, WalletCards } from "lucide-react";
import { toast } from "react-toastify";
import { approveCommission, getCommissions, payCommission } from "../../api/commissionApi";

export default function TourManagerCommissions() {
  const qc = useQueryClient();
  const [payment, setPayment] = useState(null);

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["commissions"],
    queryFn: getCommissions,
    staleTime: 15_000,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["commissions"] });

  const approve = useMutation({
    mutationFn: approveCommission,
    onSuccess: () => {
      refresh();
      toast.success("Commission approved.");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Unable to approve commission."),
  });

  const pay = useMutation({
    mutationFn: ({ id, payload }) => payCommission(id, payload),
    onSuccess: () => {
      setPayment(null);
      refresh();
      qc.invalidateQueries({ queryKey: ["agent-commission"] });
      qc.invalidateQueries({ queryKey: ["agent-dashboard"] });
      toast.success("Commission payout recorded successfully.");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Unable to record commission payout."),
  });

  const stats = useMemo(() => ({
    total: data.reduce((sum, c) => sum + Number(c.amount || 0), 0),
    paid: data.filter((c) => c.status === "paid").reduce((sum, c) => sum + Number(c.amount || 0), 0),
    outstanding: data.filter((c) => !["paid", "cancelled", "rejected"].includes(c.status)).reduce((sum, c) => sum + Number(c.amount || 0), 0),
  }), [data]);

  const submitPayment = (event) => {
    event.preventDefault();
    if (!payment) return;
    const form = new FormData(event.currentTarget);
    const paymentMethod = String(form.get("paymentMethod") || "MPESA");
    const paymentReference = String(form.get("paymentReference") || "").trim();
    const notes = String(form.get("notes") || "").trim();
    if (!paymentReference) {
      toast.error("Enter the payment reference or transaction ID before confirming the payout.");
      return;
    }
    pay.mutate({
      id: payment._id,
      payload: { paymentMethod, paymentReference, transactionId: paymentReference, notes },
    });
  };

  if (isLoading) return <section className="p-6"><div className="rounded-xl bg-white p-8 shadow">Loading commissions...</div></section>;
  if (isError) return <section className="p-6"><div className="rounded-xl bg-white p-8 shadow text-red-600">Failed to load commissions. Please refresh and try again.</div></section>;

  return (
    <section className="min-h-full bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Finance</p>
          <h1 className="text-3xl font-bold text-slate-900">Agent Commission Payouts</h1>
          <p className="mt-1 text-slate-500">Approve commissions and record payments made to booking agents.</p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {[
            ["Total accrued", stats.total, WalletCards],
            ["Paid", stats.paid, CheckCircle],
            ["Outstanding", stats.outstanding, Clock3],
          ].map(([label, value, Icon]) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><Icon className="text-emerald-700" size={20} /></div>
              <p className="mt-2 text-2xl font-bold text-slate-900">KES {value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="bg-slate-50"><tr>
                <th className="p-4 text-left">Agent</th><th className="p-4 text-left">Booking</th><th className="p-4 text-left">Commission</th><th className="p-4 text-left">Rate</th><th className="p-4 text-left">Status</th><th className="p-4 text-right">Actions</th>
              </tr></thead>
              <tbody>
                {data.map((commission) => {
                  const agentName = commission.agent?.user?.name || commission.agent?.companyName || "Agent";
                  return (
                    <tr key={commission._id} className="border-t">
                      <td className="p-4"><div className="font-semibold text-slate-900">{agentName}</div><div className="text-sm text-slate-500">{commission.agent?.user?.email || commission.agent?.email || ""}</div></td>
                      <td className="p-4">{commission.booking?.bookingNumber || "-"}</td>
                      <td className="p-4 font-semibold">KES {Number(commission.amount || 0).toLocaleString()}</td>
                      <td className="p-4">{commission.rate || 0}%</td>
                      <td className="p-4 capitalize">{commission.status || "pending"}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {commission.status === "pending" && (
                            <button type="button" onClick={() => approve.mutate(commission._id)} disabled={approve.isPending} className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
                              <CheckCircle size={15} /> Approve
                            </button>
                          )}
                          {["pending", "approved", "processing"].includes(commission.status) && (
                            <button type="button" onClick={() => setPayment(commission)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white">
                              <CircleDollarSign size={15} /> Pay commission
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!data.length && <tr><td colSpan="6" className="p-10 text-center text-slate-500">No commissions found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {payment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="commission-payment-title">
          <form onSubmit={submitPayment} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5">
              <h2 id="commission-payment-title" className="text-xl font-bold text-slate-900">Record commission payment</h2>
              <p className="mt-1 text-sm text-slate-500">{payment.agent?.user?.name || payment.agent?.companyName || "Agent"} · KES {Number(payment.amount || 0).toLocaleString()}</p>
            </div>
            <div className="space-y-4">
              <label className="block"><span className="mb-1 block text-sm font-semibold text-slate-700">Payment method</span><select name="paymentMethod" defaultValue="MPESA" className="w-full rounded-lg border border-slate-300 px-3 py-2"><option value="MPESA">M-Pesa</option><option value="BANK_TRANSFER">Bank transfer</option><option value="CASH">Cash</option><option value="CHEQUE">Cheque</option></select></label>
              <label className="block"><span className="mb-1 block text-sm font-semibold text-slate-700">Payment reference / transaction ID</span><input name="paymentReference" required placeholder="e.g. QWE1234567" className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
              <label className="block"><span className="mb-1 block text-sm font-semibold text-slate-700">Finance notes (optional)</span><textarea name="notes" rows="3" placeholder="Optional payout notes" className="w-full rounded-lg border border-slate-300 px-3 py-2" /></label>
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setPayment(null)} disabled={pay.isPending} className="rounded-lg border px-4 py-2 font-semibold">Cancel</button><button type="submit" disabled={pay.isPending} className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-60">{pay.isPending ? "Recording..." : "Confirm payment"}</button></div>
          </form>
        </div>
      )}
    </section>
  );
}
