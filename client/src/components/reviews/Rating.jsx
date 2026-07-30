export default function Rating({
value
}){


return (

<div
className="
flex
"
>

{

[1,2,3,4,5]

.map(

star=>(


<span

key={star}

className={

star <= value

?

"text-yellow-500"

:

"text-gray-300"

}

>

★


</span>


)

)

}

</div>

);

}