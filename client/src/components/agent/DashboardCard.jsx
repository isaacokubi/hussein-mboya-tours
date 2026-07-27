export default function DashboardCard({
title,
value,
icon
}){


return (

<div
className="
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
"
>


<div>


<p
className="
text-gray-500
"
>

{title}

</p>


<h2
className="
text-3xl
font-bold
"
>

{value}

</h2>


</div>



{icon}


</div>


</div>


)

}