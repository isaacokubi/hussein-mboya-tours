import React, {
useEffect,
useState
} from "react";


import {
useNavigate
}
from "react-router-dom";


import {
FaEdit,
FaTrash,
FaSearch,
FaPlus,
FaUserTie,
FaCar,
FaCalendarAlt
}
from "react-icons/fa";


import {
getManagerTours,
deleteTour
}
from "../../api/tourApi";


import {
toast
}
from "react-toastify";





const TourManagerTours = ()=>{


const navigate =
useNavigate();



const [tours,setTours] =
useState([]);



const [loading,setLoading] =
useState(true);



const [search,setSearch] =
useState("");



const [status,setStatus] =
useState("all");







/*
|--------------------------------------------------------------------------
| FETCH TOURS
|--------------------------------------------------------------------------
*/


const fetchTours = async()=>{


try{


const response =
await getManagerTours();


setTours(
response.data.tours
);


}

catch(error){


console.error(error);


toast.error(
"Failed to load tours"
);


}

finally{


setLoading(false);


}


};






useEffect(()=>{


fetchTours();


},[]);









/*
|--------------------------------------------------------------------------
| DELETE TOUR
|--------------------------------------------------------------------------
*/


const handleDelete =
async(id)=>{


const confirmDelete =
window.confirm(
"Delete this tour?"
);


if(!confirmDelete)
return;





try{


await deleteTour(id);



toast.success(
"Tour deleted"
);



fetchTours();



}

catch(error){


console.error(error);


toast.error(
"Delete failed"
);


}



};








const filteredTours =

tours.filter(
tour=>{


const matchesSearch =

tour.title
?.toLowerCase()
.includes(
search.toLowerCase()
);



const matchesStatus =

status==="all"

?

true

:

tour.status===status;



return (

matchesSearch &&

matchesStatus

);


}

);







return (

<div

className="
min-h-screen
bg-gray-100
p-6
"

>





{/* HEADER */}


<div

className="
flex
justify-between
items-center
mb-8
"

>


<div>


<h1

className="
text-3xl
font-bold
text-gray-800
"

>

Manage Tours

</h1>



<p

className="
text-gray-500
"

>

Create, update and manage travel experiences

</p>


</div>







<button

onClick={()=>navigate(
"/tour-manager/create-tour"
)}

className="
flex
items-center
gap-2
bg-orange-600
text-white
px-5
py-3
rounded-lg
shadow
"

>


<FaPlus/>

Create Tour


</button>


</div>









{/* FILTER BAR */}


<div

className="
bg-white
rounded-xl
shadow
p-5
mb-6
flex
flex-col
md:flex-row
gap-4
"

>



<div

className="
flex
items-center
border
rounded-lg
px-3
flex-1
"

>


<FaSearch
className="
text-gray-400
"
/>



<input


value={search}


onChange={(e)=>
setSearch(e.target.value)
}


placeholder="Search tours..."


className="
w-full
p-3
outline-none
"

/>


</div>






<select

value={status}

onChange={(e)=>
setStatus(e.target.value)
}

className="
border
rounded-lg
px-4
"

>


<option value="all">
All Status
</option>


<option value="upcoming">
Upcoming
</option>


<option value="ongoing">
Ongoing
</option>


<option value="completed">
Completed
</option>


<option value="cancelled">
Cancelled
</option>


</select>


</div>









{/* TABLE */}


<div

className="
bg-white
rounded-xl
shadow
overflow-hidden
"

>


<div

className="
overflow-x-auto
"

>


<table

className="
w-full
text-left
"

>


<thead

className="
bg-gray-50
border-b
"

>


<tr>


<th className="p-4">
Tour
</th>


<th>
Destination
</th>


<th>
Date
</th>


<th>
Capacity
</th>


<th>
Status
</th>


<th>
Actions
</th>


</tr>


</thead>







<tbody>


{

loading

?

<tr>

<td

colSpan="6"

className="
text-center
p-8
"

>

Loading tours...

</td>

</tr>



:


filteredTours.length===0


?


<tr>

<td

colSpan="6"

className="
text-center
p-8
text-gray-500
"

>

No tours found

</td>

</tr>



:


filteredTours.map(

tour=>(


<tr

key={tour._id}

className="
border-b
hover:bg-gray-50
"

>



<td

className="
p-4
font-semibold
"

>

{tour.title}

</td>






<td>

{tour.country}

</td>






<td>

{

tour.date

?

new Date(
tour.date
)
.toLocaleDateString()

:

"N/A"

}

</td>






<td>

{tour.capacity}

</td>






<td>


<span

className="
px-3
py-1
rounded-full
bg-green-100
text-green-700
text-sm
"

>

{tour.status}

</span>


</td>









<td>


<div

className="
flex
gap-3
"

>





{/* EDIT */}

<button

onClick={()=>navigate(

`/tour-manager/edit-tour/${tour._id}`

)}

className="
text-blue-600
"

>

<FaEdit/>

</button>








{/* ASSIGN GUIDE */}

<button

onClick={()=>navigate(

`/tour-manager/assign-guide/${tour._id}`

)}

className="
text-green-600
"

>

<FaUserTie/>

</button>








{/* ASSIGN VEHICLE */}

<button

onClick={()=>navigate(

`/tour-manager/assign-vehicle/${tour._id}`

)}

className="
text-purple-600
"

>

<FaCar/>

</button>








{/* AVAILABILITY */}

<button

onClick={()=>navigate(

`/tour-manager/availability/${tour._id}`

)}

className="
text-orange-600
"

>

<FaCalendarAlt/>

</button>








{/* DELETE */}

<button

onClick={()=>handleDelete(
tour._id
)}

className="
text-red-600
"

>

<FaTrash/>

</button>




</div>


</td>







</tr>


)

)


}


</tbody>



</table>


</div>


</div>





</div>


);


};



export default TourManagerTours;