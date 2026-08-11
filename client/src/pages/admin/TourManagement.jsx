import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getAdminTours,
  deleteTour,
} from "../../api/adminTourApi";

import Loader from "../../components/common/Loader";

export default function TourManagement() {

  // Preserve intentionally fetched values for future dashboard UI.

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  /*
  |--------------------------------------------------------------------------
  | FETCH TOURS
  |--------------------------------------------------------------------------
  */

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-tours"],
    queryFn: getAdminTours,
  });


  const tours = Array.isArray(data)
    ? data
    : data?.tours || data?.data || [];



  /*
  |--------------------------------------------------------------------------
  | DELETE TOUR
  |--------------------------------------------------------------------------
  */
const deleteMutation = useMutation({
    mutationFn: deleteTour,

    onSuccess: () => {

      toast.success(
        "Tour deleted successfully"
      );

      queryClient.invalidateQueries([
        "admin-tours"
      ]);

    },


    onError: () => {

      toast.error(
        "Failed to delete tour"
      );

    },

  });



  /*
  |--------------------------------------------------------------------------
  | SEARCH FILTER
  |--------------------------------------------------------------------------
  */

  const filteredTours = tours.filter(
    (tour) => {

      const title =
        tour.title ||
        tour.name ||
        "";

      return title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );

    }
  );

  const totalPages = Math.max(1, Math.ceil(filteredTours.length / pageSize));
  const visibleTours = filteredTours.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage(totalPages);
    }
  }, [page, totalPages]);



  if (isLoading) {

    return (
      <Loader />
    );

  }



  if (isError) {

    return (

      <div className="p-6">

        <div className="
          bg-red-100
          text-red-700
          p-4
          rounded-lg
        ">

          Failed to load tours.

        </div>

      </div>

    );

  }



  return (

    <div className="
      p-6
      space-y-6
    ">


      {/* HEADER */}

      <div className="
        flex
        justify-between
        items-center
      ">


        <div>

          <h1 className="
            text-3xl
            font-bold
            text-gray-800
          ">

            Tour Management

          </h1>


          <p className="
            text-gray-500
          ">

            Create, update and manage all tours

          </p>

        </div>



        <button
          onClick={() => navigate("/tour-manager/create-tour")}
          className="
            flex
            items-center
            gap-2
            bg-green-600
            text-white
            px-5
            py-3
            rounded-lg
            hover:bg-green-700
          "
        >

          <Plus size={18}/>

          Add Tour

        </button>


      </div>





      {/* SEARCH BAR */}


      <div className="
        bg-white
        p-4
        rounded-xl
        shadow
        flex
        gap-4
      ">


        <div className="
          flex
          items-center
          border
          rounded-lg
          px-3
          flex-1
        ">

          <Search
            size={20}
            className="
              text-gray-400
            "
          />


          <input

            type="text"

            placeholder="
              Search tours...
            "

            value={search}

            onChange={
              (e)=>
              setSearch(
                e.target.value
              )
            }

            className="
              w-full
              p-2
              outline-none
            "

          />

        </div>



        <button

          onClick={
            ()=>refetch()
          }

          className="
            flex
            items-center
            gap-2
            px-4
            border
            rounded-lg
            hover:bg-gray-100
          "

        >

          <RefreshCw size={18}/>

          Refresh

        </button>


      </div>






      {/* TABLE */}


      <div className="
        bg-white
        rounded-xl
        shadow
        overflow-hidden
      ">


        <table className="
          w-full
        ">


          <thead className="
            bg-gray-100
          ">

            <tr>


              <th className="
                p-4
                text-left
              ">

                Tour

              </th>


              <th className="
                p-4
              ">

                Destination

              </th>


              <th className="
                p-4
              ">

                Price

              </th>


              <th className="
                p-4
              ">

                Status

              </th>


              <th className="
                p-4
              ">

                Actions

              </th>


            </tr>

          </thead>



          <tbody>


          {
            filteredTours.length === 0 ?


            (

              <tr>

                <td
                  colSpan="5"
                  className="
                    p-6
                    text-center
                    text-gray-500
                  "
                >

                  No tours available

                </td>

              </tr>

            )


            :


            visibleTours.map(

              (tour)=>(


                <tr

                  key={
                    tour._id
                  }

                  className="
                    border-t
                  "

                >


                  <td className="
                    p-4
                  ">


                    <div className="
                      font-semibold
                    ">

                      {
                        tour.title ||
                        tour.name
                      }

                    </div>


                  </td>




                  <td className="
                    p-4
                    text-center
                  ">

                    {
                      tour.destination?.name ||
                      tour.destination ||
                      "-"
                    }

                  </td>




                  <td className="
                    p-4
                    text-center
                  ">

                    KES {

                      tour.price ||
                      0

                    }

                  </td>




                  <td className="
                    p-4
                    text-center
                  ">


                    <span className="
                      px-3
                      py-1
                      rounded-full
                      text-sm
                      bg-green-100
                      text-green-700
                    ">

                      {
                        tour.status ||
                        "active"
                      }

                    </span>


                  </td>




                  <td className="
                    p-4
                  ">


                    <div className="
                      flex
                      justify-center
                      gap-3
                    ">



                      <button
                        type="button"
                        title="View tour"
                        onClick={() => navigate(`/tours/${tour.slug || tour._id}`)}
                        className="
                          text-blue-600 hover:text-blue-800
                        "
                      >

                        <Eye size={18}/>

                      </button>



                      <button

                        onClick={()=>
                          navigate(
                            `/tour-manager/edit-tour/${tour._id}`
                          )
                        }

                        className="
                          text-yellow-600
                        "
                      >

                        <Edit size={18}/>

                      </button>



                      <button

                        onClick={()=>

                          deleteMutation.mutate(
                            tour._id
                          )

                        }

                        className="
                          text-red-600
                        "

                      >

                        <Trash2 size={18}/>

                      </button>


                    </div>


                  </td>



                </tr>


              )

            )

          }


          </tbody>



        </table>


      </div>

      <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow">
        <span className="text-sm text-gray-500">Page {page} of {totalPages} · {filteredTours.length} tour(s)</span>
        <div className="flex gap-2">
          <button type="button" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border px-4 py-2 disabled:opacity-40">Previous</button>
          <button type="button" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-40">Next</button>
        </div>
      </div>

    </div>

  );

}