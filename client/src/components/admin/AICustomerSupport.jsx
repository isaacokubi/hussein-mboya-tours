/**
 * Purpose: AICustomer Support reusable UI component. Main declarations: AICustomerSupport, generate.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useState } from "react";

// Load ../../api/adminAIApi so this module can use its exported dependencies.
import {
  generateCustomerReply
} from "../../api/adminAIApi";


// Define AICustomerSupport; its parameters and body implement this operation.
export default function AICustomerSupport(){


// Declare [message,setMessage] for use by the surrounding module or function.
const [message,setMessage]=useState("");

// Declare [reply,setReply] for use by the surrounding module or function.
const [reply,setReply]=useState("");

// Declare [loading,setLoading] for use by the surrounding module or function.
const [loading,setLoading]=useState(false);



// Declare generate for use by the surrounding module or function.
const generate = async()=>{

// Run this operation with a dedicated error-handling path for failures.
try{

// Perform the side effect or state update expressed on the following line.
setLoading(true);


// Declare response for use by the surrounding module or function.
const response =
await generateCustomerReply({

customerMessage:message

});


// Perform the side effect or state update expressed on the following line.
setReply(
response?.data?.reply || ""
);


}catch(error){

// Perform the side effect or state update expressed on the following line.
console.error(error);

// Perform the side effect or state update expressed on the following line.
setReply(
"Unable to generate response."
);

}
finally{

// Perform the side effect or state update expressed on the following line.
setLoading(false);

}

};



// Return the expression shown below to the caller.
return (

<div className="bg-white rounded-xl shadow p-6">


<h2 className="text-xl font-bold mb-4">
AI Customer Support Agent
</h2>


<textarea

className="w-full border rounded-lg p-3 h-32"

placeholder="Paste customer message..."

value={message}

onChange={
e=>setMessage(e.target.value)
}

/>


<button

onClick={generate}

disabled={loading}

className="mt-3 px-5 py-2 bg-black text-white rounded-lg"

>

{
loading
?
"Generating..."
:
"Generate Reply"
}

</button>



{
reply &&

<div className="mt-5 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">

{reply}

</div>

}


</div>

);

}
