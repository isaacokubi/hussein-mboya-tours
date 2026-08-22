import {
  useState
} from "react";

import {
  askAI
} from "../../api/aiApi";


export default function AIAssistant(){

  const [open,setOpen] =
    useState(false);

  const [message,setMessage] =
    useState("");

  const [messages,setMessages] =
    useState([
      {
        role:"assistant",
        text:
        "Hello 👋 I can help you plan your African adventure."
      }
    ]);


  const sendMessage =
    async()=>{

      if(!message.trim())
        return;


      const userMessage =
      {
        role:"user",
        text:message
      };


      setMessages(prev=>[
        ...prev,
        userMessage
      ]);


      const text =
        message;


      setMessage("");


      try{

        const result =
          await askAI(text);


        setMessages(prev=>[
          ...prev,
          {
            role:"assistant",
            text:
              result.data.reply
          }
        ]);


      }catch(error){

        setMessages(prev=>[
          ...prev,
          {
            role:"assistant",
            text:
            "Sorry, I am temporarily unavailable."
          }
        ]);

      }

    };


return (

<div className="fixed bottom-5 right-5 z-50">


{
open &&

<div className="
bg-white
shadow-xl
rounded-xl
w-80
h-96
mb-3
flex
flex-col
">


<div className="
p-3
bg-green-700
text-white
rounded-t-xl
">

AI Travel Assistant

</div>


<div className="
flex-1
overflow-y-auto
p-3
space-y-2
">

{
messages.map(
(message,index)=>(

<div
key={index}
className={
message.role==="user"
?
"text-right"
:
"text-left"
}
>

<span className="
inline-block
bg-gray-100
rounded-lg
p-2
text-sm
">

{message.text}

</span>

</div>

))
}

</div>


<div className="p-2 flex gap-2">

<input

value={message}

onChange={
e=>setMessage(
e.target.value
)
}

onKeyDown={
e=>{
if(e.key==="Enter")
sendMessage();
}
}

className="
border
rounded
p-2
flex-1
"

/>


<button

onClick={sendMessage}

className="
bg-green-700
text-white
px-3
rounded
"

>

Send

</button>


</div>


</div>

}


<button

onClick={
()=>setOpen(!open)
}

className="
bg-green-700
text-white
rounded-full
w-14
h-14
shadow-lg
"

>

🤖

</button>


</div>

);

}
