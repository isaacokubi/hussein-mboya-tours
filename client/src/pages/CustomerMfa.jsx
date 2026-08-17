import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";


export default function CustomerMfa() {

  const location = useLocation();
  const navigate = useNavigate();

  const userId = location.state?.userId;
  const devPin = location.state?.devPin;

  const [pin,setPin] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);


  const handleVerify = async (e)=>{

    e.preventDefault();

    setError("");

    if(!userId){
      return setError(
        "Your login verification session has expired. Please login again."
      );
    }


    if(!/^\d{4}$/.test(pin)){
      return setError(
        "Enter the 4-digit PIN sent to your registered phone."
      );
    }


    try{

      setLoading(true);


      await api.post("/mfa/customer/verify-pin", {
        userId,
        pin
      });


      navigate("/customer/dashboard");


    }catch(err){

      setError(
        err?.response?.data?.message ||
        "Incorrect or expired PIN."
      );

    }finally{

      setLoading(false);

    }

  };


  const resendPin = async ()=>{

    try{

      setLoading(true);

      await api.post("/mfa/customer/send-pin", {
        userId
      });


    }catch(err){

      setError(
        err?.response?.data?.message ||
        "Unable to send a new PIN."
      );

    }finally{

      setLoading(false);

    }

  };



return (

<div className="min-h-screen flex items-center justify-center bg-gray-100">

<div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">


<h1 className="text-2xl font-bold text-center">
Verify your login
</h1>


<p className="text-center mt-3 text-gray-600">
Enter the 4-digit verification PIN sent to your registered mobile number.
</p>



{devPin && (

<div className="mt-4 rounded-xl bg-yellow-100 p-3 text-center font-bold text-yellow-900">

Development PIN: {devPin}

</div>

)}



<form onSubmit={handleVerify}>


<input

className="border rounded-lg w-full p-3 mt-6 text-center text-xl tracking-widest"

maxLength="4"

value={pin}

onChange={(e)=>setPin(e.target.value)}

/>



{error && (

<p className="text-red-600 mt-3 text-center">

{error}

</p>

)}



<button

disabled={loading}

className="bg-blue-600 text-white w-full mt-5 p-3 rounded-lg"

>

{loading ? "Checking..." : "Verify & Continue"}

</button>


</form>



<button

onClick={resendPin}

className="w-full mt-3 text-blue-600"

>

Send New PIN

</button>


<button

onClick={()=>navigate("/login")}

className="w-full mt-3 text-gray-500"

>

Back to Login

</button>



</div>

</div>

);

}
