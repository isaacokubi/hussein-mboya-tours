import {
  useContext,
  useEffect,
  useState
} from "react";

import {
  AuthContext
} from "../context/AuthContext";

import axios from "axios";


export default function Profile() {


  const {
    user,
    setUser
  } = useContext(AuthContext);



  const [loading,setLoading] = useState(true);



  useEffect(()=>{


    const fetchProfile = async()=>{


      try {


        const token = localStorage.getItem("token");


        const response = await axios.get(

          `${import.meta.env.VITE_API_URL}/api/users/profile`,

          {
            headers:{
              Authorization:`Bearer ${token}`
            }
          }

        );



        setUser(response.data);



        localStorage.setItem(
          "user",
          JSON.stringify(response.data)
        );



      } catch(error){

        console.log(
          "Profile fetch error:",
          error
        );

      } finally {


        setLoading(false);

      }


    };



    if(user){

      fetchProfile();

    }


  },[]);





  if(!user){

    return (

      <p>
        Please login
      </p>

    );

  }




  if(loading){

    return (

      <p>
        Loading profile...
      </p>

    );

  }




  return(


    <div
      className="
      max-w-xl
      mx-auto
      mt-10
      bg-white
      shadow-md
      rounded-lg
      p-6
      "
    >


      <h1
        className="
        text-3xl
        font-bold
        mb-6
        "
      >

        My Profile

      </h1>



      <p>
        Name:
        <strong>
          {user.name}
        </strong>
      </p>



      <p>
        Email:
        <strong>
          {user.email}
        </strong>
      </p>




      <div
        className="
        mt-6
        bg-yellow-50
        p-5
        rounded-lg
        "
      >


        <h2
          className="
          text-xl
          font-bold
          "
        >

          Loyalty Rewards

        </h2>




        <p
          className="
          mt-3
          text-lg
          "
        >

          Points:

          <strong
            className="
            ml-2
            text-green-600
            "
          >

            {user.loyaltyPoints || 0}

          </strong>


        </p>


      </div>



    </div>


  );


}