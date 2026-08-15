export default function AIAlerts({alerts=[]}){


return (

<div className="bg-white rounded-xl shadow p-6">


<h2 className="text-xl font-bold mb-4">
AI Operational Alerts
</h2>


<div className="space-y-3">


{
alerts.length === 0 && (

<p className="text-gray-500">
No operational issues detected.
</p>

)
}


{
alerts.map((alert,index)=>(

<div
key={index}
className="border rounded-lg p-4"
>

<p className="font-bold">
{alert.title}
</p>

<p className="text-gray-600">
{alert.message}
</p>

</div>

))
}


</div>


</div>

);

}
