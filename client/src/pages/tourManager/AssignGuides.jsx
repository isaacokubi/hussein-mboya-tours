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

import { toast } from "react-toastify";

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
  | LOAD AVAILABLE GUIDES
  |--------------------------------------------------------------------------
  */

  const {
    data: guideData,
    isLoading: guidesLoading,
  } = useQuery({
    queryKey: ["availableGuides"],
    queryFn: getGuides,
  });

  const guidesRaw =
    guideData?.guides ||
    guideData?.data?.guides ||
    guideData?.data ||
    guideData ||
    [];

  const guides = (Array.isArray(guidesRaw) ? guidesRaw : []).filter((item) => {
    const position = String(item?.position || item?.role || "").toLowerCase().replace(/[\s_-]/g, "");
    return position === "guide" || position === "tourguide" || position === "tour_guide".replace(/[\s_-]/g, "");
  });

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

  const {
    mutate: assign,
    isPending,
  } = useMutation({
    mutationFn: (guideId) =>
      assignGuide(id, guideId),

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

      await queryClient.invalidateQueries({
        queryKey: ["assignment-guides"],
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

  if (tourLoading || guidesLoading) {
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

  if (tourError || !tour) {
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
