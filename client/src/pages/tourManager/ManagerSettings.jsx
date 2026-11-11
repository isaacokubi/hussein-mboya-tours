/**
 * Purpose: Manager Settings page-level UI component. Main declarations: ManagerSettings, update, save.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useEffect, useState } from "react";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load ../../api/settingsApi so this module can use its exported dependencies.
import { getSettings, updateSettings } from "../../api/settingsApi";

// Define ManagerSettings; its parameters and body implement this operation.
export default function ManagerSettings() {
 // Declare [settings,setSettings] for use by the surrounding module or function.
 const [settings,setSettings]=useState({}); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false);
 // Perform the side effect or state update expressed on the following line.
 useEffect(()=>{getSettings().then(x=>setSettings(x?.settings||x||{})).catch(()=>toast.error("Unable to load settings.")).finally(()=>setLoading(false));},[]);
 // Declare update for use by the surrounding module or function.
 const update=(k,v)=>setSettings(s=>({...s,[k]:v}));
 // Declare save for use by the surrounding module or function.
 const save=async()=>{try{setSaving(true);await updateSettings(settings);toast.success("Settings saved.");}catch(e){toast.error(e?.response?.data?.message||"Unable to save settings.");}finally{setSaving(false);}};
 // Check the condition (loading) and run the matching branch.
 if(loading)return <div className="p-8">Loading settings...</div>;
 // Return the expression shown below to the caller.
 return <div className="min-h-screen bg-slate-50 p-4 md:p-8"><div className="mx-auto max-w-4xl space-y-6"><header><h1 className="text-3xl font-bold">Manager Settings</h1><p className="mt-1 text-slate-500">Review operational configuration used by the tour-management workspace.</p></header><div className="grid gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><label className="text-sm font-semibold">Company name<input className="mt-2 w-full rounded-xl border p-3 font-normal" value={settings.companyName||""} onChange={e=>update("companyName",e.target.value)}/></label><label className="text-sm font-semibold">Support phone<input className="mt-2 w-full rounded-xl border p-3 font-normal" value={settings.supportPhone||""} onChange={e=>update("supportPhone",e.target.value)}/></label><label className="text-sm font-semibold">Currency<select className="mt-2 w-full rounded-xl border p-3 font-normal" value={settings.currency||"KES"} onChange={e=>update("currency",e.target.value)}><option>KES</option><option>USD</option><option>EUR</option></select></label><div><button disabled={saving} onClick={save} className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white disabled:opacity-50">{saving?"Saving...":"Save settings"}</button></div></div></div></div>;
}
