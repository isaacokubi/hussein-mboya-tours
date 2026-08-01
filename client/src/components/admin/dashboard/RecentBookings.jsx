export default function RecentBookings({

    bookings=[]

}){


return (

<section className="
bg-white
rounded-xl
shadow
p-6
">


<h2 className="
text-xl
font-bold
mb-5
">

Recent Bookings

</h2>



{

bookings.length === 0 ?

(

<p className="
text-gray-500
">

No recent bookings

</p>

)

:

(

<div className="
space-y-4
">


{

bookings.map(
booking=>(


<div

key={booking._id}

className="
border
rounded-lg
p-4
flex
justify-between
"

>


<div>


<h3 className="
font-semibold
">

{
booking.bookingNumber ||
"Booking"
}

</h3>



<p className="
text-gray-500
">

{
booking.customer?.name ||
booking.fullName ||
"Customer"

}

</p>


</div>



<div className="
text-right
">


<p className="
font-bold
">

Ksh {

Number(
booking.totalAmount || 0
).toLocaleString()

}

</p>



<span className="
text-sm
capitalize
">

{
booking.paymentStatus
}

</span>


</div>


</div>


))

}



</div>


)


}



</section>


);


}