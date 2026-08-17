import { useState } from "react";

import {
  askAdminAI
} from "../../api/adminAIApi";


export default function AIOperationsCopilot(){

  const [message,setMessage] = useState("");

  const [reply,setReply] = useState("");

  const [loading,setLoading] = useState(false);



  const ask = async()=>{

    if(!message.trim()) return;


    try{

      setLoading(true);

      const response =
        await askAdminAI(message);


      setReply(
        response?.data?.reply ||
        "No response received."
      );


    }catch(error){

      console.error(
        "AI query failed",
        error
      );

      setReply(
        "AI assistant unavailable."
      );

    }finally{

      setLoading(false);

    }

  };



  const suggestions = [

    "Give me today's business summary",

    "Which tours need promotion?",

    "Analyze booking performance",

    "How can we increase revenue?",

    "Find possible operational problems"

  ];



  return (

    <div className="bg-white rounded-xl shadow p-6">


      <h2 className="text-xl font-bold mb-3">
        AI Operations Copilot
      </h2>


      <div className="flex flex-wrap gap-2 mb-4">

        {suggestions.map((item)=>(

          <button

            key={item}

            onClick={()=>setMessage(item)}

            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"

          >

            {item}

          </button>

        ))}

      </div>



      <textarea

        value={message}

        onChange={
          e=>setMessage(e.target.value)
        }

        placeholder="Ask your AI business assistant..."

        className="w-full border rounded-lg p-3 h-28"

      />



      <button

        onClick={ask}

        disabled={loading}

        className="mt-3 px-5 py-2 rounded-lg bg-black text-white"

      >

        {loading ? "Analyzing..." : "Ask AI"}

      </button>



      {reply && (

        <div className="mt-5 p-4 rounded-lg bg-gray-50 whitespace-pre-wrap">

          {reply}

        </div>

      )}


    </div>

  );

}
