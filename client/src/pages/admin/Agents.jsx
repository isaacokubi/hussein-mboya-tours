import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, CheckCircle, PauseCircle, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import { getAgents, approveAgent, updateAgentStatus } from "../../api/adminAgentApi";

export default function Agents(
) {
  const qc=useQueryClient();
  const {data=[],isLoading,isError}=useQuery({queryKey:["agents"],queryFn:getAgents});
  const approve=useMutation({mutationFn:approveAgent,onSuccess:()=>{qc.invalidateQueries({queryKey:["agents"]});toast.success("Agent approved.");}});
  const status=useMutation({mutationFn:({id,value})=>updateAgentStatus(id,value),onSuccess:()=>qc.invalidateQueries({queryKey:["agents"]})});
  if(isLoading)return <div className="p-6">Loading agents...</div>;
  if(isError)return <div className="p-6 text-red-600">Failed to load agents.</div>;
  const active=data.filter(a=>a.status==="active").length;
  const pending=data.filter(a=>!a.isApproved).length;
  return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-7xl"><div className="mb-6"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Partner network</p><h1 className="text-3xl font-bold text-slate-900">Agent Management</h1><p className="text-slate-500">Approve travel partners and monitor bookings and commission performance.</p></div><div className="mb-6 grid gap-4 md:grid-cols-3">{[["Total agents",data.length,Users],["Active",active,CheckCircle],["Awaiting approval",pending,PauseCircle]].map(([l,v,I])=><div key={l} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex justify-between"><span className="text-sm text-slate-500">{l}</span><I className="text-emerald-700"/></div><p className="mt-2 text-3xl font-bold">{v}</p></div>)}</div><div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"><div className="overflow-x-auto"><table className="w-full"><thead className="bg-slate-50"><tr><th className="p-4 text-left">Agent</th><th className="p-4 text-left">Company</th><th className="p-4 text-left">Location</th><th className="p-4 text-left">Bookings</th><th className="p-4 text-left">Commission</th><th className="p-4 text-left">Status</th><th className="p-4 text-right">Action</th></tr></thead><tbody>{data.map(a=><tr key={a._id} className="border-t hover:bg-slate-50"><td className="p-4"><div className="font-semibold">{a.user?.name||"-"}</div><div className="text-sm text-slate-500">{a.user?.email}</div></td><td className="p-4">{a.companyName||"-"}</td><td className="p-4"><MapPin size={15} className="mr-1 inline"/>{a.location||"-"}</td><td className="p-4">{a.totalBookings||0}</td><td className="p-4 font-semibold">KES {Number(a.totalCommission||0).toLocaleString()}</td><td className="p-4"><select value={a.status||"active"} onChange={e=>status.mutate({id:a._id,value:e.target.value})} className="rounded-lg border p-2 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select></td><td className="p-4 text-right">{!a.isApproved&&<button onClick={()=>approve.mutate(a._id)} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Approve</button>}</td></tr>)}</tbody></table></div></div></div></div>;
}
