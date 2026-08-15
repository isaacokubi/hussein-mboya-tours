
import {useQuery} from "@tanstack/react-query";
import {getCustomers} from "../../api/tourManagerApi";

export default function TourManagerCustomers(){

const {data}=useQuery({
queryKey:["manager-customers"],
queryFn:getCustomers
});

const customers=data?.customers || data?.data || [];

return (

<section className="p-6">

<h1 className="text-3xl font-bold mb-6">
Customers
</h1>

<div className="grid md:grid-cols-3 gap-4">

{customers.map(c=>(

<div key={c._id}
className="bg-white shadow rounded-xl p-5">

<h2 className="font-bold">
{c.name}
</h2>

<p>{c.email}</p>

<p>{c.phone}</p>

</div>

))}

</div>

</section>

)

}
