import { useQuery } from "@tanstack/react-query";

import api from "../api/axios";

import DestinationCard from "../components/destinations/DestinationCard";


export default function Destinations() {


  const {

    data = [],

    isLoading,

  } = useQuery({

    queryKey:["destinations"],


    queryFn: async()=>{

      const res = await api.get("/destinations");

      return res.data;

    },

  });




  if(isLoading){

    return (

      <div className="p-8 text-center">

        <p className="text-xl font-semibold">
          Loading destinations...
        </p>

      </div>

    );

  }




  return (

    <div className="p-8">


      <h1 className="
      text-5xl
      font-bold
      mb-10
      ">

        Explore Destinations

      </h1>





      <div className="
      grid
      md:grid-cols-3
      gap-8
      ">


        {data.map((destination)=>(


          <DestinationCard

            key={destination._id}

            destination={destination}

          />


        ))}


      </div>


    </div>

  );

}