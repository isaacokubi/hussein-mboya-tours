/**
 * Purpose: Custom Tour Request page-level UI component. Main declarations: formatDate, CustomTourRequest, updateField, handleSubmit.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useMemo, useState } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useMutation, useQueryClient } from "@tanstack/react-query";
// Load ../api/customTourApi so this module can use its exported dependencies.
import { createCustomTourRequest } from "../api/customTourApi";

// Declare initialForm for use by the surrounding module or function.
const initialForm = {
  destination: "",
  durationDays: 3,
  people: 2,
  startDate: "",
  budget: "",
  requirements: "",
  pickupLocation: "",
  pickupTime: "",
  accommodationPreference: "",
  mealPreference: "",
  transportPreference: "",
  specialRequests: "",
  guestName: "",
  guestEmail: "",
  guestPhone: "",
};

// Declare formatDate for use by the surrounding module or function.
const formatDate = (value) => {
  // Check the condition (!value) and run the matching branch.
  if (!value) return "";
  // Declare date for use by the surrounding module or function.
  const date = new Date(`${value}T00:00:00`);
  // Check the condition (Number.isNaN(date.getTime())) and run the matching branch.
  if (Number.isNaN(date.getTime())) return "";
  // Return the result of date.toLocaleDateString() to the caller.
  return date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
};

// Define CustomTourRequest; its parameters and body implement this operation.
export default function CustomTourRequest() {
  // Declare [form, setForm] for use by the surrounding module or function.
  const [form, setForm] = useState(initialForm);
  // Declare queryClient for use by the surrounding module or function.
  const queryClient = useQueryClient();

  // Declare endDate for use by the surrounding module or function.
  const endDate = useMemo(() => {
    // Check the condition (!form.startDate) and run the matching branch.
    if (!form.startDate) return "";
    // Declare date for use by the surrounding module or function.
    const date = new Date(`${form.startDate}T00:00:00`);
    // Declare days for use by the surrounding module or function.
    const days = Math.max(1, Number(form.durationDays || 1));
    // Check the condition (Number.isNaN(date.getTime())) and run the matching branch.
    if (Number.isNaN(date.getTime())) return "";
    // Perform the side effect or state update expressed on the following line.
    date.setDate(date.getDate() + days - 1);
    // Return the result of date.toISOString().slice() to the caller.
    return date.toISOString().slice(0, 10);
  }, [form.startDate, form.durationDays]);

  // Declare mutation for use by the surrounding module or function.
  const mutation = useMutation({
    mutationFn: createCustomTourRequest,
    onSuccess: async () => {
      // Perform the side effect or state update expressed on the following line.
      await queryClient.invalidateQueries({ queryKey: ["my-custom-tours"] });
      // Perform the side effect or state update expressed on the following line.
      alert("Request submitted. The company will notify you with the total cost.");
      // Perform the side effect or state update expressed on the following line.
      setForm(initialForm);
    },
    onError: (error) => {
      // Perform the side effect or state update expressed on the following line.
      console.error("Custom tour request failed:", error);
      // Perform the side effect or state update expressed on the following line.
      alert(error?.response?.data?.message || "Unable to submit custom tour request");
    },
  });

  // Declare updateField for use by the surrounding module or function.
  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  // Declare handleSubmit for use by the surrounding module or function.
  const handleSubmit = (event) => {
    // Perform the side effect or state update expressed on the following line.
    event.preventDefault();
    // Check the condition (!form.startDate) and run the matching branch.
    if (!form.startDate) {
      // Perform the side effect or state update expressed on the following line.
      alert("Please select the custom tour start date.");
      // Return the result to the caller.
      return;
    }
    // Perform the side effect or state update expressed on the following line.
    mutation.mutate({
      ...form,
      durationDays: Number(form.durationDays),
      people: Number(form.people),
      budget: Number(form.budget || 0),
    });
  };

  // Return the expression shown below to the caller.
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <main className="mx-auto max-w-4xl">
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-emerald-950 to-slate-900 p-6 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Custom Tours</p>
          <h1 className="mt-1 text-3xl font-bold">Build Your Own Tour</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Tell us where you want to go, how long you want to stay and what you need. We will price the trip and notify you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-5 md:grid-cols-2">
            <input required placeholder="Your name" value={form.guestName} onChange={updateField("guestName")} className="rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            <input required type="email" placeholder="Your email" value={form.guestEmail} onChange={updateField("guestEmail")} className="rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            <input placeholder="Phone number" value={form.guestPhone} onChange={updateField("guestPhone")} className="rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            <input required placeholder="Destination / places" value={form.destination} onChange={updateField("destination")} className="rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            <input required type="number" min="1" placeholder="Duration (days)" value={form.durationDays} onChange={updateField("durationDays")} className="rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            <input required type="number" min="1" placeholder="Number of people" value={form.people} onChange={updateField("people")} className="rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Tour start date *</label>
              <input required type="date" min={new Date().toISOString().slice(0, 10)} value={form.startDate} onChange={updateField("startDate")} className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
              {endDate && <p className="mt-2 text-sm font-medium text-emerald-700">Allowed tour period: {formatDate(form.startDate)} – {formatDate(endDate)}. The checkout will only accept dates inside this period.</p>}
            </div>
            <input type="number" min="0" placeholder="Budget (optional)" value={form.budget} onChange={updateField("budget")} className="rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <input placeholder="Pickup location" value={form.pickupLocation} onChange={updateField("pickupLocation")} className="rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            <input type="time" value={form.pickupTime} onChange={updateField("pickupTime")} className="rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            <input placeholder="Accommodation preference" value={form.accommodationPreference} onChange={updateField("accommodationPreference")} className="rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            <input placeholder="Meal preference" value={form.mealPreference} onChange={updateField("mealPreference")} className="rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            <input placeholder="Transport preference" value={form.transportPreference} onChange={updateField("transportPreference")} className="rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 md:col-span-2" />
          </div>

          <textarea rows="6" placeholder="Accommodation, meals, transfers, activities, children, accessibility, special occasions and anything else..." value={form.requirements} onChange={updateField("requirements")} className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />

          <button type="submit" disabled={mutation.isPending} className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
            {mutation.isPending ? "Submitting..." : "Request my custom tour"}
          </button>
        </form>
      </main>
    </div>
  );
}