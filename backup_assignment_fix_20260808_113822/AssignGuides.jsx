// client/src/pages/tourManager/AssignGuides.jsx

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  toast,
} from "react-toastify";

import {
  getGuides,
  assignGuide,
} from "../../api/tourManagerApi";

import {
  getTour,
} from "../../api/tourApi";

const AssignGuides = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  /*
  |--------------------------------------------------------------------------
  | LOAD TOUR
  |--------------------------------------------------------------------------
  */

  const {
    data: tourData,
    isLoading: tourLoading,
    isError: tourError,
  } = useQuery({
    queryKey: ["tour", id],
    queryFn: () => getTour(id),
    enabled: Boolean(id),
  });

  /*
  |--------------------------------------------------------------------------
  | LOAD GUIDES
  |--------------------------------------------------------------------------
  */

  const {
    data,
    isLoading: guidesLoading,
    isError: guidesError,
  } = useQuery({
    queryKey: ["availableGuides"],
    queryFn: getGuides,
  });

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE RESPONSES
  |--------------------------------------------------------------------------
  */

  const guides =
    data?.guides ||
    data?.data?.guides ||
    data?.data ||
    data ||
    [];

  const tour =
    tourData?.tour ||
    tourData?.data?.tour ||
    tourData?.data ||
    tourData ||
    null;

  /*
  |--------------------------------------------------------------------------
  | ASSIGN GUIDE
  |--------------------------------------------------------------------------
  */

  const {
    mutate: assign,
    isPending,
  } = useMutation({
    mutationFn: (guideId) =>
      assignGuide(
        id,
        guideId
      ),

    onSuccess: async () => {
      toast.success(
        "Guide assigned successfully"
      );

      await queryClient.invalidateQueries({
        queryKey: ["tour", id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["availableGuides"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["assignment-tours"],
      });

      navigate(
        "/tour-manager/tours"
      );
    },

    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to assign guide";

      toast.error(message);
    },
  });

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (
    tourLoading ||
    guidesLoading
  ) {
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERRORS
  |--------------------------------------------------------------------------
  */

  if (tourError) {
    return (
      <div className="p-6 text-red-600">
        Failed to load tour.
      </div>
    );
  }

  if (guidesError) {
    return (
      <div className="p-6 text-red-600">
        Failed to load guides.
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-xl shadow p-6">

          <h1 className="text-3xl font-bold">
            Assign Guide
          </h1>

          {tour && (
            <p className="mt-2 text-gray-600">
              Tour:
              <strong className="ml-2">
                {tour.title || "Untitled Tour"}
              </strong>
            </p>
          )}

        </div>

        <div className="
          grid
          md:grid-cols-3
          gap-5
          mt-6
        ">

          {guides.length === 0 ? (

            <div className="
              bg-white
              rounded-xl
              shadow
              p-5
              md:col-span-3
            ">
              No guides available.
            </div>

          ) : (

            guides.map((guide) => {

              const guideName =
                guide.name ||
                `${guide.firstName || ""} ${
                  guide.lastName || ""
                }`.trim() ||
                "Unnamed Guide";

              return (
                <div
                  key={guide._id}
                  className="
                    bg-white
                    shadow
                    rounded-xl
                    p-5
                  "
                >

                  <h2 className="
                    font-bold
                    text-xl
                  ">
                    {guideName}
                  </h2>

                  <p className="
                    mt-2
                    text-gray-600
                  ">
                    Experience:{" "}
                    {guide.experience || 0} years
                  </p>

                  {guide.availability && (
                    <p className="
                      mt-1
                      text-sm
                      text-gray-500
                    ">
                      Availability:{" "}
                      {guide.availability}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      assign(guide._id)
                    }
                    disabled={
                      isPending ||
                      !guide._id
                    }
                    className="
                      bg-green-700
                      hover:bg-green-800
                      disabled:opacity-50
                      text-white
                      p-2
                      rounded
                      mt-4
                      w-full
                    "
                  >
                    {isPending
                      ? "Assigning..."
                      : "Assign Guide"}
                  </button>

                </div>
              );
            })

          )}

        </div>

      </div>

    </div>
  );
};

export default AssignGuides;
