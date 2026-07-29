import { Link } from "react-router-dom";


export default function DestinationCard({
  destination
}){


return (

<div

className="
rounded-xl
overflow-hidden
shadow-lg
bg-white
"

>


<img

src={
destination.images?.[0] ||
"/images/destination-placeholder.jpg"
}

alt={
destination.name || "Destination"
}

className="
h-60
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
text-2xl
font-bold
"

>

{destination.name}

</h2>





<p>

{destination.country}

</p>





<Link

to={`/destinations/${destination.slug}`}

className="
text-yellow-700
inline-block
mt-3
"

>

Explore

</Link>



</div>


</div>


);

}