/**
 * Purpose: AICustomer reusable UI component. Main declarations: AICustomer, generateReply.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useState } from "react";

// Load ../api/adminAIApi so this module can use its exported dependencies.
import {
  generateCustomerReply
} from "../api/adminAIApi";


// Define AICustomer; its parameters and body implement this operation.
export default function AICustomer(){

  // Declare [customerMessage,setCustomerMessage] for use by the surrounding module or function.
  const [customerMessage,setCustomerMessage] = useState("");

  // Declare [reply,setReply] for use by the surrounding module or function.
  const [reply,setReply] = useState("");

  // Declare [loading,setLoading] for use by the surrounding module or function.
  const [loading,setLoading] = useState(false);



  // Declare generateReply for use by the surrounding module or function.
  const generateReply = async()=>{

    // Check the condition (!customerMessage.trim()) and run the matching branch.
    if(!customerMessage.trim()) return;


    // Run this operation with a dedicated error-handling path for failures.
    try{

      // Perform the side effect or state update expressed on the following line.
      setLoading(true);


      // Declare response for use by the surrounding module or function.
      const response =
        await generateCustomerReply({
          customerMessage
        });


      // Perform the side effect or state update expressed on the following line.
      setReply(
        response?.data?.reply ||
        "No response generated."
      );


    }catch(error){

      // Perform the side effect or state update expressed on the following line.
      console.error(
        "AI customer reply error:",
        error
      );


      // Perform the side effect or state update expressed on the following line.
      setReply(
        "Unable to generate customer response."
      );


    }finally{

      // Perform the side effect or state update expressed on the following line.
      setLoading(false);

    }

  };



  // Return the expression shown below to the caller.
  return (

    <div className="bg-white rounded-xl shadow p-6">


      <h2 className="text-xl font-bold mb-3">
        AI Customer Support Agent
      </h2>


      <p className="text-gray-600 mb-4">
        Paste a customer message and let AI prepare a professional response.
      </p>



      <textarea

        value={customerMessage}

        onChange={
          e=>setCustomerMessage(e.target.value)
        }

        placeholder="Example: I paid but my booking is not confirmed..."

        className="w-full border rounded-lg p-3 h-32"

      />



      <button

        onClick={generateReply}

        disabled={loading}

        className="mt-3 px-5 py-2 rounded-lg bg-black text-white"

      >

        {
          loading
          ? "Generating..."
          : "Generate Reply"
        }

      </button>



      {
        reply && (

          <div className="mt-5 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">

            <h3 className="font-bold mb-2">
              Suggested Response
            </h3>

            {reply}

          </div>

        )
      }


    </div>

  );

}
