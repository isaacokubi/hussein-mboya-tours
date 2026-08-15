import { useState } from "react";

import {
  generateCustomerReply
} from "../api/adminAIApi";


export default function AICustomer(){

  const [customerMessage,setCustomerMessage] = useState("");

  const [reply,setReply] = useState("");

  const [loading,setLoading] = useState(false);



  const generateReply = async()=>{

    if(!customerMessage.trim()) return;


    try{

      setLoading(true);


      const response =
        await generateCustomerReply({
          customerMessage
        });


      setReply(
        response?.data?.reply ||
        "No response generated."
      );


    }catch(error){

      console.error(
        "AI customer reply error:",
        error
      );


      setReply(
        "Unable to generate customer response."
      );


    }finally{

      setLoading(false);

    }

  };



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
