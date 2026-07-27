import React from "react";


const StatCard=({
title,
value,
icon,
color

})=>{


return (

<div className="
bg-white
rounded-xl
shadow
p-5
flex
items-center
justify-between
">


<div>

<p className="
text-gray-500
text-sm
">
{title}
</p>


<h2 className="
text-2xl
font-bold
mt-2
">
{value}
</h2>


</div>



<div className={`
${color}
text-white
p-3
rounded-full
`}>

{icon}

</div>


</div>

)

};


export default StatCard;