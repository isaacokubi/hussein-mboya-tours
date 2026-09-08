import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Send, FileText, Calculator } from "lucide-react";
import api from "../../api/axios";
import { getAgentQuotations, createQuotation, updateQuotationStatus } from "../../api/quotationApi";

const emptyItem = { name: "", category: "Other", description: "", quantity: 1, unitPrice: 0 };

export default function AgentQuotes() {
  const qc = useQueryClient();
  const quotesQuery = useQuery({ queryKey: ["agent-quotes"], queryFn: getAgentQuotations });
  const customersQuery = useQuery({ queryKey: ["agent-customers"], queryFn: async () => (await api.get("/agent/customers")).data });
  const packagesQuery = useQuery({ queryKey: ["agent-packages"], queryFn: async () => (await api.get("/agent/packages")).data });
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState("");
  const [tourPackage, setTourPackage] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState([{ ...emptyItem, name: "Safari package" }]);

  const quotes = quotesQuery.data?.quotations || quotesQuery.data?.data || quotesQuery.data?.quotes || [];
  const customers = customersQuery.data?.customers || customersQuery.data?.data || [];
  const packages = packagesQuery.data?.packages || packagesQuery.data?.data || [];
  const total = useMemo(() => items.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.unitPrice || 0), 0), [items]);

  const createMutation = useMutation({
    mutationFn: createQuotation,
    onSuccess: () => { setOpen(false); setItems([{ ...emptyItem, name: "Safari package" }]); setNotes(""); qc.invalidateQueries({ queryKey: ["agent-quotes"] }); },
  });
  const statusMutation = useMutation({
    mutationFn: updateQuotationStatus,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-quotes"] }),
  });

  const submit = (e) => {
    e.preventDefault();
    if (!customer || !tourPackage || !validUntil || !items.some(i => i.name && Number(i.unitPrice) >= 0)) return;
    createMutation.mutate({
      customer, tourPackage,
      items: items.filter(i => i.name.trim()).map(i => ({ ...i, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice), total: Number(i.quantity) * Number(i.unitPrice) })),
      discount: Number(discount), taxRate: Number(taxRate), notes, validUntil
    });
  };

  return <section className="p-6 md:p-8">
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Sales workflow</p><h1 className="text-3xl font-bold">Quotation Builder</h1><p className="text-slate-500">Turn a customer request into a priced, trackable proposal.</p></div>
      <button onClick={() => setOpen(v => !v)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white"><Plus size={17}/> New quotation</button>
    </div>
    {open && <form onSubmit={submit} className="mb-6 space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="grid gap-4 md:grid-cols-3">
        <select required value={customer} onChange={e => setCustomer(e.target.value)} className="rounded-xl border p-3"><option value="">Customer</option>{customers.map(c => <option key={c._id} value={c._id}>{c.name || c.user?.name || c.email}</option>)}</select>
        <select required value={tourPackage} onChange={e => setTourPackage(e.target.value)} className="rounded-xl border p-3"><option value="">Tour package</option>{packages.map(p => <option key={p._id} value={p._id}>{p.title || p.name}</option>)}</select>
        <input required type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="rounded-xl border p-3" />
      </div>
      <div className="space-y-3">{items.map((item, idx) => <div key={idx} className="grid gap-3 md:grid-cols-5">
        <input placeholder="Item / service" value={item.name} onChange={e => setItems(xs => xs.map((x,i)=>i===idx?{...x,name:e.target.value}:x))} className="rounded-xl border p-3 md:col-span-2" />
        <select value={item.category} onChange={e => setItems(xs => xs.map((x,i)=>i===idx?{...x,category:e.target.value}:x))} className="rounded-xl border p-3"><option>Accommodation</option><option>Transport</option><option>Activity</option><option>Meal</option><option>Guide</option><option>Park Fee</option><option>Insurance</option><option>Visa</option><option>Other</option></select>
        <input type="number" min="1" value={item.quantity} onChange={e => setItems(xs => xs.map((x,i)=>i===idx?{...x,quantity:e.target.value}:x))} className="rounded-xl border p-3" />
        <input type="number" min="0" value={item.unitPrice} onChange={e => setItems(xs => xs.map((x,i)=>i===idx?{...x,unitPrice:e.target.value}:x))} className="rounded-xl border p-3" />
      </div>)}</div>
      <button type="button" onClick={() => setItems(xs => [...xs, {...emptyItem}])} className="rounded-lg border px-3 py-2 font-semibold">Add itinerary item</button>
      <div className="grid gap-4 md:grid-cols-3"><input type="number" min="0" value={discount} onChange={e=>setDiscount(e.target.value)} placeholder="Discount" className="rounded-xl border p-3"/><input type="number" min="0" value={taxRate} onChange={e=>setTaxRate(e.target.value)} placeholder="Tax %" className="rounded-xl border p-3"/><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes / follow-up instructions" className="rounded-xl border p-3"/></div>
      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><span className="font-semibold">Subtotal</span><span className="text-xl font-bold">KES {total.toLocaleString()}</span></div>
      <button disabled={createMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"><Calculator size={17}/> {createMutation.isPending ? "Creating..." : "Create quotation"}</button>
      {createMutation.isError && <p className="text-red-600">{createMutation.error?.response?.data?.message || "Unable to create quotation."}</p>}
    </form>}
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      {quotesQuery.isLoading ? <p>Loading quotations...</p> : quotesQuery.isError ? <p className="text-red-600">Unable to load quotations.</p> : !quotes.length ? <p className="text-slate-500">No quotations found.</p> :
      <div className="space-y-3">{quotes.map(q => <div key={q._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"><div><div className="font-semibold">{q.quotationNumber || q._id}</div><div className="text-sm text-slate-500">{q.customer?.name || "Customer"} · {q.tourPackage?.title || "Package"} · KES {Number(q.grandTotal || 0).toLocaleString()}</div></div><div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize">{q.status}</span>{q.status === "draft" && <button onClick={()=>statusMutation.mutate({id:q._id,status:"sent"})} className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white"><Send size={14}/> Send</button>}<FileText size={17}/></div></div>)}</div>}
    </div>
  </section>;
}
