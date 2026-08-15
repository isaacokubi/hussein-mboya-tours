
import {useQuery} from "@tanstack/react-query";
import {getTours} from "../../api/tourManagerApi";

export default function TourManagerTours(){

const {data,isLoading}=useQuery({
queryKey:["manager-tours"],
queryFn:getTours
});

const tours=data?.tours || data?.data || [];

return (
<section className="p-6">

<h1 className="text-3xl font-bold mb-6">
Tours Management
</h1>

<div className="bg-white rounded-xl shadow p-6">

{isLoading && "Loading tours..."}

{!isLoading && tours.length===0 &&
<p>No tours available</p>
}

<div className="space-y-4">

{tours.map(t=>(
<div key={t._id}
className="border rounded-lg p-4">

<h2 className="font-bold text-xl">
{t.title}
</h2>

<p>
Destination:
{t.destination?.name || "Not assigned"}
</p>

<p>
Status:
{t.status || "draft"}
</p>

</div>
))}

</div>

</div>

</section>
)

}
