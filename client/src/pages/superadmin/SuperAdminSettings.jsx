import React, { useEffect, useState } from "react";
import {
  Save,
  RefreshCw,
  Shield,
  Database,
  Bell,
  CreditCard,
  Building2,
  Settings,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

import {
  getSettings,
  updateSettings
} from "../../api/superAdminApi";


const Card = ({icon:Icon,title,children}) => (
  <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-xl bg-gray-100">
        <Icon size={22}/>
      </div>
      <h2 className="text-lg font-semibold">
        {title}
      </h2>
    </div>

    {children}
  </div>
);


const Toggle = ({checked,onChange,label}) => (
  <label className="flex items-center justify-between p-3 rounded-xl border cursor-pointer">

    <span className="text-sm">
      {label}
    </span>

    <input
      type="checkbox"
      checked={checked}
      onChange={e=>onChange(e.target.checked)}
      className="w-5 h-5"
    />

  </label>
);


export default function SuperAdminSettings(){

const [settings,setSettings]=useState({});
const [saving,setSaving]=useState(false);
const [loading,setLoading]=useState(true);
const [message,setMessage]=useState("");


useEffect(()=>{

load();

},[]);



const load=async()=>{

try{

setLoading(true);

const data=await getSettings();

setSettings(data.settings || data || {});

}

catch(err){

console.error(err);

}

finally{

setLoading(false);

}

};



const update=(key,value)=>{

setSettings(prev=>({
...prev,
[key]:value
}));

};



const save=async()=>{

try{

setSaving(true);

await updateSettings(settings);

setMessage("Settings saved successfully");

setTimeout(()=>setMessage(""),3000);

}

catch(err){

console.error(err);

setMessage("Failed saving settings");

}

finally{

setSaving(false);

}

};



if(loading)

return (

<div className="p-8 flex items-center gap-3">

<RefreshCw className="animate-spin"/>

Loading settings...

</div>

);



return (

<div className="space-y-8 p-6">


<div className="bg-white rounded-2xl shadow-sm border p-6">

<div className="flex justify-between items-center">

<div>

<h1 className="text-3xl font-bold">
Platform Settings
</h1>

<p className="text-gray-500 mt-2">
Manage Coherent Tours global configuration
</p>

</div>


<button
onClick={load}
className="flex gap-2 items-center border px-4 py-2 rounded-xl"
>

<RefreshCw size={18}/>

Refresh

</button>


</div>


<div className="mt-4 flex items-center gap-2 text-sm">

<CheckCircle size={16}/>

System configuration active

</div>


</div>



{message &&

<div className="bg-green-50 border border-green-200 p-4 rounded-xl">

{message}

</div>

}



<div className="grid lg:grid-cols-2 gap-6">


<Card icon={Building2} title="General Configuration">


<input
className="w-full border rounded-xl p-3"
placeholder="Company Name"
value={settings.companyName || ""}
onChange={e=>update("companyName",e.target.value)}
/>


<input
className="w-full border rounded-xl p-3"
placeholder="Support Email"
value={settings.supportEmail || ""}
onChange={e=>update("supportEmail",e.target.value)}
/>


<input
className="w-full border rounded-xl p-3"
placeholder="Support Phone"
value={settings.supportPhone || ""}
onChange={e=>update("supportPhone",e.target.value)}
/>


<select
className="w-full border rounded-xl p-3"
value={settings.currency || "KES"}
onChange={e=>update("currency",e.target.value)}
>

<option>KES</option>
<option>USD</option>
<option>EUR</option>

</select>


</Card>




<Card icon={CreditCard} title="Booking & Payments">


<select
className="w-full border rounded-xl p-3"
value={settings.bookingStatus || "confirmed"}
onChange={e=>update("bookingStatus",e.target.value)}
>

<option value="pending">
Pending
</option>

<option value="confirmed">
Confirmed
</option>

</select>


<input
className="w-full border rounded-xl p-3"
placeholder="Payment Provider"
value={settings.paymentProvider || ""}
onChange={e=>update("paymentProvider",e.target.value)}
/>


</Card>





<Card icon={Bell} title="Notifications">


<Toggle
checked={settings.emailNotifications ?? true}
label="Booking and payment email notifications"
onChange={v=>update("emailNotifications",v)}
/>


<Toggle
checked={settings.systemAlerts ?? true}
label="System alerts"
onChange={v=>update("systemAlerts",v)}
/>


</Card>





<Card icon={Shield} title="Security Controls">


<Toggle
checked={settings.twoFactor ?? false}
label="Enable Two Factor Authentication"
onChange={v=>update("twoFactor",v)}
/>


<div className="flex gap-2 text-sm text-gray-600">

<AlertTriangle size={16}/>

Security changes are recorded in audit logs

</div>


</Card>





<Card icon={Database} title="System Maintenance">


<button className="w-full border rounded-xl p-3">

Create Database Backup

</button>


<button className="w-full border rounded-xl p-3">

Clear System Cache

</button>


</Card>



<Card icon={Settings} title="System Information">


<div className="text-sm space-y-2">

<p>
Environment: Production
</p>

<p>
Configuration management enabled
</p>

<p>
Audit logging active
</p>

</div>


</Card>


</div>



<div className="flex justify-end">

<button
disabled={saving}
onClick={save}
className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl"
>

<Save size={18}/>

{saving ? "Saving..." : "Save Settings"}

</button>


</div>


</div>

);

}
