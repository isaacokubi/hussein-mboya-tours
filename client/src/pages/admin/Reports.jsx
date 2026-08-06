

import React from "react";

import {
useQuery
}
from "@tanstack/react-query";


import {
getDailyReport,
getTourReport,
getAgentReport

}
from "../../api/adminReportApi";



export default function Reports(){


const {
data:daily
}=useQuery({

queryKey:["daily-report"],

queryFn:getDailyReport

});



const {
data:tours
}=useQuery({

queryKey:["tour-report"],

queryFn:getTourReport

});



const {
data:agents
}=useQuery({

queryKey:["agent-report"],

queryFn:getAgentReport

});



return (

<div className="p-6 space-y-6">


<h1 className="text-3xl font-bold">
Booking Reports
</h1>



<div className="grid md:grid-cols-3 gap-5">


<div className="bg-white shadow rounded p-5">

<h2>
Today's Bookings
</h2>

<p className="text-3xl font-bold">
{daily?.count || 0}
</p>

</div>




<div className="bg-white shadow rounded p-5">

<h2>
Tour Performance
</h2>

<p className="text-3xl font-bold">
{tours?.data?.length || 0}
</p>

</div>




<div className="bg-white shadow rounded p-5">

<h2>
Agents
</h2>

<p className="text-3xl font-bold">
{agents?.data?.length || 0}
</p>

</div>


</div>


</div>

)

}

