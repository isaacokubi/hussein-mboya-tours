import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, CircleDollarSign, Clock3, WalletCards, Smartphone } from "lucide-react";
import { toast } from "react-toastify";
import { approveCommission, getCommissions, payCommission, getAgentWithdrawals, approveAgentWithdrawal, rejectAgentWithdrawal, completeAgentWithdrawal } from "../../api/commissionApi";

const money = (value) => `KES ${Number(value || 0).toLocaleString()}`;

export default function TourManagerCommissions() {
  const qc = useQueryClient();
  const [payment, setPayment] = useState(null);
  const [withdrawal, setWithdrawal] = useState(null);

  const { data = [], isLoading, isError } = useQuery({ queryKey: ["commissions"], queryFn: getCommissions, staleTime: 15_000 });
  const withdrawalsQuery = useQuery({ queryKey: ["agent-withdrawals"], queryFn: getAgentWithdrawals, staleTime: 10_000, refetchInterval: 15_000 });
  const refresh = () => qc.invalidateQueries({ queryKey: ["commissions"] });
  const refreshWithdrawals = () => {
    qc.invalidateQueries({ queryKey: ["agent-withdrawals"] });
    qc.invalidateQueries({ queryKey: ["agent-dashboard"] });
    qc.invalidateQueries({ queryKey: ["agent-commission"] });
  };

  const approve = useMutation({ mutationFn: approveCommission, onSuccess: () => { refresh(); toast.success("Commission approved."); }, onError: (error) => toast.error(error?.response?.data?.message || "Unable to approve commission.") });
  const pay = useMutation({
    mutationFn: ({ id, payload }) => payCommission(id, payload),
    onSuccess: () => { setPayment(null); refresh(); qc.invalidateQueries({ queryKey: ["agent-commission"] }); qc.invalidateQueries({ queryKey: ["agent-dashboard"] }); toast.success("Commission payout recorded successfully."); },
    onError: (error) => toast.error(error?.response?.data?.message || "Unable to record commission payout."),
  });
  const approveWithdrawal = useMutation({ mutationFn: approveAgentWithdrawal, onSuccess: () => { refreshWithdrawals(); toast.success("Withdrawal approved. It is now ready to send."); }, onError: (error) => toast.error(error?.response?.data?.message || "Unable to approve withdrawal.") });
  const rejectWithdrawal = useMutation({ mutationFn: ({ id, reason }) => rejectAgentWithdrawal(id, reason), onSuccess: () => { refreshWithdrawals(); toast.success("Withdrawal rejected."); }, onError: (error) => toast.error(error?.response?.data?.message || "Unable to reject withdrawal.") });
  const completeWithdrawal = useMutation({ mutationFn: ({ id, reference }) => completeAgentWithdrawal(id, reference), onSuccess: (result) => { setWithdrawal(null); refreshWithdrawals(); toast.success(result?.message || "Withdrawal submitted."); }, onError: (error) => toast.error(error?.response?.data?.message || "Unable to process withdrawal.") });

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
    if (!paymentReference) return toast.error("Enter the payment reference or transaction ID before confirming the payout.");
    pay.mutate({ id: payment._id, payload: { paymentMethod, paymentReference, transactionId: paymentReference, notes } });
  };

  const submitWithdrawal = (event) => {
    event.preventDefault();
    if (!withdrawal) return;
    if (withdrawal.method === "MPESA") {
      completeWithdrawal.mutate({ id: withdrawal._id, reference: "" });
      return;
    }
    const reference = String(new FormData(event.currentTarget).get("reference") || "").trim();
    if (!reference) return toast.error("Enter the actual bank transaction reference.");
    completeWithdrawal.mutate({ id: withdrawal._id, reference });
  };

  if (isLoading) return <section className="p-6"><div className="rounded-xl bg-white p-8 shadow">Loading commissions...</div></section>;
  if (isError) return <section className="p-6"><div className="rounded-xl bg-white p-8 shadow text-red-600">Failed to load commissions. Please refresh and try again.</div></section>;

  return (
    <section className="min-h-full bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Finance</p><h1 className="text-3xl font-bold text-slate-900">Agent Commission & Withdrawals</h1><p className="mt-1 text-slate-500">Approve commissions, pay them into the agent wallet, then send approved withdrawals directly to M-Pesa.</p></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3">{[["Total accrued", stats.total, WalletCards],["Paid to agent wallet", stats.paid, CheckCircle],["Commission outstanding", stats.outstanding, Clock3]].map(([label, value, Icon]) => <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><Icon className="text-emerald-700" size={20} /></div><p className="mt-2 text-2xl font-bold text-slate-900">{money(value)}</p></div>)}</div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto"><table className="w-full min-w-[850px]"><thead className="bg-slate-50"><tr><th className="p-4 text-left">Agent</th><th className="p-4 text-left">Booking</th><th className="p-4 text-left">Commission</th><th className="p-4 text-left">Rate</th><th className="p-4 text-left">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
            <tbody>{data.map((commission) => { const agentName = commission.agent?.user?.name || commission.agent?.companyName || "Agent"; return <tr key={commission._id} className="border-t"><td className="p-4"><div className="font-semibold text-slate-900">{agentName}</div><div className="text-sm text-slate-500">{commission.agent?.user?.email || commission.agent?.email || ""}</div></td><td className="p-4">{commission.booking?.bookingNumber || "-"}</td><td className="p-4 font-semibold">{money(commission.amount)}</td><td className="p-4">{commission.rate || 0}%</td><td className="p-4 capitalize">{commission.status || "pending"}</td><td className="p-4 text-right"><div className="flex justify-end gap-2">{commission.status === "pending" && <button type="button" onClick={() => approve.mutate(commission._id)} disabled={approve.isPending} className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><CheckCircle size={15} /> Approve</button>}{["pending", "approved", "processing"].includes(commission.status) && <button type="button" onClick={() => setPayment(commission)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"><CircleDollarSign size={15} /> Pay commission</button>}</div></td></tr> })}{!data.length && <tr><td colSpan="6" className="p-10 text-center text-slate-500">No commissions found.</td></tr>}</tbody>
          </table></div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b p-5"><h2 className="text-xl font-bold text-slate-900">Agent withdrawal requests</h2><p className="mt-1 text-sm text-slate-500">For M-Pesa withdrawals, clicking Send to M-Pesa calls Safaricom B2C. The agent's phone receives the funds after Safaricom successfully processes the payout.</p></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-sm"><thead className="bg-slate-50"><tr><th className="p-4 text-left">Agent</th><th className="p-4 text-left">Amount</th><th className="p-4 text-left">Method</th><th className="p-4 text-left">Destination</th><th className="p-4 text-left">Status</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>
            {(withdrawalsQuery.data || []).map((w) => { const name = w.agent?.user?.name || w.agent?.companyName || "Agent"; const destination = w.method === "MPESA" ? w.mpesaPhone : `${w.bankName} · ${w.bankAccountNumber}`; return <tr key={w._id} className="border-t"><td className="p-4"><div className="font-semibold">{name}</div><div className="text-xs text-slate-500">{w.agent?.user?.email || w.agent?.email || ""}</div></td><td className="p-4 font-semibold">{money(w.amount)}</td><td className="p-4">{w.method === "MPESA" ? "M-Pesa" : "Bank transfer"}</td><td className="p-4">{destination}</td><td className="p-4 capitalize">{w.status}</td><td className="p-4 text-right"><div className="flex justify-end gap-2">{w.status === "pending" && <><button type="button" onClick={() => approveWithdrawal.mutate(w._id)} disabled={approveWithdrawal.isPending} className="rounded-lg bg-amber-600 px-3 py-2 font-semibold text-white">Approve</button><button type="button" onClick={() => rejectWithdrawal.mutate({ id: w._id, reason: "Rejected by finance." })} disabled={rejectWithdrawal.isPending} className="rounded-lg border border-red-200 px-3 py-2 font-semibold text-red-600">Reject</button></>}{["approved", "processing"].includes(w.status) && <button type="button" onClick={() => setWithdrawal(w)} disabled={completeWithdrawal.isPending} className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 font-semibold text-white">{w.method === "MPESA" ? <><Smartphone size={15} /> Send to M-Pesa</> : "Complete payout"}</button>}</div></td></tr> })}
            {!withdrawalsQuery.isLoading && !(withdrawalsQuery.data || []).length && <tr><td colSpan="6" className="p-10 text-center text-slate-500">No withdrawal requests yet.</td></tr>}
          </tbody></table></div>
        </div>
      </div>

      {payment && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><form onSubmit={submitPayment} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-bold text-slate-900">Record commission payment</h2><p className="mt-1 text-sm text-slate-500">{payment.agent?.user?.name || payment.agent?.companyName || "Agent"} · {money(payment.amount)}</p><div className="mt-5 space-y-4"><label className="block"><span className="mb-1 block text-sm font-semibold">Payment method</span><select name="paymentMethod" defaultValue="MPESA" className="w-full rounded-lg border px-3 py-2"><option value="MPESA">M-Pesa</option><option value="BANK_TRANSFER">Bank transfer</option><option value="CASH">Cash</option><option value="CHEQUE">Cheque</option></select></label><label className="block"><span className="mb-1 block text-sm font-semibold">Payment reference / transaction ID</span><input name="paymentReference" required placeholder="e.g. QWE1234567" className="w-full rounded-lg border px-3 py-2" /></label><label className="block"><span className="mb-1 block text-sm font-semibold">Finance notes (optional)</span><textarea name="notes" rows="3" className="w-full rounded-lg border px-3 py-2" /></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setPayment(null)} className="rounded-lg border px-4 py-2 font-semibold">Cancel</button><button type="submit" disabled={pay.isPending} className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white">{pay.isPending ? "Recording..." : "Confirm payment"}</button></div></form></div>}

      {withdrawal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><form onSubmit={submitWithdrawal} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center gap-2"><Smartphone className="text-emerald-700" /><h2 className="text-xl font-bold text-slate-900">{withdrawal.method === "MPESA" ? "Send agent money to M-Pesa" : "Complete agent bank withdrawal"}</h2></div><p className="mt-1 text-sm text-slate-500">{withdrawal.agent?.user?.name || withdrawal.agent?.companyName || "Agent"} · {money(withdrawal.amount)} · {withdrawal.method === "MPESA" ? withdrawal.mpesaPhone : `${withdrawal.bankName} · ${withdrawal.bankAccountNumber}`}</p>{withdrawal.method === "MPESA" ? <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><p className="font-semibold">This will initiate a real M-Pesa B2C disbursement.</p><p className="mt-1">Safaricom will process {money(withdrawal.amount)} to {withdrawal.mpesaPhone}. The withdrawal will remain processing until Safaricom sends the result callback. Do not click Send twice.</p></div> : <div className="mt-5"><label className="block"><span className="mb-1 block text-sm font-semibold">Actual bank transaction reference</span><input name="reference" required placeholder="Enter the real transfer reference" className="w-full rounded-lg border px-3 py-2" /></label></div>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setWithdrawal(null)} disabled={completeWithdrawal.isPending} className="rounded-lg border px-4 py-2 font-semibold">Cancel</button><button type="submit" disabled={completeWithdrawal.isPending} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white">{withdrawal.method === "MPESA" ? <Smartphone size={16} /> : null}{completeWithdrawal.isPending ? "Sending..." : withdrawal.method === "MPESA" ? "Send money to M-Pesa" : "Mark payout completed"}</button></div></form></div>}
    </section>
  );
}
