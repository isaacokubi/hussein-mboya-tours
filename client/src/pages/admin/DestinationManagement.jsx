import React from "react";
import {useNavigate} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  getAdminDestinations
} from "../../api/adminDestinationApi";


const DestinationManagement = () => {

  const navigate = useNavigate();


  const {
    data: destinations = [],
    isLoading,
    error
  } = useQuery({
    queryKey:["admin-destinations"],
    queryFn:getAdminDestinations
  });



  if(isLoading){

    return (
      <div className="p-6">
        Loading destinations...
      </div>
    );

  }



  if(error){

    return (
      <div className="p-6 text-red-600">
        Failed loading destinations.
        <br/>
        {error.message}
      </div>
    );

  }



  return (

    <div className="p-6">


      <h1 className="text-3xl font-bold mb-6">
        Destination Management
      </h1>



      <div className="bg-white rounded-lg shadow p-6">


        <div className="flex justify-between mb-5">

          <h2 className="text-xl font-semibold">
            Destinations ({destinations.length})
          </h2>


          <button
            onClick={()=>navigate("/admin/create-destination")}
            className="
            bg-green-600
            text-white
            px-4
            py-2
            rounded
            "
          >
            Add Destination
          </button>


        </div>



        {
          destinations.length === 0 ? (

            <p>
              No destinations found.
            </p>

          ) : (


            <div className="grid md:grid-cols-3 gap-5">


              {
                destinations.map((destination)=>(


                  <div
                    key={destination._id}
                    className="
                    border
                    rounded-lg
                    overflow-hidden
                    bg-white
                    shadow
                    "
                  >

                    {
                      destination.images?.length > 0 && (

                        <img
                          src={
                            destination.images[0]?.startsWith("http")
                            ?
                            destination.images[0]
                            :
                            `${import.meta.env.VITE_API_URL?.replace("/api","") || "http://localhost:5000"}${destination.images[0]}`
                          }
                          alt={destination.name}
                          className="
                          w-full
                          h-48
                          object-cover
                          "
                        />

                      )
                    }


                    <div className="p-4">

                      <h3 className="font-bold text-lg">
                        {destination.name}
                      </h3>


                      <p className="text-sm text-gray-600 mt-2">
                        {
                          destination.country ||
                          "No country"
                        }
                      </p>


                      <p className="text-sm mt-3">
                        {
                          destination.description ||
                          "No description"
                        }
                      </p>


                      <p className="mt-3">
                        Status:
                        {" "}
                        {destination.status || "active"}
                      </p>


                      <p className="mt-2 text-sm">
                        Featured:
                        {" "}
                        {destination.featured ? "Yes" : "No"}
                      </p>


                    </div>


                  </div>


                ))
              }


            </div>


          )
        }


      </div>


    </div>

  );


};


export default DestinationManagement;
