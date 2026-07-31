import {
    useState
}
from "react";





export default function CouponInput({

    onApply,

    loading = false,

    error = ""

}){





const [

code,

setCode

]

=

useState("");









const submit = ()=>{


const coupon = code

.trim()

.toUpperCase();





if(!coupon){

return;

}



onApply(coupon);



};









return (

<div

className="
space-y-2
"

>





<div

className="
flex
gap-2
"

>





<input


value={code}


disabled={loading}


className="
border
p-3
rounded-lg
flex-1
"

placeholder="Coupon code"



onChange={

e=>

setCode(
e.target.value
)

}



/>








<button


disabled={loading || !code.trim()}


onClick={submit}


className="
bg-yellow-600
text-white
px-5
rounded-lg
disabled:opacity-50
"


>


{

loading

?

"Checking..."

:

"Apply"

}



</button>







</div>







{

error &&

<p

className="
text-red-600
text-sm
"

>

{error}

</p>

}



</div>


);


}