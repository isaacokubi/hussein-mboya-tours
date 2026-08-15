
import {useQuery} from "@tanstack/react-query";
import {getBookings} from "../../api/tourManagerApi";

export default function TourManagerBookings(){

const {data,isLoading}=useQuery({
queryKey:["manager-bookings"],
queryFn:getBookings
});

const bookings=data?.bookings || data?.data || [];

return (

<section className="p-6">

<h1 className="text-3xl font-bold mb-6">
Bookings
</h1>

<div className="bg-white shadow rounded-xl p-6">

{isLoading && "Loading bookings..."}

{bookings.map(b=>(

<div key={b._id}
className="border-b py-3">

<b>
{b.bookingNumber}
</b>

<p>
Customer:
{b.customer?.name ||
b.customerSnapshot?.name ||
"Unknown"}
</p>

<p>
Tour:
{b.tour?.title || "Unknown"}
</p>

<p>
Status:
{b.status}
</p>

</div>

))}

</div>

</section>

)

}
