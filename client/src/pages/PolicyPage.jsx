import { useState } from "react";
import { Send, ShieldCheck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createPrivacyRequest } from "../api/privacyApi";

const content = {
  privacy: {
    title: "Privacy Policy",
    paragraphs: [
      "We use information you provide to process bookings, payments, support requests and account activity.",
      "We do not sell customer information. Access to operational data is limited to authorized staff and service providers who need it to deliver your booking.",
      "You can contact the company to request correction or clarification about information associated with your account."
    ]
  },
  terms: {
    title: "Terms and Conditions",
    paragraphs: [
      "Bookings are subject to availability and confirmation. Prices and itineraries may change when suppliers or operating conditions require an adjustment.",
      "Customers are responsible for providing accurate passenger information and complying with applicable travel requirements.",
      "By using this website, you agree to these terms and to reasonable operational changes required to deliver a safe tour."
    ]
  },
  refund: {
    title: "Refund Policy",
    paragraphs: [
      "Refund eligibility depends on the booking status, supplier terms and the cancellation conditions communicated at booking time.",
      "Approved refunds are processed through the original payment method where possible.",
      "For a booking-specific refund request, contact support with your booking reference so the team can review the applicable terms."
    ]
  }
};

const requestTypes = [["access", "Access my data"], ["correction", "Correct my data"], ["deletion", "Delete my data"], ["portability", "Export my data"], ["objection", "Object to processing"], ["restriction", "Restrict processing"]];

export default function PolicyPage({ type = "privacy" }) {
  const page = content[type] || content.privacy;
  const [form, setForm] = useState({ type: "access", requesterName: "", requesterEmail: "", requesterPhone: "" });
  const [result, setResult] = useState(null);
  const requestM = useMutation({
    mutationFn: createPrivacyRequest,
    onSuccess: (response) => { setResult(response?.data || response); setForm({ type: "access", requesterName: "", requesterEmail: "", requesterPhone: "" }); toast.success("Privacy request submitted."); },
    onError: (e) => toast.error(e?.response?.data?.message || "Unable to submit privacy request."),
  });
  const submit = (e) => { e.preventDefault(); requestM.mutate(form); };

  return <div className="max-w-4xl mx-auto p-6 md:p-10">
    <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
    <div className="space-y-5 text-gray-700 leading-7">{page.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
    {type === "privacy" && <section className="mt-10 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm"><div className="flex items-start gap-3"><div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><ShieldCheck size={22}/></div><div><h2 className="text-2xl font-bold text-slate-900">Exercise your data rights</h2><p className="mt-1 text-sm text-slate-500">Submit an access, correction, deletion, portability, objection or restriction request. Your request will be assigned a tracking number for the operations team.</p></div></div>{result?.requestNumber ? <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900"><b>Request received.</b><div className="mt-1">Reference: <span className="font-mono font-bold">{result.requestNumber}</span> · Status: {result.status || "received"}</div><div className="mt-1">Please keep the reference for support follow-up.</div></div> : <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2"><label className="text-sm font-semibold md:col-span-2">Request type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2">{requestTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-sm font-semibold">Full name<input required minLength="2" value={form.requesterName} onChange={(e) => setForm({ ...form, requesterName: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2"/></label><label className="text-sm font-semibold">Email<input type="email" value={form.requesterEmail} onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2"/></label><label className="text-sm font-semibold md:col-span-2">Phone (optional)<input value={form.requesterPhone} onChange={(e) => setForm({ ...form, requesterPhone: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2"/></label><button disabled={requestM.isPending} className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 font-semibold text-white disabled:opacity-50"><Send size={17}/> {requestM.isPending ? "Submitting..." : "Submit privacy request"}</button></form>}</section>}
  </div>;
}
