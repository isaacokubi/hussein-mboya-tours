/**
 * Purpose: Coupon Input reusable UI component. Main declarations: CouponInput, submit.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useState } from "react";





// Define CouponInput; its parameters and body implement this operation.
export default function CouponInput({

    onApply,

    loading = false,

    error = ""

}){





// Declare [ code, setCode ] for use by the surrounding module or function.
const [

code,

setCode

]

=

useState("");









// Declare submit for use by the surrounding module or function.
const submit = ()=>{


// Declare coupon for use by the surrounding module or function.
const coupon = code

.trim()

.toUpperCase();





// Check the condition (!coupon) and run the matching branch.
if(!coupon){

// Return the result to the caller.
return;

}



// Perform the side effect or state update expressed on the following line.
onApply(coupon);



};









// Return the expression shown below to the caller.
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
