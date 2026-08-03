export default function BookingOverview({
  bookingStatus = []
}) {


return (

<section
className="
bg-white
rounded-xl
shadow
p-6
"
>


<h2
className="
text-xl
font-bold
mb-5
"
>
Booking Overview
</h2>



<div
className="
grid
md:grid-cols-3
gap-4
"
>


{
bookingStatus.map(
(item,index)=>(


<div
key={index}
className="
border
rounded-lg
p-4
"
>


<h3
className="
font-bold
capitalize
"
>

{
item?._id?.bookingStatus ||
item?._id?.paymentStatus ||
"Unknown"

}

</h3>



<p>

Payment:

{" "}

{
item?._id?.paymentStatus ||
"Not available"

}

</p>



<h2
className="
text-2xl
font-bold
mt-3
"
>

{item.count}

</h2>


</div>


))

}


</div>


</section>

);

}