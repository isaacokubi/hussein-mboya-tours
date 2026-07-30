export default function LoyaltyCard({
loyalty
}){


return (

<div
className="
bg-gradient-to-r
p-6
rounded-xl
text-white
"
>


<h2
className="
text-2xl
font-bold
"
>

Hussein Rewards

</h2>



<p>

Tier:

{
loyalty.tier
}

</p>



<p>

Points:

{
loyalty.points
}

</p>


</div>

);

}