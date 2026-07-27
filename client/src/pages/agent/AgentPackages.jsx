import useAgentPackages
from "../../hooks/useAgentPackages";


export default function AgentPackages(){


const {

data,

isLoading

}

=
useAgentPackages();



if(isLoading)

return (

<div>
Loading tours...
</div>

);



return (

<div>


<h1
className="
text-2xl
font-bold
mb-6
">

Tour Packages

</h1>



<div
className="
grid
md:grid-cols-3
gap-6
"
>


{

data.map(pkg=>(


<div

key={pkg._id}

className="
bg-white
rounded-xl
shadow
overflow-hidden
"

>


<img

src={pkg.coverImage}

className="
h-48
w-full
object-cover
"

/>



<div
className="
p-5
"
>


<h2
className="
font-bold
text-lg
"
>

{pkg.title}

</h2>



<p>

{pkg.destination}

</p>



<p
className="
font-semibold
mt-3
"
>

Agent Price:

KES {pkg.agentPrice.toLocaleString()}

</p>



<button

className="
mt-4
bg-green-700
text-white
px-4
py-2
rounded
"

>

Create Booking

</button>



</div>


</div>


))

}


</div>


</div>

)

}