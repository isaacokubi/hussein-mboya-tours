import {
  useParams
} from "react-router-dom";


import {
  useQuery
} from "@tanstack/react-query";


import api from "../api/axios";


import LazyImage from "../components/common/LazyImage";



export default function DestinationDetails(){



  const {

    slug

  } = useParams();






  const {

    data,

    isLoading,

    error


  } = useQuery({



    queryKey:[

      "destination",

      slug

    ],




    queryFn:async()=>{


      const response =

      await api.get(

        `/destinations/${slug}`

      );



      return response.data.data.destination;


    },



    enabled:Boolean(slug)


  });









  if(isLoading){


    return (

      <div className="
      min-h-screen
      flex
      items-center
      justify-center
      ">

        Loading destination...


      </div>

    );

  }







  if(error || !data){


    return (

      <div className="
      min-h-screen
      flex
      items-center
      justify-center
      text-red-600
      ">


        Destination not found.


      </div>

    );


  }







  const image =



  typeof data.images?.[0] === "object"



  ?



  data.images?.[0]?.url



  :



  data.images?.[0];








  return (



    <div

    className="
    min-h-screen
    bg-gray-100
    p-6
    md:p-10
    "

    >



      <div

      className="
      max-w-6xl
      mx-auto
      bg-white
      rounded-xl
      shadow-lg
      overflow-hidden
      "

      >



        <LazyImage


          src={

            image ||

            "/images/destination-placeholder.jpg"

          }


          alt={data.name}


          className="
          w-full
          h-[450px]
          object-cover
          "

        />





        <div className="p-8">



          <h1

          className="
          text-4xl
          font-bold
          text-gray-800
          "

          >

            {data.name}


          </h1>





          <p

          className="
          text-gray-500
          mt-3
          "

          >

            {data.country}


          </p>







          <p

          className="
          mt-6
          text-gray-700
          leading-relaxed
          "

          >

            {data.description}


          </p>




        </div>



      </div>



    </div>



  );


}