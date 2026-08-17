import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  convertCustomTourRequest,
  getMyCustomTourRequests,
} from "../api/customTourApi";
import MobileDashboardNav from "../components/common/MobileDashboardNav";

const statusClasses = {
  pending: "bg-amber-100 text-amber-800",
  quoted: "bg-blue-100 text-blue-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-slate-100 text-slate-700",
  converted: "bg-purple-100 text-purple-800",
};

const statusLabel = (value) =>
  String(value || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function MyCustomTours() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["my-custom-tour-requests"],
    queryFn: getMyCustomTourRequests,
  });

  const convertMutation = useMutation({
    mutationFn: convertCustomTourRequest,
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["my-custom-tour-requests"],
      });

      if (result?.booking?._id) {
        window.location.href = `/bookings/${result.booking._id}`;
      }
    },
    onError: (mutationError) => {
      window.alert(
        mutationError?.response?.data?.message ||
          "Unable to proceed with this custom tour."
      );
    },
  });

  const requests = Array.isArray(data)
    ? data
    : Array.isArray(data?.requests)
      ? data.requests
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.requests)
          ? data.data.requests
          : [];

  const handleProceed = (request) => {
    if (!request?._id) return;

    if (
      !window.confirm(
        "Proceed with this quoted custom tour and create the booking?"
      )
    ) {
      return;
    }

    convertMutation.mutate(request._id);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileDashboardNav role="customer" title="My Custom Tours" />

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-emerald-950 to-slate-900 p-6 text-white shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
            Custom Tours
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            My Custom Tours
          </h1>

          <p className="mt-3 max-w-3xl text-slate-300">
            View your tailor-made tour requests, quotations and available
            booking options.
          </p>

          <div className="mt-6">
            <a
              href="/custom-tour"
              className="inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-500"
            >
              Create Another Custom Tour
            </a>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <p className="font-medium text-slate-600">
              Loading your custom tours...
            </p>
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            <h2 className="font-bold">Unable to load custom tours</h2>
            <p className="mt-1 text-sm">
              {error?.response?.data?.message ||
                error?.message ||
                "Please try again later."}
            </p>
          </div>
        )}

        {!isLoading && !isError && requests.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto max-w-lg">
              <h2 className="text-2xl font-bold text-slate-900">
                No custom tour requests yet
              </h2>

              <p className="mt-3 text-slate-500">
                You have not submitted a tailor-made tour request. Create one
                and our team will prepare a personalized quotation for you.
              </p>

              <a
                href="/custom-tour"
                className="mt-6 inline-flex rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white hover:bg-emerald-800"
              >
                Create Custom Tour
              </a>
            </div>
          </div>
        )}

        {!isLoading && !isError && requests.length > 0 && (
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Your Requests
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {requests.length} custom tour request
                  {requests.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              {requests.map((request) => {
                const status = String(
                  request?.status ||
                    request?.requestStatus ||
                    "pending"
                ).toLowerCase();

                const quotedAmount = Number(
                  request?.quotedAmount ??
                    request?.quotedTotal ??
                    request?.totalAmount ??
                    0
                );

                const destination =
                  request?.destination ||
                  request?.title ||
                  request?.tourName ||
                  "Custom Tour";

                const duration = Number(
                  request?.durationDays ||
                    request?.duration ||
                    0
                );

                const people = Number(
                  request?.people ||
                    request?.numberOfPeople ||
                    request?.guests ||
                    0
                );

                const travelDate =
                  request?.startDate ||
                  request?.travelDate ||
                  request?.date;

                const requirements =
                  request?.requirements ||
                  request?.specialRequests ||
                  "No additional requirements provided.";

                const message =
                  request?.adminMessage ||
                  request?.message ||
                  request?.quoteMessage;

                const canProceed =
                  status === "quoted" ||
                  status === "approved";

                return (
                  <article
                    key={request._id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
                  >
                    <div className="p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">
                            {destination}
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                            {duration > 0 && (
                              <span>{duration} days</span>
                            )}

                            {people > 0 && (
                              <span>
                                {people}{" "}
                                {people === 1 ? "person" : "people"}
                              </span>
                            )}

                            {travelDate && (
                              <span>
                                {new Date(
                                  travelDate
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${
                            statusClasses[status] ||
                            statusClasses.pending
                          }`}
                        >
                          {statusLabel(status)}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Requirements
                          </p>

                          <p className="mt-2 text-sm text-slate-700">
                            {requirements}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Quoted total
                          </p>

                          <p className="mt-2 text-xl font-bold text-slate-900">
                            KES {quotedAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {message && (
                        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            Message from Coherent Tours
                          </p>

                          <p className="mt-2 text-sm text-emerald-900">
                            {message}
                          </p>
                        </div>
                      )}

                      {canProceed && (
                        <div className="mt-5">
                          <button
                            type="button"
                            onClick={() => handleProceed(request)}
                            disabled={convertMutation.isPending}
                            className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {convertMutation.isPending
                              ? "Preparing booking..."
                              : "Proceed to Book & Pay"}
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
