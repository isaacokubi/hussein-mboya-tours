import React from "react";
import { useQuery } from "@tanstack/react-query";

import {
  getAdminDestinations
} from "../../api/adminDestinationApi";


const DestinationManagement = () => {


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
                    p-4
                    "
                  >


                    <h3 className="font-bold text-lg">
                      {destination.name}
                    </h3>


                    <p className="text-sm text-gray-600 mt-2">
                      {destination.location || "No location"}
                    </p>


                    <p className="mt-3">
                      Status:
                      {" "}
                      {destination.status || "active"}
                    </p>


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
