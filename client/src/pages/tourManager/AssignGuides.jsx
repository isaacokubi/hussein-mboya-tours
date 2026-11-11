/**
 * Purpose: Assign Guides page-level UI component. Main declarations: AssignGuides.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/pages/tourManager/AssignGuides.jsx

// Load react-router-dom so this module can use its exported dependencies.
import {
  useParams,
  useNavigate,
} from "react-router-dom";

// Load @tanstack/react-query so this module can use its exported dependencies.
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";

// Load ../../api/tourManagerApi so this module can use its exported dependencies.
import {
  getGuides,
  assignGuide,
} from "../../api/tourManagerApi";

// Load ../../api/tourApi so this module can use its exported dependencies.
import {
  getTour,
} from "../../api/tourApi";

// Declare AssignGuides for use by the surrounding module or function.
const AssignGuides = () => {
  // Declare { id } for use by the surrounding module or function.
  const { id } = useParams();

  // Declare navigate for use by the surrounding module or function.
  const navigate = useNavigate();

  // Declare queryClient for use by the surrounding module or function.
  const queryClient = useQueryClient();

  /*
  |--------------------------------------------------------------------------
  | LOAD TOUR
  |--------------------------------------------------------------------------
  */

  // Declare { data: tourData, isLoading: tourLoading, isError: tourError, } for use by the surrounding module or function.
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
  | LOAD AVAILABLE GUIDES
  |--------------------------------------------------------------------------
  */

  // Declare { data: guideData, isLoading: guidesLoading, } for use by the surrounding module or function.
  const {
    data: guideData,
    isLoading: guidesLoading,
  } = useQuery({
    queryKey: ["availableGuides"],
    queryFn: getGuides,
  });

  // Declare guidesRaw for use by the surrounding module or function.
  const guidesRaw =
    guideData?.guides ||
    guideData?.data?.guides ||
    guideData?.data ||
    guideData ||
    [];

  // Declare guides for use by the surrounding module or function.
  const guides = (Array.isArray(guidesRaw) ? guidesRaw : []).filter((item) => {
    // Declare position for use by the surrounding module or function.
    const position = String(item?.position || item?.role || "").toLowerCase().replace(/[\s_-]/g, "");
    // Return the expression shown below to the caller.
    return position === "guide" || position === "tourguide" || position === "tour_guide".replace(/[\s_-]/g, "");
  });

  // Declare tour for use by the surrounding module or function.
  const tour =
    tourData?.tour ||
    tourData?.data?.tour ||
    tourData?.data ||
    null;

  /*
  |--------------------------------------------------------------------------
  | ASSIGN GUIDE
  |--------------------------------------------------------------------------
  */

  // Declare { mutate: assign, isPending, } for use by the surrounding module or function.
  const {
    mutate: assign,
    isPending,
  } = useMutation({
    mutationFn: (guideId) =>
      assignGuide(id, guideId),

    onSuccess: async () => {
      // Perform the side effect or state update expressed on the following line.
      toast.success(
        "Guide assigned successfully"
      );

      // Perform the side effect or state update expressed on the following line.
      await queryClient.invalidateQueries({
        queryKey: ["tour", id],
      });

      // Perform the side effect or state update expressed on the following line.
      await queryClient.invalidateQueries({
        queryKey: ["availableGuides"],
      });

      // Perform the side effect or state update expressed on the following line.
      await queryClient.invalidateQueries({
        queryKey: ["assignment-tours"],
      });

      // Perform the side effect or state update expressed on the following line.
      await queryClient.invalidateQueries({
        queryKey: ["assignment-guides"],
      });

      // Perform the side effect or state update expressed on the following line.
      navigate(
        "/tour-manager/tours"
      );
    },

    onError: (error) => {
      // Declare message for use by the surrounding module or function.
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to assign guide";

      // Perform the side effect or state update expressed on the following line.
      toast.error(message);
    },
  });

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  // Check the condition (tourLoading || guidesLoading) and run the matching branch.
  if (tourLoading || guidesLoading) {
    // Return the expression shown below to the caller.
    return (
      <div className="p-6">
        Loading assignment data...
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  // Check the condition (tourError || !tour) and run the matching branch.
  if (tourError || !tour) {
    // Return the expression shown below to the caller.
    return (
      <div className="p-6">
        <div className="rounded-xl bg-white p-6 shadow">
          <h1 className="text-xl font-bold text-red-600">
            Failed to load tour
          </h1>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/tour-manager/tours"
              )
            }
            className="mt-4 rounded-lg bg-gray-800 px-4 py-2 text-white"
          >
            Back to Tours
          </button>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  // Return the expression shown below to the caller.
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="mx-auto max-w-5xl">

        <div className="mb-6 rounded-xl bg-white p-6 shadow">

          <h1 className="text-3xl font-bold">
            Assign Guide
          </h1>

          <p className="mt-2 text-gray-600">
            Tour:
            <strong className="ml-2">
              {tour.title || "Untitled Tour"}
            </strong>
          </p>

          {tour.assignedGuide && (
            <p className="mt-2 text-sm text-gray-500">
              A guide is currently assigned.
              Selecting another guide will replace
              the existing assignment.
            </p>
          )}

        </div>

        {guides.length === 0 ? (

          <div className="rounded-xl bg-white p-6 shadow">
            No available guides found.
          </div>

        ) : (

          <div className="grid gap-5 md:grid-cols-3">

            {guides.map((guide) => {

              const guideName =
                guide.name ||
                `${guide.firstName || ""} ${
                  guide.lastName || ""
                }`.trim() ||
                "Unnamed Guide";

              return (
                <div
                  key={guide._id}
                  className="rounded-xl bg-white p-5 shadow"
                >

                  <h2 className="text-xl font-bold">
                    {guideName}
                  </h2>

                  <p className="mt-2 text-gray-600">
                    Experience:{" "}
                    {guide.experience || 0} years
                  </p>

                  {guide.availability && (
                    <p className="mt-1 text-sm text-gray-500">
                      Status:{" "}
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
                    className="mt-4 w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending
                      ? "Assigning..."
                      : "Assign Guide"}
                  </button>

                </div>
              );
            })}

          </div>

        )}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/tour-manager/tours"
            )
          }
          className="mt-6 rounded-lg bg-gray-700 px-5 py-3 text-white hover:bg-gray-800"
        >
          Back to Tours
        </button>

      </div>

    </div>
  );
};

export default AssignGuides;
