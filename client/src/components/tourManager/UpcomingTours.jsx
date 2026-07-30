import React from "react";


const tours=[

{
name:"Maasai Mara Safari",
guests:25,
guide:"John Kamau",
status:"Active"
},


{
name:"Amboseli Adventure",
guests:18,
guide:"Mary Wanjiku",
status:"Upcoming"
},


{
name:"Diani Beach Escape",
guests:40,
guide:"Peter Mwangi",
status:"Confirmed"
}

];


const UpcomingTours=()=>{


return (

<div className="
bg-white
rounded-xl
shadow
p-6
">


<h2 className="
font-bold
text-xl
mb-5
">
Upcoming Tours
</h2>



{

tours.map((tour,index)=>(


<div
key={index}
className="
border-b
py-4
flex
justify-between
"
>


<div>

<h3 className="font-semibold">
{tour.name}
</h3>


<p>
Guests: {tour.guests}
</p>


<p>
Guide: {tour.guide}
</p>

</div>



<span className="
text-green-600
font-semibold
">
{tour.status}
</span>


</div>


))


}


</div>

)

}


export default UpcomingTours;