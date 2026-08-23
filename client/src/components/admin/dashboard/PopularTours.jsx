export default function PopularTours({
tours=[]
}){


return (

<section className="
bg-white
shadow
rounded-xl
p-6
">


<h2 className="
font-bold
text-xl
mb-5
">

Top Performing Tours

</h2>


{

tours.map((tour,index)=>(


<div
key={tour._id}
className="
flex
justify-between
border-b
py-3
"
>


<span>

#{index+1}
{" "}
{tour.title}

</span>



<strong>

{
tour.totalBookings || 0
}

bookings

</strong>


</div>


))


}


</section>


);


}
