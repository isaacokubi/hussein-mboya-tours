import {
useQuery
}
from "@tanstack/react-query";


import {
getCRMStats
}
from "../../api/crmApi";



export default function CRM(){


const {
data
}
=
useQuery({

queryKey:[

"crm"

],

queryFn:
getCRMStats

});



if(!data)

return <p>
Loading...
</p>;



return (

<div>

<h1
className="
text-4xl
font-bold
"
>

Customer CRM

</h1>



<div
className="
grid
md:grid-cols-3
gap-6
mt-8
"
>


<div
className="
bg-white
shadow
p-6
rounded-xl
"
>

Customers

<h2>
{
data.totalCustomers
}
</h2>

</div>



<div
className="
bg-white
shadow
p-6
rounded-xl
"
>

VIP Customers

<h2>
{
data.vipCustomers
}
</h2>

</div>



<div
className="
bg-white
shadow
p-6
rounded-xl
"
>

Corporate

<h2>
{
data.corporateCustomers
}
</h2>

</div>


</div>


</div>

);

}