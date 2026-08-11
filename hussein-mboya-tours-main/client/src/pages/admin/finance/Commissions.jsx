import { useQuery } from "@tanstack/react-query";
import { WalletCards, CheckCircle, Clock3 } from "lucide-react";
import { getCommissions } from "../../../api/commissionApi";

export default function Commissions() {
  const {data=[],isLoading,isError}=useQuery({queryKey:["commissions"],queryFn:getCommissions});
  if(isLoading)return <div className="p-6">Loading commissions...</div>;
  if(isError)return <div className="p-6 text-red-600">Failed to load commissions.</div>;
  const total=data.reduce((s,c)=>s+Number(c.amount||0),0);
  const paid=data.filter(c=>c.status==="paid").reduce((s,c)=>s+Number(c.amount||0),0);
  const pending=data.filter(c=>!["paid","cancelled"].includes(c.status)).reduce((s,c)=>s+Number(c.amount||0),0);
  return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-7xl"><div className="mb-6"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Finance</p><h1 className="text-3xl font-bold text-slate-900">Agent Commissions</h1><p className="text-slate-500">Track commission accruals and payment status by booking.</p></div><div className="mb-6 grid gap-4 md:grid-cols-3">{[["Total accrued",total,WalletCards],["Paid",paid,CheckCircle],["Outstanding",pending,Clock3]].map(([l,v,I])=><div key={l} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex justify-between"><span className="text-sm text-slate-500">{l}</span><I className="text-emerald-700"/></div><p className="mt-2 text-3xl font-bold">KES {v.toLocaleString()}</p></div>)}</div><div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"><div className="overflow-x-auto"><table className="w-full"><thead className="bg-slate-50"><tr><th className="p-4 text-left">Agent</th><th className="p-4 text-left">Booking</th><th className="p-4 text-left">Amount</th><th className="p-4 text-left">Rate</th><th className="p-4 text-left">Status</th></tr></thead><tbody>{data.map(c=><tr key={c._id} className="border-t"><td className="p-4"><div className="font-semibold">{c.agent?.user?.name||"-"}</div><div className="text-sm text-slate-500">{c.agent?.user?.email}</div></td><td className="p-4">{c.booking?.bookingNumber||"-"}</td><td className="p-4 font-semibold">KES {Number(c.amount||0).toLocaleString()}</td><td className="p-4">{c.rate||0}%</td><td className="p-4 capitalize">{c.status||"pending"}</td></tr>)}{!data.length&&<tr><td colSpan="5" className="p-8 text-center text-slate-500">No commissions found.</td></tr>}</tbody></table></div></div></div></div>;
}
