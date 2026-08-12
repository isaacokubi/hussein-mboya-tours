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






  const [formData,setFormData] = useState({

    email:"",

    password:""

  });





  const [loading,setLoading] = useState(false);









  const handleChange = (e)=>{


    setFormData({

      ...formData,

      [e.target.name]:e.target.value

    });


  };









  const redirectUser = (user)=>{


    let role = "";



    if(typeof user?.role === "string"){


      role = user.role;


    }

    else if(user?.role?.name){


      role = user.role.name;


    }






    role = role

    .toLowerCase()

    .replace(

      /[\s_-]/g,

      ""

    );







    switch(role){



      case "superadmin":
  case "super_admin":

    navigate("/superadmin");

    break;


  case "admin":
  case "administrator":

    navigate("/admin");

    break;





      case "agent":

        navigate("/agent");

        break;





      case "guide":
      case "tour_guide":
          navigate("/guide/dashboard");
          break;

        case "tourguide":
          navigate("/guide/dashboard");
          break;





      case "manager":
      case "tour_manager":
          navigate("/tour-manager/dashboard");
          break;

        case "tourmanager":
          navigate("/tour-manager/dashboard");
          break;





      case "customer":
          navigate("/dashboard");
          break;

        case "user":
          navigate("/dashboard");
          break;

        default:
          navigate("/dashboard");
          break;



    }



  };









  const handleSubmit = async(e)=>{


    e.preventDefault();



    try{


      setLoading(true);





      const response = await login(

        formData.email,

        formData.password

      );





      toast.success(

        "Login successful"

      );





      redirectUser(

        response?.user

      );





    }


    catch(error){



      console.error(

        "LOGIN ERROR:",

        error

      );




      toast.error(

        error?.response?.data?.message ||

        "Invalid email or password"

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
      p-6
      "
    >





      <div
        className="
        bg-white
        shadow-xl
        rounded-2xl
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
          text-gray-800
          "
        >

          Welcome Back

        </h1>





        <form

          onSubmit={handleSubmit}

          className="
          space-y-5
          "

        >




          <div>


            <label
              className="
              block
              font-medium
              mb-2
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


              placeholder="Enter email"


              className="
              w-full
              border
              rounded-lg
              p-3
              outline-none
              focus:ring-2
              focus:ring-blue-500
              "


            />


          </div>








          <div>


            <label
              className="
              block
              font-medium
              mb-2
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


              placeholder="Enter password"


              className="
              w-full
              border
              rounded-lg
              p-3
              outline-none
              focus:ring-2
              focus:ring-blue-500
              "


            />


          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm font-semibold text-green-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button


            disabled={loading}


            className="
            w-full
            bg-green-700
            hover:bg-green-800
            text-white
            py-3
            rounded-lg
            font-semibold
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