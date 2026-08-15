import { useState } from "react";

import {
  generateCustomerReply
} from "../../api/adminAIApi";


export default function AICustomerSupport(){


const [message,setMessage]=useState("");

const [reply,setReply]=useState("");

const [loading,setLoading]=useState(false);



const generate = async()=>{

try{

setLoading(true);


const response =
await generateCustomerReply({

customerMessage:message

});


setReply(
response?.data?.reply || ""
);


}catch(error){

console.error(error);

setReply(
"Unable to generate response."
);

}
finally{

setLoading(false);

}

};



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
