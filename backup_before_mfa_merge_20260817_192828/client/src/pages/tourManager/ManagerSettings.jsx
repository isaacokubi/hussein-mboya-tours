import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getSettings, updateSettings } from "../../api/settingsApi";

export default function ManagerSettings() {
 const [settings,setSettings]=useState({}); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false);
 useEffect(()=>{getSettings().then(x=>setSettings(x?.settings||x||{})).catch(()=>toast.error("Unable to load settings.")).finally(()=>setLoading(false));},[]);
 const update=(k,v)=>setSettings(s=>({...s,[k]:v}));
 const save=async()=>{try{setSaving(true);await updateSettings(settings);toast.success("Settings saved.");}catch(e){toast.error(e?.response?.data?.message||"Unable to save settings.");}finally{setSaving(false);}};
 if(loading)return <div className="p-8">Loading settings...</div>;
 return <div className="min-h-screen bg-slate-50 p-4 md:p-8"><div className="mx-auto max-w-4xl space-y-6"><header><h1 className="text-3xl font-bold">Manager Settings</h1><p className="mt-1 text-slate-500">Review operational configuration used by the tour-management workspace.</p></header><div className="grid gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><label className="text-sm font-semibold">Company name<input className="mt-2 w-full rounded-xl border p-3 font-normal" value={settings.companyName||""} onChange={e=>update("companyName",e.target.value)}/></label><label className="text-sm font-semibold">Support phone<input className="mt-2 w-full rounded-xl border p-3 font-normal" value={settings.supportPhone||""} onChange={e=>update("supportPhone",e.target.value)}/></label><label className="text-sm font-semibold">Currency<select className="mt-2 w-full rounded-xl border p-3 font-normal" value={settings.currency||"KES"} onChange={e=>update("currency",e.target.value)}><option>KES</option><option>USD</option><option>EUR</option></select></label><div><button disabled={saving} onClick={save} className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white disabled:opacity-50">{saving?"Saving...":"Save settings"}</button></div></div></div></div>;
}
