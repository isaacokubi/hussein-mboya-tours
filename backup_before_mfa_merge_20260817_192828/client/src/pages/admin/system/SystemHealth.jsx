import { useQuery } from "@tanstack/react-query";

import {
getSystemHealth
} from "../../../api/admin/systemHealthApi";



export default function SystemHealth(){


const {
data,
isLoading
}=useQuery({

queryKey:["systemHealth"],

queryFn:getSystemHealth,

refetchInterval:60000

});




if(isLoading){

return (

<div className="p-6">

Checking system...

</div>

);

}



const health =
data?.system ||
data?.data ||
{};





return (

<div className="p-6 space-y-6">


<h1 className="text-3xl font-bold">

System Health

</h1>



<div className="grid md:grid-cols-3 gap-5">



<div className="bg-white shadow rounded-xl p-6">

<h3>
Server
</h3>


<p className="text-2xl font-bold">

{health.status || "Unknown"}

</p>

</div>





<div className="bg-white shadow rounded-xl p-6">

<h3>
Database
</h3>


<p className="text-2xl font-bold">

{health.database || "Unknown"}

</p>


</div>





<div className="bg-white shadow rounded-xl p-6">

<h3>
Environment
</h3>


<p className="text-2xl font-bold">

{health.environment || "Production"}

</p>


</div>



</div>


<pre
className="
bg-black
text-green-400
rounded-xl
p-5
overflow-auto
"
>

{JSON.stringify(
health,
null,
2
)}

</pre>


</div>

);


}
