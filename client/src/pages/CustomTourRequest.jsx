import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createCustomTourRequest } from "../api/customTourApi";
import MobileDashboardNav from "../components/common/MobileDashboardNav";

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
};

export default function CustomTourRequest() {
  const [form, setForm] = useState(initialForm);

  const mutation = useMutation({
    mutationFn: createCustomTourRequest,
    onSuccess: () => {
      alert("Request submitted. The company will notify you with the total cost.");
      setForm(initialForm);
    },
    onError: (error) => {
      console.error("Custom tour request failed:", error);
      alert(error?.response?.data?.message || "Unable to submit custom tour request");
    },
  });

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate({
      ...form,
      durationDays: Number(form.durationDays),
      people: Number(form.people),
      budget: Number(form.budget || 0),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <MobileDashboardNav />
      <main className="mx-auto max-w-4xl">
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-emerald-950 to-slate-900 p-6 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Custom Tours</p>
          <h1 className="mt-1 text-3xl font-bold">Build Your Own Tour</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            Tell us where you want to go, how long you want to stay and what you need. We will price the trip and notify you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-5 md:grid-cols-2">
            <input required placeholder="Destination / places" value={form.destination} onChange={updateField("destination")} className="rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            <input required type="number" min="1" placeholder="Duration (days)" value={form.durationDays} onChange={updateField("durationDays")} className="rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            <input required type="number" min="1" placeholder="Number of people" value={form.people} onChange={updateField("people")} className="rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
            <input type="date" min={new Date().toISOString().slice(0, 10)} value={form.startDate} onChange={updateField("startDate")} className="rounded-xl border border-slate-200 p-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
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
