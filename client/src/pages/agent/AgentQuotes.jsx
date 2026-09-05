import { useState } from "react";
import { Eye, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAgentQuotes } from "../../api/agentApi";

const amountOf = (quote) => Number(quote?.totalAmount || quote?.amount || quote?.total || 0);
const customerOf = (quote) => quote?.customer?.name || quote?.customerName || quote?.customer?.email || "Customer";

export default function AgentQuotes() {
  const { data, isLoading, isError } = useQuery({ queryKey: ["agent-quotes"], queryFn: fetchAgentQuotes });
  const [selected, setSelected] = useState(null);
  const quotes = Array.isArray(data) ? data : data?.data || data?.quotes || data?.data?.quotes || [];

  return <section className="p-4 md:p-8">
    <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Sales</p><h1 className="text-3xl font-bold">Quotations</h1><p className="text-slate-500">Review customer quotations and follow up on prospective trips.</p></div>
    {isLoading ? <p>Loading quotations...</p> : isError ? <p className="text-red-600">Unable to load quotations.</p> : <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"><table className="w-full min-w-[720px]"><thead className="bg-slate-50"><tr><th className="p-4 text-left">Quote</th><th className="p-4 text-left">Customer</th><th className="p-4 text-left">Amount</th><th className="p-4 text-left">Status</th><th className="p-4 text-left">Actions</th></tr></thead><tbody>{!quotes.length ? <tr><td colSpan="5" className="p-8 text-center text-slate-500">No quotations found.</td></tr> : quotes.map((quote) => <tr key={quote._id} className="border-t"><td className="p-4 font-semibold">{quote.quoteNumber || quote._id}</td><td className="p-4">{customerOf(quote)}</td><td className="p-4">KES {amountOf(quote).toLocaleString()}</td><td className="p-4 capitalize">{quote.status || "Pending"}</td><td className="p-4"><button type="button" onClick={() => setSelected(quote)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-50"><Eye size={15}/> View / Details</button></td></tr>)}</tbody></table></div>}
    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b p-5"><div><h2 className="text-xl font-bold">{selected.quoteNumber || "Quotation Details"}</h2><p className="text-sm text-slate-500">{customerOf(selected)}</p></div><button type="button" onClick={() => setSelected(null)} aria-label="Close" className="rounded-lg p-2 hover:bg-slate-100"><X size={20}/></button></div><div className="grid gap-4 p-5 sm:grid-cols-2"><Detail label="Customer" value={customerOf(selected)}/><Detail label="Amount" value={`KES ${amountOf(selected).toLocaleString()}`}/><Detail label="Status" value={selected.status || "Pending"}/><Detail label="Created" value={selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : undefined}/><Detail label="Valid Until" value={selected.validUntil ? new Date(selected.validUntil).toLocaleDateString() : undefined}/><Detail label="Quote ID" value={selected._id}/></div><div className="border-t p-5"><pre className="max-h-64 overflow-auto rounded-lg bg-slate-50 p-4 text-xs">{JSON.stringify(selected, null, 2)}</pre></div><div className="flex justify-end border-t p-5"><button type="button" onClick={() => setSelected(null)} className="rounded-lg border px-4 py-2 font-semibold">Close</button></div></div></div>}
  </section>;
}

function Detail({ label, value }) { return <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div><div className="mt-1 break-words font-medium">{value || "Not available"}</div></div>; }
