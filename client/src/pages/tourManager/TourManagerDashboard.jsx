import React, {
    useEffect,
    useState
} from "react";


import {
    useNavigate
} from "react-router-dom";


import axios from "axios";


import {

    FaMapMarkedAlt,
    FaCalendarCheck,
    FaUsers,
    FaMoneyBillWave,
    FaCar,
    FaUserTie,
    FaClipboardList,
    FaChartLine,
    FaBell,

} from "react-icons/fa";





const API_URL =
import.meta.env.VITE_API_URL ||
"http://localhost:5000";






const TourManagerDashboard = () => {


    const navigate = useNavigate();



    const [dashboard,setDashboard] = useState({

        stats:{

            totalTours:0,

            upcomingTours:0,

            totalCustomers:0,

            revenue:0

        },


        upcomingTours:[],


        recentBookings:[]

    });





    const [loading,setLoading] =
    useState(true);









    useEffect(()=>{


        const fetchDashboard = async()=>{


            try{


                const response =
                await axios.get(

                    `${API_URL}/api/tour-manager/dashboard`,

                    {

                        headers:{

                            Authorization:

                            `Bearer ${localStorage.getItem(
                                "token"
                            )}`

                        }

                    }

                );





                setDashboard(
                    response.data
                );



            }


            catch(error){


                console.error(

                    "Dashboard loading error",

                    error

                );


            }


            finally{


                setLoading(false);


            }



        };





        fetchDashboard();



    },[]);











    const stats = [


        {

            title:"Total Tours",

            value:
            dashboard.stats.totalTours,

            icon:
            <FaMapMarkedAlt/>,

            color:
            "bg-blue-600"

        },



        {

            title:"Upcoming Tours",

            value:
            dashboard.stats.upcomingTours,

            icon:
            <FaCalendarCheck/>,

            color:
            "bg-green-600"

        },



        {

            title:"Total Customers",

            value:
            dashboard.stats.totalCustomers,

            icon:
            <FaUsers/>,

            color:
            "bg-purple-600"

        },



        {

            title:"Revenue",

            value:

            `$${dashboard.stats.revenue}`,

            icon:
            <FaMoneyBillWave/>,

            color:
            "bg-yellow-600"

        }


    ];









return (

<div
className="
min-h-screen
bg-gray-100
p-6
"
>





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

Hussein Mboya Tours

</h1>




<p
className="
text-gray-500
"
>

Tour Manager Dashboard

</p>


</div>







<div
className="
flex
items-center
gap-3
"
>


<button
className="
bg-white
p-3
rounded-full
shadow
"
>

<FaBell
className="
text-orange-500
"
/>

</button>





<div
className="
bg-white
px-4
py-2
rounded-lg
shadow
"
>

Tour Manager

</div>



</div>



</div>









<div
className="
grid
md:grid-cols-4
gap-6
mb-8
"
>


{

stats.map(

(item,index)=>(


<div

key={index}

className="
bg-white
rounded-xl
shadow
p-5
flex
justify-between
items-center
"

>


<div>


<p
className="
text-gray-500
"
>

{item.title}

</p>




<h2
className="
text-3xl
font-bold
mt-2
"
>


{

loading

?

"..."

:

item.value

}


</h2>


</div>






<div

className={`
${item.color}
text-white
p-4
rounded-full
text-xl
`}

>

{item.icon}

</div>



</div>



)


)


}


</div>









<div
className="
grid
lg:grid-cols-3
gap-6
"
>







<div
className="
lg:col-span-2
bg-white
rounded-xl
shadow
p-6
"
>



<div
className="
flex
justify-between
mb-5
"
>


<h2
className="
text-xl
font-bold
"
>

Upcoming Tours

</h2>






<button

onClick={()=>navigate(
"/tour-manager/create-tour"
)}

className="
bg-orange-600
text-white
px-4
py-2
rounded-lg
"

>

Create Tour

</button>



</div>







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


<thead>

<tr
className="
border-b
"
>

<th className="p-3">
Tour
</th>


<th>
Date
</th>


<th>
Guests
</th>


<th>
Guide
</th>


<th>
Status
</th>


</tr>

</thead>





<tbody>


{

dashboard.upcomingTours.length === 0

?

<tr>

<td
colSpan="5"
className="
text-center
p-5
text-gray-500
"
>

No upcoming tours found

</td>

</tr>



:


dashboard.upcomingTours.map(

(tour,index)=>(


<tr

key={index}

className="
border-b
hover:bg-gray-50
"

>


<td
className="
p-3
font-semibold
"
>

{tour.name}

</td>



<td>

{tour.date}

</td>



<td>

{tour.guests}

</td>



<td>

{tour.guide}

</td>




<td>

<span
className="
bg-green-100
text-green-700
px-3
py-1
rounded-full
text-sm
"
>

{tour.status}

</span>


</td>



</tr>


)


)


}



</tbody>


</table>



</div>


</div>









<div
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

Quick Actions

</h2>






<div
className="
space-y-4
"
>





<button

onClick={()=>navigate(
"/tour-manager/tours"
)}

className="
w-full
flex
items-center
gap-3
bg-blue-600
text-white
p-4
rounded-lg
"

>

<FaClipboardList/>

Manage Tours

</button>







<button

onClick={()=>navigate(
"/tour-manager/guides"
)}

className="
w-full
flex
items-center
gap-3
bg-green-600
text-white
p-4
rounded-lg
"

>

<FaUserTie/>

Assign Guides

</button>







<button

onClick={()=>navigate(
"/tour-manager/reports"
)}

className="
w-full
flex
items-center
gap-3
bg-purple-600
text-white
p-4
rounded-lg
"

>

<FaChartLine/>

View Reports

</button>








<button

onClick={()=>navigate(
"/tour-manager/vehicles"
)}

className="
w-full
flex
items-center
gap-3
bg-orange-600
text-white
p-4
rounded-lg
"

>

<FaCar/>

Manage Vehicles

</button>





</div>


</div>





</div>









<div
className="
mt-8
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

Recent Bookings

</h2>





<div
className="
grid
md:grid-cols-3
gap-5
"
>


{


dashboard.recentBookings.length===0


?


<p
className="
text-gray-500
"
>

No bookings found

</p>



:


dashboard.recentBookings.map(

(booking,index)=>(


<div

key={index}

className="
border
rounded-lg
p-5
"

>


<h3
className="
font-bold
"
>

{booking.customer}

</h3>



<p
className="
text-gray-500
"
>

{booking.tour}

</p>




<p>

Guests: {booking.guests}

</p>





<span
className="
inline-block
mt-3
bg-green-100
text-green-700
px-3
py-1
rounded-full
"
>

{booking.payment}

</span>



</div>


)


)


}



</div>



</div>








</div>


);


};






export default TourManagerDashboard;