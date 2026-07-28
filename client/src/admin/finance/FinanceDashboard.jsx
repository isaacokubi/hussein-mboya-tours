import {
useQuery
}
from "@tanstack/react-query";


import axios from "axios";



export default function FinanceDashboard(){



const {

data,

isLoading

}=useQuery({


queryKey:[

"financeStats"

],



queryFn:async()=>{


const res =
await axios.get(

`${import.meta.env.VITE_API_URL}/api/admin/finance/stats`,

{

headers:{


Authorization:

`Bearer ${localStorage.getItem("token")}`


}


}

);


return res.data;


}


});




if(isLoading)

return <p>
Loading finance...
</p>;




return (

<div className="
p-6
">


<h1 className="
text-3xl font-bold mb-8
">

Finance Management

</h1>



<div className="
grid md:grid-cols-4 gap-6
">



<FinanceCard

title="Revenue"

value={`KES ${data?.revenue}`}

/>



<FinanceCard

title="Completed Payments"

value={data?.completedPayments}

/>



<FinanceCard

title="Pending Payments"

value={data?.pendingPayments}

/>



<FinanceCard

title="Failed Payments"

value={data?.failedPayments}

/>



</div>


</div>

)

}



function FinanceCard({

title,

value

}){


return (

<div className="
bg-white shadow rounded-xl p-6
">


<p className="
text-gray-500
">

{title}

</p>


<h2 className="
text-3xl font-bold mt-3
">

{value || 0}

</h2>


</div>

)


}