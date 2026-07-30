import {
  useState,
  useContext
} from "react";


import {
  useNavigate
} from "react-router-dom";


import {
  toast
} from "react-toastify";


import {
  AuthContext
} from "../context/AuthContext";



export default function Register(){


  const navigate = useNavigate();


  const {
    register
  } = useContext(AuthContext);




  const [formData,setFormData]=useState({

    name:"",
    email:"",
    phone:"",
    password:"",

  });



  const [loading,setLoading]=useState(false);




  const handleChange=(e)=>{


    setFormData({

      ...formData,

      [e.target.name]:
      e.target.value

    });


  };




  const handleSubmit=async(e)=>{


    e.preventDefault();


    try{


      setLoading(true);



      await register(
        formData
      );



      toast.success(
        "Account created successfully"
      );



      navigate("/dashboard");



    }catch(error){


      toast.error(

        error?.response?.data?.message ||
        "Registration failed"

      );


    }finally{

      setLoading(false);

    }


  };





  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">


      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">


        <h1 className="text-3xl font-bold text-center mb-6">

          Create Account

        </h1>



        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >



          <input

            type="text"

            name="name"

            placeholder="Full name"

            value={formData.name}

            onChange={handleChange}

            required

            className="w-full border rounded-lg p-3"

          />




          <input

            type="email"

            name="email"

            placeholder="Email address"

            value={formData.email}

            onChange={handleChange}

            required

            className="w-full border rounded-lg p-3"

          />




          <input

            type="text"

            name="phone"

            placeholder="Phone number"

            value={formData.phone}

            onChange={handleChange}

            required

            className="w-full border rounded-lg p-3"

          />




          <input

            type="password"

            name="password"

            placeholder="Password"

            value={formData.password}

            onChange={handleChange}

            required

            className="w-full border rounded-lg p-3"

          />





          <button

            disabled={loading}

            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"

          >


            {

              loading

              ?

              "Creating account..."

              :

              "Register"

            }


          </button>



        </form>




        <p className="text-center mt-5">


          Already have an account?


          <span

            onClick={()=>navigate("/login")}

            className="text-blue-600 cursor-pointer ml-2"

          >

            Login

          </span>


        </p>



      </div>


    </div>

  );


}