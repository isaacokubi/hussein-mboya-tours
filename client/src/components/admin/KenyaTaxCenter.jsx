import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calculator, RefreshCw, Save } from "lucide-react";
import { calculateTax, getTaxRules, initializeTaxRules, saveTaxRule } from "../../api/taxApi";

const money = (v) => `KES ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const unwrapList = (value) => Array.isArray(value) ? value : value?.items || value?.data || [];

export default function KenyaTaxCenter() {
  const qc = useQueryClient();
  const rulesQ = useQuery({ queryKey: ["kenya-tax-rules"], queryFn: getTaxRules, staleTime: 30000 });
  const [amount, setAmount] = useState("10000"); const [category, setCategory] = useState("STANDARD"); const [mode, setMode] = useState("exclusive"); const [rate, setRate] = useState(""); const [result, setResult] = useState(null);
  const [drafts, setDrafts] = useState({});
  const rules = unwrapList(rulesQ.data);
  const init = useMutation({ mutationFn: initializeTaxRules, onSuccess: () => qc.invalidateQueries({ queryKey: ["kenya-tax-rules"] }) });
  const calc = useMutation({ mutationFn: calculateTax, onSuccess: (data) => setResult(data) });
  const save = useMutation({ mutationFn: ({ code, payload }) => saveTaxRule(code, payload), onSuccess: () => qc.invalidateQueries({ queryKey: ["kenya-tax-rules"] }) });
  const updateDraft = (code, field, value) => setDrafts((prev) => ({ ...prev, [code]: { ...(prev[code] || {}), [field]: value } }));
  const submitCalc = (e) => { e.preventDefault(); calc.mutate({ amount: Number(amount), category, mode, ...(rate !== "" ? { rate: Number(rate) } : {}) }); };
  return <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Kenya tax controls</p><h2 className="text-xl font-bold text-slate-900">Tax engine & VAT rules</h2><p className="mt-1 text-sm text-slate-500">Tenant-specific calculation rules. Rates remain configurable so tax changes do not require a code deployment.</p></div><button onClick={() => init.mutate()} disabled={init.isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><RefreshCw size={16}/>Initialize defaults</button></div>
    <form onSubmit={submitCalc} className="grid gap-3 md:grid-cols-5 rounded-xl bg-slate-50 p-4">
      <label className="text-sm font-semibold">Amount<input value={amount} onChange={(e)=>setAmount(e.target.value)} type="number" min="0" step="0.01" className="mt-1 w-full rounded-lg border p-2 font-normal"/></label>
      <label className="text-sm font-semibold">Tax category<select value={category} onChange={(e)=>setCategory(e.target.value)} className="mt-1 w-full rounded-lg border p-2 font-normal"><option>STANDARD</option><option>ZERO_RATED</option><option>EXEMPT</option><option>NON_VAT</option></select></label>
      <label className="text-sm font-semibold">Pricing mode<select value={mode} onChange={(e)=>setMode(e.target.value)} className="mt-1 w-full rounded-lg border p-2 font-normal"><option value="exclusive">Exclusive</option><option value="inclusive">Inclusive</option></select></label>
      <label className="text-sm font-semibold">Override rate %<input value={rate} onChange={(e)=>setRate(e.target.value)} type="number" min="0" max="100" step="0.01" placeholder="Profile/rule rate" className="mt-1 w-full rounded-lg border p-2 font-normal"/></label>
      <button disabled={calc.isPending} className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 font-bold text-white disabled:opacity-50"><Calculator size={16}/>Calculate</button>
    </form>
    {result && <div className="grid gap-3 sm:grid-cols-4"><div className="rounded-xl border p-4"><span className="text-xs text-slate-500">Taxable</span><p className="font-black">{money(result.taxableAmount)}</p></div><div className="rounded-xl border p-4"><span className="text-xs text-slate-500">Net</span><p className="font-black">{money(result.netAmount)}</p></div><div className="rounded-xl border p-4"><span className="text-xs text-slate-500">Tax</span><p className="font-black">{money(result.taxAmount)} ({result.rate}%)</p></div><div className="rounded-xl border p-4"><span className="text-xs text-slate-500">Total</span><p className="font-black text-emerald-700">{money(result.totalAmount)}</p></div></div>}
    <div><h3 className="font-bold">Configured rules</h3><div className="mt-3 overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="p-2">Code</th><th className="p-2">Name</th><th className="p-2">Type</th><th className="p-2">Rate</th><th className="p-2">Action</th></tr></thead><tbody>{rules.map((rule)=><tr key={rule._id || rule.code} className="border-b"><td className="p-2 font-mono">{rule.code}</td><td className="p-2">{rule.name}</td><td className="p-2">{rule.taxType}</td><td className="p-2"><input value={drafts[rule.code]?.rate ?? rule.rate} onChange={(e)=>updateDraft(rule.code,"rate",e.target.value)} type="number" min="0" max="100" step="0.01" className="w-24 rounded border p-1"/>%</td><td className="p-2"><button onClick={()=>save.mutate({ code: rule.code, payload: { ...rule, ...drafts[rule.code], rate: Number(drafts[rule.code]?.rate ?? rule.rate) }})} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 font-semibold hover:bg-slate-50"><Save size={14}/>Save</button></td></tr>)}</tbody></table></div></div>
    <p className="text-xs text-slate-500">This module calculates configured tax; it does not represent KRA registration, certification, or live eTIMS submission. Those remain connected through the existing compliance/eTIMS adapter workflow.</p>
  </section>;
}
