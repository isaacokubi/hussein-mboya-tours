import {
useState
}
from "react";


export default function CouponInput({

onApply

}){


const [
code,
setCode
]
=
useState("");



return (

<div
className="
flex
gap-2
"
>


<input

className="
border p-3
"

placeholder="
Coupon code
"

onChange={
e=>
setCode(
e.target.value
)
}

/>



<button

onClick={()=>onApply(code)}

className="
bg-yellow-600
text-white
px-5
"

>

Apply

</button>


</div>

);

}