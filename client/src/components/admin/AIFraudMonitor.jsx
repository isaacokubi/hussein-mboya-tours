export default function AIFraudMonitor({
data={}
}){


return (

<div className="bg-white rounded-xl shadow p-6">


<h2 className="text-xl font-bold mb-4">
AI Fraud & Payment Monitoring
</h2>


<div className="grid md:grid-cols-4 gap-3 mb-5">


<div className="border rounded p-3">
Failed Payments
<br/>
<b>
{data.metrics?.failedPayments || 0}
</b>
</div>


<div className="border rounded p-3">
Pending Payments
<br/>
<b>
{data.metrics?.pendingPayments || 0}
</b>
</div>


<div className="border rounded p-3">
Large Payments
<br/>
<b>
{data.metrics?.largePayments || 0}
</b>
</div>


<div className="border rounded p-3">
Duplicates
<br/>
<b>
{data.metrics?.duplicatePayments || 0}
</b>
</div>


</div>



<h3 className="font-bold mb-3">
Security Alerts
</h3>


<div className="space-y-3">

{
(data.alerts || []).map(
(alert,index)=>(

<div
key={index}
className="border rounded-lg p-4"
>

<b>
{alert.title}
</b>

<p>
{alert.message}
</p>

</div>

))
}

</div>


</div>

);

}
