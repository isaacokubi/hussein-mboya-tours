import {
useQuery
}
from "@tanstack/react-query";


import {
getAdminTours,
deleteTour
}
from "../../api/adminTourApi";



export default function AdminTours(){


const {
data=[]
}
=
useQuery({

queryKey:[
"admin-tours"
],

queryFn:
getAdminTours

});



return (

<div>


<h1
className="
text-4xl
font-bold
mb-8
"
>

Manage Tours

</h1>



{

data.map(

tour=>(


<div
key={tour._id}
className="
bg-white
shadow
p-5
rounded-xl
mb-4
flex
justify-between
"
>


<div>

<h2
className="
font-bold
text-xl
"
>

{tour.title}

</h2>


<p>
KES {tour.price}
</p>

</div>



<button

onClick={()=>
deleteTour(
tour._id
)
}

className="
text-red-600
"

>

Delete

</button>


</div>


)

)

}


</div>

);

}