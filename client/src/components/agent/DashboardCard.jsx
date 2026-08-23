export default function DashboardCard({

title,

value,

icon,

loading = false,

className = ""

}){


return (

<div

className={`
bg-white
rounded-xl
shadow
p-6
transition
hover:shadow-lg
${className}
`}

>


<div

className="
flex
items-center
justify-between
"

>


<div>


<p

className="
text-gray-500
text-sm
font-medium
"

>

{title}

</p>





<h2

className="
text-3xl
font-bold
text-gray-800
mt-2
"

>


{

loading

?

"..."

:

value ?? 0

}


</h2>





</div>






{

icon &&

<div

className="
w-12
h-12
rounded-full
bg-green-100
text-green-700
flex
items-center
justify-center
"

>


{icon}


</div>


}



</div>





</div>


);


}
