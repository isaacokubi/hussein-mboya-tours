

import React from "react";

import {
Users,
ShieldCheck,
Database,
CreditCard,
MapPin,
CalendarCheck,
TrendingUp,
Activity
} from "lucide-react";



const cards=[

{
title:"Total Users",
value:"2,450",
icon:Users,
color:"blue"
},

{
title:"Monthly Bookings",
value:"486",
icon:CalendarCheck,
color:"green"
},

{
title:"Revenue",
value:"KES 8.4M",
icon:TrendingUp,
color:"purple"
},

{
title:"Security Status",
value:"Protected",
icon:ShieldCheck,
color:"emerald"
}

];




function StatusCard({
title,
status,
detail,
icon:Icon
}){

return (

<div className="
bg-white
rounded-xl
shadow
p-5
border
">


<div className="
flex
justify-between
items-center
mb-3
">

<h3 className="font-bold">
{title}
</h3>

{
Icon &&
<Icon size={22}/>
}

</div>


<p className="
text-xl
font-bold
text-green-600
">
{status}
</p>


<p className="
text-sm
text-gray-500
mt-2
">
{detail}
</p>


</div>

)

}



export default function SuperAdminDashboard(){



return (

<section className="space-y-8">



<div>

<h1 className="
text-3xl
md:text-4xl
font-bold
">

Super Admin Control Center

</h1>


<p className="
text-gray-500
mt-2
">

Complete platform governance and tour business intelligence

</p>


</div>





<div className="
grid
grid-cols-1
sm:grid-cols-2
xl:grid-cols-4
gap-5
">


{
cards.map(
(card)=>(

<div
key={card.title}
className="
bg-white
rounded-xl
shadow
p-6
border
">


<div className="
flex
justify-between
items-center
">


<div>

<p className="
text-gray-500
">
{card.title}
</p>


<h2 className="
text-3xl
font-bold
mt-2
">

{card.value}

</h2>


</div>


<card.icon size={32}/>


</div>


</div>


)

)

}



</div>





<div className="
grid
grid-cols-1
lg:grid-cols-2
gap-6
">



<div className="
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

Tour Operations

</h2>



<div className="space-y-5">


<div>

<p className="font-semibold">
Maasai Mara Safari
</p>

<p className="text-sm text-gray-500">
245 bookings this month
</p>

</div>



<div>

<p className="font-semibold">
Mombasa Beach Holiday
</p>

<p className="text-sm text-gray-500">
180 bookings this month
</p>

</div>




<div>

<p className="font-semibold">
Mount Kenya Adventure
</p>

<p className="text-sm text-gray-500">
92 bookings this month
</p>

</div>


</div>


</div>




<div className="
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

Recent Activity

</h2>


<div className="space-y-4">


<p>
✓ New booking received
</p>

<p>
✓ Payment verified through M-Pesa
</p>

<p>
✓ Staff account created
</p>

<p>
✓ Security scan completed
</p>


</div>


</div>


</div>





<div className="
grid
grid-cols-1
sm:grid-cols-2
xl:grid-cols-4
gap-5
">


<StatusCard
title="API Services"
status="ONLINE"
detail="All endpoints responding"
icon={Activity}
/>


<StatusCard
title="Database"
status="HEALTHY"
detail="MongoDB connected"
icon={Database}
/>


<StatusCard
title="Payments"
status="ACTIVE"
detail="M-Pesa gateway operational"
icon={CreditCard}
/>


<StatusCard
title="Tours"
status="RUNNING"
detail="Operations active"
icon={MapPin}
/>


</div>



</section>


)

}

