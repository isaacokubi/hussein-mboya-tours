import { useEffect,useState } from "react";

import axios from "axios";



export default function AdminFinance(){


const [stats,setStats]=useState({});



useEffect(()=>{


axios.get(
"/api/admin/finance/stats"
)

.then(res=>{

setStats(res.data);

});


},[]);





return (

<div>


<h1 className="text-3xl font-bold">

Finance Dashboard

</h1>



<div className="grid grid-cols-4 gap-5 mt-6">


<Card

title="Revenue"

value={`KES ${stats.revenue || 0}`}

/>


<Card

title="Completed Payments"

value={stats.completedPayments}

/>



<Card

title="Pending Payments"

value={stats.pendingPayments}

/>



<Card

title="Failed Payments"

value={stats.failedPayments}

/>



</div>


</div>

)

}





function Card({title,value}){


return (

<div className="bg-white shadow p-5 rounded">


<h3>

{title}

</h3>


<p className="text-2xl font-bold">

{value || 0}

</p>


</div>

)

}