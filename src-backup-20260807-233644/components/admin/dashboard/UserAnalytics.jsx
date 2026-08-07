export default function UserAnalytics({

users={}

}){


return (

<section className="
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

User Analytics

</h2>



<div className="
grid
md:grid-cols-4
gap-5
">


<Card

title="Customers"

value={
users.customers
}

/>


<Card

title="Admins"

value={
users.admins
}

/>


<Card

title="Agents"

value={
users.agents
}

/>


<Card

title="Tour Guides"

value={
users.guides
}

/>


</div>


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