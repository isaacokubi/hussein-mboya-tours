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



export default function Login() {


  const navigate = useNavigate();


  const {
    login
  } = useContext(AuthContext);



  const [formData, setFormData] = useState({

    email: "",

    password: ""

  });



  const [loading, setLoading] = useState(false);





  const handleChange = (e)=>{


    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });


  };








  const handleSubmit = async(e)=>{


    e.preventDefault();



    try{


      setLoading(true);



      const result = await login(

        formData.email,

        formData.password

      );





      console.log(
        "LOGIN RESPONSE:",
        result
      );





      toast.success(
        "Login successful"
      );








      /*
      |--------------------------------------------------------------------------
      | ROLE DETECTION
      |--------------------------------------------------------------------------
      |
      |
      |--------------------------------------------------------------------------
      */


      let role = "";





      if(

        typeof result?.user?.role === "string"

      ){


        role =

        result.user.role.toLowerCase();


      }






      else if(

        result?.user?.role?.name

      ){


        role =

        result.user.role.name.toLowerCase();


      }







      /*
      |--------------------------------------------------------------------------
      | NORMALIZE ROLE
      |--------------------------------------------------------------------------
      |
      | Removes:
      | spaces
      | underscores
      | hyphens
      |
      |--------------------------------------------------------------------------
      */


      role = role.replace(

        /[\s_-]/g,

        ""

      );







      console.log(

        "Logged User:",

        result?.user

      );




      console.log(

        "Detected Role:",

        role

      );








      /*
      |--------------------------------------------------------------------------
      | ROLE REDIRECTS
      |--------------------------------------------------------------------------
      */


      switch(role){


        case "admin":

          navigate("/admin");

          break;





        case "agent":

          navigate("/agent");

          break;





        case "tourguide":

          navigate("/guide/dashboard");

          break;





        case "tourmanager":

          navigate("/manager/dashboard");

          break;





        case "customer":

        case "user":

        default:

          navigate("/dashboard");

          break;



      }







    }
    catch(error){



      console.error(

        "LOGIN ERROR:",

        error

      );





      toast.error(

        error?.response?.data?.message ||

        "Login failed"

      );




    }
    finally{


      setLoading(false);


    }



  };









  return (


    <div
      className="
      min-h-screen
      flex
      items-center
      justify-center
      bg-gray-100
      "
    >



      <div
        className="
        bg-white
        shadow-lg
        rounded-xl
        p-8
        w-full
        max-w-md
        "
      >




        <h1
          className="
          text-3xl
          font-bold
          text-center
          mb-6
          "
        >

          Login

        </h1>







        <form

          onSubmit={handleSubmit}

          className="
          space-y-4
          "

        >





          <div>


            <label
              className="
              block
              mb-1
              font-medium
              "
            >

              Email

            </label>




            <input


              type="email"


              name="email"


              value={formData.email}


              onChange={handleChange}


              required


              className="
              w-full
              border
              rounded-lg
              p-3
              "


            />


          </div>










          <div>


            <label
              className="
              block
              mb-1
              font-medium
              "
            >

              Password

            </label>






            <input


              type="password"


              name="password"


              value={formData.password}


              onChange={handleChange}


              required


              className="
              w-full
              border
              rounded-lg
              p-3
              "


            />


          </div>









          <button


            disabled={loading}


            className="
            w-full
            bg-blue-600
            hover:bg-blue-700
            text-white
            py-3
            rounded-lg
            transition
            disabled:opacity-50
            "


          >



            {

              loading

              ?

              "Logging in..."

              :

              "Login"

            }




          </button>





        </form>





      </div>





    </div>


  );


}