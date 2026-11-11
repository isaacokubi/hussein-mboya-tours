/**
 * Purpose: My Custom Tours page-level UI component. Main declarations: statusLabel, MyCustomTours, handleProceed.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useTenant } from "../context/TenantContext";
// Load ../context/SettingsContext so this module can use its exported dependencies.
import { useSettings } from "../context/SettingsContext";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Load ../api/customTourApi so this module can use its exported dependencies.
import {
  convertCustomTourRequest,
  getMyCustomTourRequests,
} from "../api/customTourApi";
// Load ../components/common/MobileDashboardNav so this module can use its exported dependencies.
import MobileDashboardNav from "../components/common/MobileDashboardNav";

// Declare statusClasses for use by the surrounding module or function.
const statusClasses = {
  pending: "bg-amber-100 text-amber-800",
  quoted: "bg-blue-100 text-blue-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-slate-100 text-slate-700",
  converted: "bg-purple-100 text-purple-800",
};

// Declare statusLabel for use by the surrounding module or function.
const statusLabel = (value) =>
  String(value || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

// Define MyCustomTours; its parameters and body implement this operation.
export default function MyCustomTours() {
  // Declare { tenant } for use by the surrounding module or function.
  const { tenant } = useTenant();
  // Declare { settings } for use by the surrounding module or function.
  const { settings } = useSettings();
  // Declare queryClient for use by the surrounding module or function.
  const queryClient = useQueryClient();
  // Declare { data, isLoading, isError, error } for use by the surrounding module or function.
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["my-custom-tour-requests"],
    queryFn: getMyCustomTourRequests,
  });

  // Declare convertMutation for use by the surrounding module or function.
  const convertMutation = useMutation({
    mutationFn: convertCustomTourRequest,
    onSuccess: (result) => {
      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({ queryKey: ["my-custom-tour-requests"] });
      // Declare bookingId for use by the surrounding module or function.
      const bookingId = result?.booking?._id || result?.data?.booking?._id;
      // Check the condition (bookingId) and run the matching branch.
      if (bookingId) {
        // Always take the customer to the real checkout screen. The checkout
        // page loads the quoted booking, shows the full cost/balance and
        // starts the M-Pesa STK push so the customer can enter their PIN.
        // Perform the side effect or state update expressed on the following line.
        window.location.href = `/checkout/booking/${bookingId}`;
      }
    },
    onError: (mutationError) => {
      // Perform the side effect or state update expressed on the following line.
      window.alert(
        mutationError?.response?.data?.message ||
          "Unable to proceed with this custom tour."
      );
    },
  });

  // Declare requests for use by the surrounding module or function.
  const requests = Array.isArray(data)
    ? data
    : Array.isArray(data?.requests)
      ? data.requests
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.requests)
          ? data.data.requests
          : [];

  // Declare handleProceed for use by the surrounding module or function.
  const handleProceed = (request) => {
    // Check the condition (!request?._id || convertMutation.isPending) and run the matching branch.
    if (!request?._id || convertMutation.isPending) return;
    // Check the condition (!window.confirm("Proceed with this quoted custom tour and continue to ) and run the matching branch.
    if (!window.confirm("Proceed with this quoted custom tour and continue to secure checkout?")) return;
    // Perform the side effect or state update expressed on the following line.
    convertMutation.mutate(request._id);
  };

  // Return the expression shown below to the caller.
  return (
    <div className="min-h-screen bg-slate-50">
      <MobileDashboardNav role="customer" title="My Custom Tours" />
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-emerald-950 to-slate-900 p-6 text-white shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">Custom Tours</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">My Custom Tours</h1>
          <p className="mt-3 max-w-3xl text-slate-300">View your tailor-made tour requests, quotations and available booking options.</p>
          <div className="mt-6">
            <a href="/custom-tour" className="inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-500">Create Another Custom Tour</a>
          </div>
        </div>

        {isLoading && <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200"><p className="font-medium text-slate-600">Loading your custom tours...</p></div>}

        {isError && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800"><h2 className="font-bold">Unable to load custom tours</h2><p className="mt-1 text-sm">{error?.response?.data?.message || error?.message || "Please try again later."}</p></div>}

        {!isLoading && !isError && requests.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto max-w-lg">
              <h2 className="text-2xl font-bold text-slate-900">No custom tour requests yet</h2>
              <p className="mt-3 text-slate-500">You have not submitted a tailor-made tour request. Create one and our team will prepare a personalized quotation for you.</p>
              <a href="/custom-tour" className="mt-6 inline-flex rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white hover:bg-emerald-800">Create Custom Tour</a>
            </div>
          </div>
        )}

        {!isLoading && !isError && requests.length > 0 && (
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Your Requests</h2>
                <p className="mt-1 text-sm text-slate-500">{requests.length} custom tour request{requests.length === 1 ? "" : "s"}</p>
              </div>
            </div>

            <div className="grid gap-6">
              {requests.map((request) => {
                const status = String(request?.status || request?.requestStatus || "pending").toLowerCase();
                const quotedAmount = Number(request?.quotedAmount ?? request?.quotedTotal ?? request?.totalAmount ?? 0);
                const destination = request?.destination || request?.title || request?.tourName || "Custom Tour";
                const duration = Number(request?.durationDays || request?.duration || 0);
                const people = Number(request?.people || request?.numberOfPeople || request?.guests || 0);
                const travelDate = request?.startDate || request?.travelDate || request?.date;
                const requirements = request?.requirements || request?.specialRequests || "No additional requirements provided.";
                const message = request?.adminMessage || request?.message || request?.quoteMessage;
                const canProceed = status === "quoted" || status === "approved";

                return (
                  <article key={request._id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                    <div className="p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{destination}</h3>
                          <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                            {duration > 0 && <span>{duration} days</span>}
                            {people > 0 && <span>{people} {people === 1 ? "person" : "people"}</span>}
                            {travelDate && <span>{new Date(travelDate).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${statusClasses[status] || statusClasses.pending}`}>{statusLabel(status)}</span>
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requirements</p><p className="mt-2 text-sm text-slate-700">{requirements}</p></div>
                        <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quoted total</p><p className="mt-2 text-xl font-bold text-slate-900">KES {quotedAmount.toLocaleString()}</p></div>
                      </div>

                      {message && <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Message from {settings?.companyName || tenant?.name || 'Your Travel Company'}</p><p className="mt-2 text-sm text-emerald-900">{message}</p></div>}

                      {canProceed && (
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <button type="button" onClick={() => handleProceed(request)} disabled={convertMutation.isPending} className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
                            {convertMutation.isPending ? "Preparing checkout..." : "Proceed to Checkout & Pay"}
                          </button>
                          <span className="text-sm text-slate-500">Your quoted total will be shown before payment.</span>
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
