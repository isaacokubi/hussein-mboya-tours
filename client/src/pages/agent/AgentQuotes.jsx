import { useQuery } from "@tanstack/react-query";
import { fetchAgentQuotes } from "../../api/agentApi";

export default function AgentQuotes() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["agent-quotes"],
    queryFn: fetchAgentQuotes,
  });
  const quotes = data?.data || data?.quotes || [];
  return (
    <section className="p-6 md:p-8">
      <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Sales</p><h1 className="text-3xl font-bold">Quotations</h1><p className="text-slate-500">Manage customer quotations and follow up on prospective trips.</p></div>
      {isLoading ? <p>Loading quotations...</p> : isError ? <p className="text-red-600">Unable to load quotations.</p> : (
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">{!quotes.length ? <p className="text-slate-500">No quotations found.</p> : <div className="space-y-3">{quotes.map((quote) => <div key={quote._id} className="rounded-xl border p-4"><div className="font-semibold">{quote.quoteNumber || quote._id}</div><div className="text-sm text-slate-500">{quote.customer?.name || quote.customerName || "Customer"} · KES {Number(quote.totalAmount || quote.amount || 0).toLocaleString()}</div></div>)}</div>}</div>
      )}
    </section>
  );
}
