/**
 * Purpose: AIOperations Copilot reusable UI component. Main declarations: AIOperationsCopilot, ask.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useState } from "react";

// Load ../../api/adminAIApi so this module can use its exported dependencies.
import {
  askAdminAI
} from "../../api/adminAIApi";


// Define AIOperationsCopilot; its parameters and body implement this operation.
export default function AIOperationsCopilot(){

  // Declare [message,setMessage] for use by the surrounding module or function.
  const [message,setMessage] = useState("");

  // Declare [reply,setReply] for use by the surrounding module or function.
  const [reply,setReply] = useState("");

  // Declare [loading,setLoading] for use by the surrounding module or function.
  const [loading,setLoading] = useState(false);



  // Declare ask for use by the surrounding module or function.
  const ask = async()=>{

    // Check the condition (!message.trim()) and run the matching branch.
    if(!message.trim()) return;


    // Run this operation with a dedicated error-handling path for failures.
    try{

      // Perform the side effect or state update expressed on the following line.
      setLoading(true);

      // Declare response for use by the surrounding module or function.
      const response =
        await askAdminAI(message);


      // Perform the side effect or state update expressed on the following line.
      setReply(
        response?.data?.reply ||
        "No response received."
      );


    }catch(error){

      // Perform the side effect or state update expressed on the following line.
      console.error(
        "AI query failed",
        error
      );

      // Perform the side effect or state update expressed on the following line.
      setReply(
        "AI assistant unavailable."
      );

    }finally{

      // Perform the side effect or state update expressed on the following line.
      setLoading(false);

    }

  };



  // Declare suggestions for use by the surrounding module or function.
  const suggestions = [

    "Give me today's business summary",

    "Which tours need promotion?",

    "Analyze booking performance",

    "How can we increase revenue?",

    "Find possible operational problems"

  ];



  // Return the expression shown below to the caller.
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
