import {
  useQuery
} from "@tanstack/react-query";


import {
  getAdminTours,
  deleteTour
} from "../../api/adminTourApi";



export default function ManageTours(){


  const {

    data:tours=[],

    refetch

  }

  =
  useQuery({

    queryKey:[
      "adminTours"
    ],

    queryFn:
      getAdminTours

  });







  const remove = async(id)=>{


    await deleteTour(id);


    refetch();


  };








  return (

    <div>





      <div
        className="
        flex
        justify-between
        mb-8
        "
      >





        <h1

          className="
          text-3xl
          font-bold
          "

        >

          Manage Tours

        </h1>







        <a

          href="/admin/tours/add"

          className="
          bg-green-600
          text-white
          px-6
          py-3
          rounded-lg
          "

        >

          Add Tour

        </a>





      </div>









      <div

        className="
        bg-white
        rounded-xl
        shadow
        overflow-hidden
        "

      >





        <table

          className="
          w-full
          "

        >





          <thead>


            <tr

              className="
              bg-gray-200
              "

            >



              <th className="p-4">

                Image

              </th>



              <th>

                Title

              </th>



              <th>

                Price

              </th>



              <th>

                Action

              </th>



            </tr>


          </thead>









          <tbody>





            {

              tours.map((tour)=>(





                <tr

                  key={tour._id}

                  className="
                  border-b
                  "

                >





                  <td className="p-4">





                    <img


                      src={


                        tour.image ||


                        (

                          typeof tour.images?.[0] === "object"


                          ?


                          tour.images?.[0]?.url


                          :


                          tour.images?.[0]

                        )


                        ||


                        "/images/tour-placeholder.jpg"


                      }



                      alt={tour.title || "Tour"}



                      className="
                      w-20
                      h-16
                      object-cover
                      rounded
                      "


                    />





                  </td>







                  <td>

                    {tour.title}


                  </td>







                  <td>

                    ${tour.price?.toLocaleString("en-US") || 0}


                  </td>







                  <td>





                    <button


                      onClick={()=>remove(tour._id)}



                      className="
                      bg-red-600
                      text-white
                      px-4
                      py-2
                      rounded
                      "


                    >

                      Delete


                    </button>





                  </td>





                </tr>





              ))

            }





          </tbody>





        </table>





      </div>





    </div>

  );


}