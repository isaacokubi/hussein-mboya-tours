import { useQuery } from "@tanstack/react-query";
import { getMyCustomTourRequests } from "../api/customTourApi";
import { Link } from "react-router-dom";
import MobileDashboardNav from "../components/common/MobileDashboardNav";

export default function CustomTourRequest() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["my-custom-tour-requests"],
    queryFn: getMyCustomTourRequests,
  });

  const requests = data?.requests || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <MobileDashboardNav />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                Custom Tours
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">
                My Custom Tours
              </h1>

              <p className="mt-3 max-w-2xl text-slate-600">
                View your tailor-made tour requests, quotations and booking
                options.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <section id="my-requests">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                My requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your custom tour requests and their current status.
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              {requests.length} request{requests.length === 1 ? "" : "s"}
            </span>
          </div>

          {isLoading && (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

              <p className="font-medium text-slate-600">
                Loading your custom tours...
              </p>
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
              <h3 className="font-bold">
                Unable to load your custom tours
              </h3>

              <p className="mt-2 text-sm">
                {error?.response?.data?.message ||
                  error?.message ||
                  "Please try again later."}
              </p>
            </div>
          )}

          {!isLoading && !isError && requests.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl">
                ✈️
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                No custom tours yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-slate-500">
                You have not submitted any custom tour requests yet.
              </p>

              <Link
                to="/dashboard"
                className="mt-6 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800"
              >
                Return to Dashboard
              </Link>
            </div>
          )}

          {!isLoading && !isError && requests.length > 0 && (
            <div className="grid gap-5">
              {requests.map((request) => {
                const quotedAmount = Number(request.quotedAmount || 0);

                return (
                  <article
                    key={request._id}
                    className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {request.destination || "Custom Tour"}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500">
                          <span>
                            {request.durationDays || 0} days
                          </span>

                          <span>·</span>

                          <span>
                            {request.people || 0} people
                          </span>

                          {request.startDate && (
                            <>
                              <span>·</span>

                              <span>
                                {new Date(
                                  request.startDate
                                ).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${
                          request.status === "quoted"
                            ? "bg-emerald-100 text-emerald-700"
                            : request.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : request.status === "cancelled"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {request.status || "pending"}
                      </span>
                    </div>

                    {request.requirements && (
                      <div className="mt-5 rounded-xl bg-slate-50 p-4">
                        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Requirements
                        </p>

                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {request.requirements}
                        </p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Quoted total
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-900">
                          KES{" "}
                          {quotedAmount.toLocaleString("en-KE")}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {request.status === "quoted" &&
                          quotedAmount > 0 && (
                            <Link
                              to={`/custom-tour/${request._id}/convert`}
                              className="rounded-xl bg-emerald-700 px-5 py-3 text-center font-bold text-white transition hover:bg-emerald-800"
                            >
                              Proceed to Book & Pay
                            </Link>
                          )}
                      </div>
                    </div>

                    {request.adminNotes && (
                      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-blue-600">
                          Message from Coherent Tours
                        </p>

                        <p className="whitespace-pre-wrap text-sm leading-6 text-blue-900">
                          {request.adminNotes}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
