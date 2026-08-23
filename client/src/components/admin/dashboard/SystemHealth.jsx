export default function SystemHealth(){


const systems=[

{
name:"Database",
status:"Online"
},

{
name:"API Server",
status:"Online"
},

{
name:"Cloudinary",
status:"Connected"
},

{
name:"M-Pesa Gateway",
status:"Active"
}

];



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

System Health

</h2>



<div className="
grid
md:grid-cols-4
gap-4
">


{

systems.map(
system=>(


<div

key={system.name}

className="
border
rounded-lg
p-4
"

>


<p className="
font-semibold
">

{
system.name
}

</p>



<p className="
text-green-600
mt-2
">

● {typeof system.status === "object" ? (system.status.status || "unknown") : system.status || "unknown"}

</p>


</div>


)

)

}



</div>


</section>


);


}
