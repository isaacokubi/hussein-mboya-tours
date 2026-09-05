import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAgentCommission, fetchAgentWithdrawals, requestAgentWithdrawal } from "../../api/agentApi";

const money = (value) => `KES ${Number(value || 0).toLocaleString()}`;

export default function AgentCommission() {
  const qc = useQueryClient();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [method, setMethod] = useState("MPESA");

  const commissionQuery = useQuery({ queryKey: ["agent-commission"], queryFn: fetchAgentCommission });
  const withdrawalQuery = useQuery({ queryKey: ["agent-withdrawals"], queryFn: fetchAgentWithdrawals, refetchOnWindowFocus: true });
  const withdraw = useMutation({
    mutationFn: requestAgentWithdrawal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-withdrawals"] });
      qc.invalidateQueries({ queryKey: ["agent-dashboard"] });
      setShowWithdraw(false);
    },
  });

  const rows = commissionQuery.data?.data || [];
  const balances = withdrawalQuery.data?.data?.balances || {};
  const withdrawals = withdrawalQuery.data?.data?.withdrawals || [];
  const available = Number(balances.availableBalance || 0);

  const submitWithdrawal = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount"));
    const accountName = String(form.get("accountName") || "").trim();
    const payload = {
      amount,
      method,
      accountName,
      mpesaPhone: String(form.get("mpesaPhone") || "").trim(),
      bankName: String(form.get("bankName") || "").trim(),
      bankAccountNumber: String(form.get("bankAccountNumber") || "").trim(),
      bankBranch: String(form.get("bankBranch") || "").trim(),
      bankCode: String(form.get("bankCode") || "").trim(),
      notes: String(form.get("notes") || "").trim(),
    };
    if (!Number.isFinite(amount) || amount <= 0 || amount > available) return;
    withdraw.mutate(payload);
  };

  return (
    <section className="space-y-6 bg-slate-50 p-6 md:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Finance</p>
        <h1 className="text-3xl font-bold text-slate-900">My Commissions & Wallet</h1>
        <p className="mt-1 text-slate-500">Track earned commissions and withdraw money that the tenant has paid to your commission wallet.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Total commission", balances.paidCommission || 0],
          ["Withdrawable", available],
          ["Reserved", balances.reservedWithdrawals || 0],
          ["Withdrawn", balances.withdrawn || 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{money(value)}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center">
        <div><p className="text-sm font-medium text-emerald-800">Available wallet</p><p className="text-3xl font-bold text-emerald-950">{money(available)}</p><p className="mt-1 text-sm text-emerald-800">Commission already paid by the tenant and available for withdrawal.</p></div>
        <button type="button" disabled={available <= 0} onClick={() => setShowWithdraw(true)} className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Withdraw to M-Pesa / Bank</button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto"><table className="w-full min-w-[700px]">
          <thead className="bg-slate-50"><tr><th className="p-4 text-left">Booking</th><th className="p-4 text-left">Amount</th><th className="p-4 text-left">Rate</th><th className="p-4 text-left">Status</th></tr></thead>
          <tbody>{commissionQuery.isLoading ? <tr><td colSpan="4" className="p-8 text-center">Loading commissions...</td></tr> : rows.map((c) => <tr key={c._id} className="border-t"><td className="p-4">{c.booking?.bookingNumber || "-"}</td><td className="p-4 font-semibold">{money(c.amount)}</td><td className="p-4">{c.rate || 0}%</td><td className="p-4 capitalize">{c.status || "pending"}</td></tr>)}{!commissionQuery.isLoading && !rows.length && <tr><td colSpan="4" className="p-8 text-center text-slate-500">No commissions yet.</td></tr>}</tbody>
        </table></div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b p-5"><h2 className="font-semibold text-slate-900">Withdrawal history</h2><p className="mt-1 text-sm text-slate-500">Requests remain reserved until completed or rejected.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-sm">
          <thead className="bg-slate-50"><tr><th className="p-4 text-left">Date</th><th className="p-4 text-left">Amount</th><th className="p-4 text-left">Method</th><th className="p-4 text-left">Destination</th><th className="p-4 text-left">Status</th><th className="p-4 text-left">Reference</th></tr></thead>
          <tbody>{withdrawals.map((w) => <tr key={w._id} className="border-t"><td className="p-4">{new Date(w.createdAt || w.requestedAt).toLocaleDateString()}</td><td className="p-4 font-semibold">{money(w.amount)}</td><td className="p-4">{w.method === "MPESA" ? "M-Pesa" : "Bank transfer"}</td><td className="p-4">{w.method === "MPESA" ? w.mpesaPhone : `${w.bankName} · ${w.bankAccountNumber}`}</td><td className="p-4 capitalize">{w.status}</td><td className="p-4">{w.paymentReference || "—"}</td></tr>)}{!withdrawals.length && <tr><td colSpan="6" className="p-8 text-center text-slate-500">No withdrawal requests yet.</td></tr>}</tbody>
        </table></div>
      </div>

      {showWithdraw && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><form onSubmit={submitWithdrawal} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900">Request commission withdrawal</h2>
        <p className="mt-1 text-sm text-slate-500">Available: {money(available)}</p>
        <div className="mt-5 space-y-4">
          <label className="block"><span className="mb-1 block text-sm font-semibold">Amount</span><input name="amount" type="number" min="1" max={available} step="0.01" required className="w-full rounded-lg border px-3 py-2" /></label>
          <label className="block"><span className="mb-1 block text-sm font-semibold">Withdrawal method</span><select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full rounded-lg border px-3 py-2"><option value="MPESA">M-Pesa</option><option value="BANK_TRANSFER">Bank transfer</option></select></label>
          <label className="block"><span className="mb-1 block text-sm font-semibold">Account name</span><input name="accountName" required className="w-full rounded-lg border px-3 py-2" /></label>
          {method === "MPESA" ? <label className="block"><span className="mb-1 block text-sm font-semibold">M-Pesa phone number</span><input name="mpesaPhone" required placeholder="07XXXXXXXX" className="w-full rounded-lg border px-3 py-2" /></label> : <>
            <label className="block"><span className="mb-1 block text-sm font-semibold">Bank name</span><input name="bankName" required className="w-full rounded-lg border px-3 py-2" /></label>
            <label className="block"><span className="mb-1 block text-sm font-semibold">Account number</span><input name="bankAccountNumber" required className="w-full rounded-lg border px-3 py-2" /></label>
            <label className="block"><span className="mb-1 block text-sm font-semibold">Branch (optional)</span><input name="bankBranch" className="w-full rounded-lg border px-3 py-2" /></label>
            <label className="block"><span className="mb-1 block text-sm font-semibold">Bank code (optional)</span><input name="bankCode" className="w-full rounded-lg border px-3 py-2" /></label>
          </>}
          <label className="block"><span className="mb-1 block text-sm font-semibold">Note (optional)</span><textarea name="notes" rows="2" className="w-full rounded-lg border px-3 py-2" /></label>
          {withdraw.isError && <p className="text-sm text-red-600">{withdraw.error?.response?.data?.message || "Unable to submit withdrawal."}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowWithdraw(false)} className="rounded-lg border px-4 py-2 font-semibold">Cancel</button><button type="submit" disabled={withdraw.isPending} className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-60">{withdraw.isPending ? "Submitting..." : "Submit withdrawal"}</button></div>
      </form></div>}
    </section>
  );
}
