export default function UserAnalytics({

users={}

}){


return (




</section>


);

}



function Card({
title,
value
}){


return (

<div className="
border
rounded-lg
p-5
">


<p className="
text-gray-500
">

{title}

</p>



<h3 className="
text-3xl
font-bold
mt-2
">

{
value || 0
}

</h3>


</div>

);


}