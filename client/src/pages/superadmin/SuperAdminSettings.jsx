import React, {useEffect, useState} from "react";
import {
  Settings,
  Shield,
  CreditCard,
  Bell,
  Database,
  Save,
  RefreshCcw,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

import { getSettings, updateSettings } from "../../api/superAdminApi";


const Section = ({icon:Icon,title,children})=>(
  <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
    <div className="flex items-center gap-3 border-b pb-3">
      <Icon size={22}/>
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
    {children}
  </div>
);


const Field=({label,value,onChange})=>(
  <div className="space-y-2">
    <label className="text-sm font-medium">{label}</label>
    <input
      className="w-full border rounded-lg px-3 py-2"
      value={value || ""}
      onChange={e=>onChange(e.target.value)}
    />
  </div>
);


export default function SuperAdminSettings(){

const [settings,setSettings]=useState({});
const [loading,setLoading]=useState(true);
const [saving,setSaving]=useState(false);
const [message,setMessage]=useState("");


useEffect(()=>{

loadSettings();

},[]);


async function loadSettings(){

try{

setLoading(true);

const res=await superAdminApi.getSettings?.();

setSettings(res?.data || res || {});

}
catch(err){

console.error(err);

}
finally{

setLoading(false);

}

}



function update(key,value){

setSettings(prev=>({
...prev,
[key]:value
}));

}



async function save(){

try{

setSaving(true);

if(updateSettings){

await updateSettings(settings);

}

setMessage("Settings saved successfully");

setTimeout(()=>setMessage(""),3000);


}
catch(err){

setMessage("Failed saving settings");

}
finally{

setSaving(false);

}

}



if(loading){

return (
<div className="p-8">
Loading platform settings...
</div>
)

}


return (

<div className="p-6 space-y-6">


<div className="flex justify-between items-center">

<div>
<h1 className="text-3xl font-bold">
Platform Settings
</h1>

<p className="text-gray-500">
Manage Coherent Tours global configuration
</p>

</div>


<button
onClick={loadSettings}
className="flex gap-2 items-center border px-4 py-2 rounded-lg"
>
<RefreshCcw size={18}/>
Refresh
</button>


</div>



{message &&

<div className="flex items-center gap-2 bg-green-100 p-3 rounded-lg">
<CheckCircle size={18}/>
{message}
</div>

}




<Section icon={Settings} title="General Configuration">

<div className="grid md:grid-cols-2 gap-5">

<Field
label="Company Name"
value={settings.companyName}
onChange={v=>update("companyName",v)}
/>


<Field
label="Support Email"
value={settings.supportEmail}
onChange={v=>update("supportEmail",v)}
/>


<Field
label="Support Phone"
value={settings.supportPhone}
onChange={v=>update("supportPhone",v)}
/>


<Field
label="Currency"
value={settings.currency}
onChange={v=>update("currency",v)}
/>


</div>

</Section>





<Section icon={CreditCard} title="Booking & Payments">


<div className="grid md:grid-cols-2 gap-5">


<Field
label="Default Booking Status"
value={settings.bookingStatus}
onChange={v=>update("bookingStatus",v)}
/>


<Field
label="Payment Provider"
value={settings.paymentProvider}
onChange={v=>update("paymentProvider",v)}
/>


</div>


</Section>






<Section icon={Bell} title="Notifications">


<div className="space-y-3">


<label className="flex gap-3">

<input
type="checkbox"
checked={settings.emailNotifications ?? true}
onChange={e=>update(
"emailNotifications",
e.target.checked
)}
/>

Booking and payment email notifications

</label>


<label className="flex gap-3">

<input
type="checkbox"
checked={settings.systemAlerts ?? true}
onChange={e=>update(
"systemAlerts",
e.target.checked
)}
/>

System alerts

</label>


</div>


</Section>







<Section icon={Shield} title="Security Controls">


<div className="space-y-3">


<label className="flex gap-3">

<input
type="checkbox"
checked={settings.twoFactor ?? false}
onChange={e=>update(
"twoFactor",
e.target.checked
)}
/>

Enable Two Factor Authentication

</label>


<div className="flex items-center gap-2 text-sm">

<AlertTriangle size={16}/>

Security changes are recorded in audit logs

</div>


</div>


</Section>







<Section icon={Database} title="System Maintenance">


<div className="space-y-3">


<button
className="border px-4 py-2 rounded-lg"
>

Create Database Backup

</button>


<button
className="border px-4 py-2 rounded-lg"
>

Clear System Cache

</button>


</div>


</Section>







<div className="flex justify-end">

<button

disabled={saving}

onClick={save}

className="flex gap-2 items-center bg-black text-white px-6 py-3 rounded-lg"

>

<Save size={18}/>

{saving ? "Saving..." : "Save Settings"}

</button>


</div>





</div>

)

}
