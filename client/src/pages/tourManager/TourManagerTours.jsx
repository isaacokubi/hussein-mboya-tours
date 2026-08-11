import {
    useCallback,
    useEffect,
    useState
} from "react";


import {
    useNavigate
} from "react-router-dom";


import {
    FaEdit,
    FaTrash,
    FaSearch,
    FaPlus,
    FaUserTie,
    FaCar,
    FaCalendarAlt,
    FaEye
} from "react-icons/fa";


import {
    toast
} from "react-toastify";


import {
    getManagerTours,
    deleteTour
} from "../../api/tourApi";





const TourManagerTours = ()=>{


const navigate = useNavigate();



const [tours,setTours] = useState([]);


const [loading,setLoading] = useState(true);


const [search,setSearch] = useState("");


const [status,setStatus] = useState("all");
const [page, setPage] = useState(1);
const PAGE_SIZE = 10;









/*
|--------------------------------------------------------------------------
| LOAD TOURS
|--------------------------------------------------------------------------
*/

const fetchTours = useCallback(async()=>{


try{


const response = await getManagerTours();



setTours(

response.data.tours ||

response.data ||

[]

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


}, []);


useEffect(() => {
    const loadTours = async () => {
      await fetchTours();
    };

    loadTours();
  }, [fetchTours]);









/*
|--------------------------------------------------------------------------
| DELETE TOUR
|--------------------------------------------------------------------------
*/


const handleDelete = async(id)=>{


if(
!window.confirm(
"Delete this tour?"
)

)

return;





try{


await deleteTour(id);



toast.success(
"Tour deleted successfully"
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









const filteredTours = tours.filter((tour)=>{


const searchText =
search.toLowerCase();



const title =
tour?.title
?.toLowerCase()
.includes(searchText);



const destination =

typeof tour.destination === "object"

?

tour.destination?.name

:

tour.destination;



const destinationMatch =

destination
?.toLowerCase()
.includes(searchText);





const statusMatch =

status === "all"

?

true

:

tour?.status === status;





return (

(title || destinationMatch)

&&

statusMatch

);


});









const totalPages = Math.max(1, Math.ceil(filteredTours.length / PAGE_SIZE));

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setPage(1);
}, [search, status]);

useEffect(() => {
  if (page > totalPages) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(totalPages);
  }
}, [page, totalPages]);

return (

<div className="
min-h-screen
bg-gray-100
p-6
">







{/* HEADER */}

<div className="
flex
flex-col
md:flex-row
md:justify-between
md:items-center
gap-4
mb-8
">


<div>


<h1 className="
text-3xl
font-bold
text-gray-800
">

Manage Tours

</h1>


<p className="
text-gray-500
">

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














{/* FILTERS */}



<div className="
bg-white
rounded-xl
shadow
p-5
mb-6
flex
flex-col
md:flex-row
gap-4
">


<div className="
flex
items-center
border
rounded-lg
px-3
flex-1
">


<FaSearch className="
text-gray-400
"/>



<input

value={search}

onChange={(e)=>
setSearch(e.target.value)
}

placeholder="
Search tour or destination...
"

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



<div className="
bg-white
rounded-xl
shadow
overflow-hidden
">


<div className="
overflow-x-auto
">


<table className="
w-full
text-left
">


<thead className="
bg-gray-50
border-b
">


<tr>


<th className="
p-4
">

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


filteredTours.length === 0


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


filteredTours.map((tour)=>(



<tr

key={tour?._id}

className="
border-b
hover:bg-gray-50
"

>






<td className="
p-4
font-semibold
">

{tour?.title}

</td>






<td>


{

typeof tour.destination === "object"

?

tour.destination?.name

:

tour.destination || tour.country || "N/A"


}



</td>







<td>


{

tour?.date

?

new Date(
tour?.date
)
.toLocaleDateString()

:

"N/A"


}



</td>







<td>

{tour?.capacity || 0}

</td>








<td>


<span className="
px-3
py-1
rounded-full
bg-green-100
text-green-700
text-sm
">

{tour?.status || "upcoming"}

</span>


</td>








<td>


<div className="
flex
gap-3
">






<button
type="button"
title="View tour"
onClick={()=>navigate(`/tours/${tour?.slug || tour?._id}`)}
className="
text-slate-700
hover:text-emerald-600
"

>

<FaEye/>

</button>

<button

onClick={()=>navigate(
`/tour-manager/edit-tour/${tour?._id}`
)}

className="
text-blue-600
"

>

<FaEdit/>

</button>








<button

onClick={()=>navigate(
`/tour-manager/assign-guide/${tour?._id}`
)}

className="
text-green-600
"

>

<FaUserTie/>

</button>








<button

onClick={()=>navigate(
`/tour-manager/assign-vehicle/${tour?._id}`
)}

className="
text-purple-600
"

>

<FaCar/>

</button>








<button

onClick={()=>navigate(
`/tour-manager/availability/${tour?._id}`
)}

className="
text-orange-600
"

>

<FaCalendarAlt/>

</button>








<button

onClick={()=>handleDelete(
tour?._id
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



))


}




</tbody>



</table>


</div>

<div className="mt-5 flex items-center justify-between rounded-xl bg-white p-4 shadow">
  <span className="text-sm text-gray-500">
    Page {page} of {totalPages} · {filteredTours.length} tour(s)
  </span>
  <div className="flex gap-2">
    <button type="button" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border px-4 py-2 disabled:opacity-40">Previous</button>
    <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-40">Next</button>
  </div>
</div>





</div>
</div>


);


};



export default TourManagerTours;
