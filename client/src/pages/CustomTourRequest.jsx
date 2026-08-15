import { useSettings } from "../context/SettingsContext";
import {useState} from "react";import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";import {createCustomTourRequest,getMyCustomTourRequests,convertCustomTourRequest} from "../api/customTourApi";import MobileDashboardNav from "../components/common/MobileDashboardNav";export default function CustomTourRequest(
){const qc=useQueryClient();const [form,setForm]=useState({destination:"",durationDays:3,people:2,startDate:"",
budget:"",
requirements:"",
pickupLocation:"",

pickupTime:"",
accommodationPreference:"",
mealPreference:"",
transportPreference:"",
specialRequests:""});const {data}=useQuery({queryKey:["my-custom-tour-requests"],queryFn:getMyCustomTourRequests});const mutation=useMutation({mutationFn:createCustomTourRequest,onSuccess:()=>{
alert("Request submitted. The company will notify you with the total cost.");
setForm({destination:"",durationDays:3,people:2,startDate:"",
budget:"",
requirements:"",
pickupLocation:"",

pickupTime:"",
accommodationPreference:"",
mealPreference:"",
transportPreference:"",
specialRequests:""});
qc.invalidateQueries({queryKey:["my-custom-tour-requests"]})
},
onError:(error)=>{
console.error("Custom tour request failed:", error);
alert(error?.response?.data?.message || "Unable to submit custom tour request");
}
});return <div className="min-h-screen bg-slate-50 p-4 md:p-8"><MobileDashboardNav/><div className="mx-auto max-w-4xl"><div className="mb-6 rounded-3xl bg-gradient-to-r from-emerald-950 to-slate-900 p-6 text-white"><h1 className="text-3xl font-bold">Build Your Own Tour</h1><p className="mt-2 text-slate-300">Tell us where you want to go, how long you want to stay and what you need. We will price the trip and notify you.</p></div><form onSubmit={e=>{e.preventDefault();mutation.mutate({...form,durationDays:Number(form.durationDays),people:Number(form.people),budget:Number(form.budget||0)})}} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 space-y-5"><div className="grid gap-5 md:grid-cols-2"><input required placeholder="Destination / places" value={form.destination} onChange={e=>setForm({...form,destination:e.target.value})} className="rounded-xl border p-3"/><input required type="number" min="1" placeholder="Duration (days)" value={form.durationDays} onChange={e=>setForm({...form,durationDays:e.target.value})} className="rounded-xl border p-3"/><input required type="number" min="1" placeholder="Number of people" value={form.people} onChange={e=>setForm({...form,people:e.target.value})} className="rounded-xl border p-3"/><input type="date" min={new Date().toISOString().slice(0,10)} value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})} className="rounded-xl border p-3"/><input type="number" min="0" placeholder="Budget (optional)" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} className="rounded-xl border p-3"/></div>
<div className="grid gap-5 md:grid-cols-2">

<input
placeholder="Pickup location"
value={form.pickupLocation}
onChange={e=>setForm({...form,pickupLocation:e.target.value})}
className="rounded-xl border p-3"
/>

<input
type="time"
value={form.pickupTime}
onChange={e=>setForm({...form,pickupTime:e.target.value})}
className="rounded-xl border p-3"
/>

<input
placeholder="Accommodation preference"
value={form.accommodationPreference}
onChange={e=>setForm({...form,accommodationPreference:e.target.value})}
className="rounded-xl border p-3"
/>

<input
placeholder="Meal preference"
value={form.mealPreference}
onChange={e=>setForm({...form,mealPreference:e.target.value})}
className="rounded-xl border p-3"
/>

<input
placeholder="Transport preference"
value={form.transportPreference}
onChange={e=>setForm({...form,transportPreference:e.target.value})}
className="rounded-xl border p-3"
/>

</div>

<textarea rows="6" placeholder="Accommodation, meals, transfers, activities, children, accessibility, special occasions and anything else..." value={form.requirements} onChange={e=>setForm({...form,requirements:e.target.value})} className="w-full rounded-xl border p-3"/><button disabled={mutation.isPending} className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white">{mutation.isPending?"Submitting...":"Request my custom tour"}</button></form><div className="mt-8 space-y-4"><h2 className="text-2xl font-bold">My requests</h2>{(data?.requests||[]).map(r=><div key={r._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex flex-wrap justify-between gap-3"><div><b>{r.destination}</b><div className="text-sm text-slate-500">{r.durationDays} days · {r.people} people</div></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize">{r.status}</span></div>{r.status==="quoted" && Number(r.quotedAmount) > 0 && (
<button
onClick={async()=>{
try{

const data = await convertCustomTourRequest(r._id);

if(data?.booking?._id){
window.location.href = `/checkout/${data.booking._id}`;
}

}catch(error){
console.error(error);
alert(error?.response?.data?.message || "Unable to start payment");
}

}}
className="mt-4 rounded-xl bg-emerald-700 px-5 py-3 text-white font-bold"
>
Proceed to Book & Pay
</button>
)}

<p className="mt-3 text-lg font-bold text-emerald-700">Quoted total: KES {Number(r.quotedAmount).toLocaleString()}</p>{r.adminNotes&&<p className="mt-2 text-sm text-slate-600">{r.adminNotes}</p>}</div>)}</div></div></div>}
