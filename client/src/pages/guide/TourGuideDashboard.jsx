import {
  useQuery
} from "@tanstack/react-query";


import {
  Link
} from "react-router-dom";


import {
  useAuth
} from "../../context/AuthContext";


import {
  getAssignedTours
} from "../../api/guideApi";





export default function TourGuideDashboard(){


const {
  user
}=useAuth();






/*
|--------------------------------------------------------------------------
| GET ASSIGNED TOURS
|--------------------------------------------------------------------------
*/


const {

data:tours=[],

isLoading,

error

}=useQuery({


queryKey:[

"assigned-tours"

],


queryFn:

getAssignedTours,


enabled:

!!user,


staleTime:

1000 * 60 * 5


});









if(isLoading){


return (

<div className="
min-h-screen
flex
items-center
justify-center
">

<h2 className="
text-xl
font-semibold
">

Loading assigned tours...

</h2>


</div>

);

}









if(error){


return (

<div className="
min-h-screen
flex
items-center
justify-center
text-red-600
">

Failed to load assigned tours.

</div>

);


}









const assignedTours =
Array.isArray(tours)
?
tours
:
[];








const today =
new Date()
.toISOString()
.split("T")[0];







const todayTours =

assignedTours.filter(

(tour)=>

new Date(
tour.startDate || tour.date
)
.toISOString()
.split("T")[0]
=== today

);








const totalGuests =

assignedTours.reduce(

(sum,tour)=>

sum +

Number(
tour.totalGuests ||
tour.guests ||
0
)

,

0

);








const completedTours =

assignedTours.filter(

tour=>

tour.status
?.toLowerCase()
==="completed"

).length;









return (

<div className="
min-h-screen
bg-gray-100
p-6
">








{/* HEADER */}


<div className="
bg-gradient-to-r
from-orange-700
to-yellow-500
text-white
rounded-2xl
p-8
mb-8
shadow-xl
">


<h1 className="
text-3xl
font-bold
">

Welcome Guide,
{" "}
{user?.name}

</h1>



<p className="
mt-2
">

Manage your assigned adventures with Hussein Mboya Tours.

</p>





<div className="
mt-5
flex
gap-4
flex-wrap
">


<Link

to="/profile"

className="
bg-white
text-orange-700
px-5
py-2
rounded-lg
font-semibold
"

>

My Profile

</Link>





<Link

to="/tours"

className="
bg-black/30
px-5
py-2
rounded-lg
font-semibold
"

>

Explore Destinations

</Link>



</div>



</div>









{/* STATISTICS */}



<div className="
grid
md:grid-cols-4
gap-6
mb-10
">


<StatCard

title="Assigned Tours"

value={
assignedTours.length
}

/>



<StatCard

title="Today's Tours"

value={
todayTours.length
}

/>



<StatCard

title="Total Guests"

value={
totalGuests
}

/>



<StatCard

title="Completed Tours"

value={
completedTours
}

/>



</div>









{/* TODAY TOURS */}



<div className="
bg-white
rounded-xl
shadow
p-6
mb-8
">


<h2 className="
text-2xl
font-bold
mb-5
">

Today's Adventures

</h2>





{

todayTours.length===0

?


<p className="
text-gray-500
">

No tours scheduled today.

</p>



:


todayTours.map(tour=>(


<div

key={
tour._id
}

className="
border
rounded-xl
p-5
mb-4
"

>


<h3 className="
text-xl
font-bold
">

{
tour.title
}

</h3>




<p>

📍

{" "}

{

tour.destination?.name ||

tour.destination ||

"N/A"

}

</p>





<Link

to={`/guide/tours/${tour._id}`}

className="
inline-block
mt-4
bg-green-600
text-white
px-5
py-2
rounded-lg
"

>

Start Tour

</Link>




</div>


))


}



</div>









{/* ASSIGNED TOURS */}



<div className="
bg-white
rounded-xl
shadow
p-6
">


<h2 className="
text-2xl
font-bold
mb-6
">

Assigned Tours

</h2>







{

assignedTours.length===0


?


<p className="
text-gray-500
">

No assigned tours available.

</p>



:


<div className="
grid
md:grid-cols-3
gap-6
">


{


assignedTours.map((tour)=>(


<div

key={
tour._id
}

className="
border
rounded-xl
p-5
hover:shadow-lg
transition
"

>


<div className="
flex
justify-between
gap-3
">


<h3 className="
font-bold
text-lg
">

{
tour.title
}

</h3>



<span className="
bg-orange-100
text-orange-700
px-3
py-1
rounded-full
text-sm
">

{

tour.status

}


</span>



</div>







<div className="
mt-4
space-y-2
text-gray-600
">


<p>

📍

{

tour.destination?.name ||

tour.destination

}

</p>



<p>

📅

{

new Date(
tour.startDate || tour.date
)
.toDateString()

}

</p>




<p>

👥

{

tour.totalGuests ||

tour.guests ||

0

}

Guests

</p>




</div>







<div className="
mt-5
flex
gap-3
">


<Link

to={`/guide/tours/${tour._id}`}

className="
bg-orange-600
text-white
px-4
py-2
rounded-lg
"

>

Details

</Link>





<Link

to={`/guide/guests/${tour._id}`}

className="
border
px-4
py-2
rounded-lg
"

>

Guests

</Link>



</div>





</div>


))


}



</div>


}



</div>






</div>


);


}







function StatCard({
title,
value
}){


return (

<div className="
bg-white
rounded-xl
shadow
p-6
">


<p className="
text-gray-500
">

{title}

</p>



<h2 className="
text-4xl
font-bold
mt-2
">

{value}

</h2>



</div>


);

}