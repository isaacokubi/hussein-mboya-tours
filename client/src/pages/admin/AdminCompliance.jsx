import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, FileCheck2, History, Save, ShieldCheck, XCircle } from "lucide-react";
import { getComplianceRecords, getComplianceSummary, queueEtimsInvoice, saveComplianceRecord } from "../../api/complianceApi";
import { createCreditDebitNote, getCreditDebitNotes, getEtimsCredentialStatus, getEtimsSubmissions, getFinanceComplianceSummary, getTaxProfile, queueCreditDebitNote, saveEtimsCredentials, saveTaxProfile } from "../../api/financeComplianceApi";

const labels = {
  TRA_LICENSE: "TRA licence",
  ODPC_REGISTRATION: "ODPC registration",
  PRIVACY_POLICY: "Privacy policy",
  DATA_RETENTION: "Data retention",
  DPA_REVIEW: "DPA review",
  BREACH_RESPONSE: "Breach response",
  KRA_TAX_PROFILE: "KRA tax profile",
  ETIMS_ONBOARDING: "eTIMS onboarding",
};

const types = Object.keys(labels);
const statuses = ["not_started", "in_progress", "submitted", "approved", "expired", "action_required", "closed"];
const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50";

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function statusTone(status) {
  if (status === "synced" || status === "approved") return "bg-emerald-50 text-emerald-700";
  if (status === "failed" || status === "expired") return "bg-red-50 text-red-700";
  if (["pending", "in_progress", "submitted"].includes(status)) return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

export default function AdminCompliance() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("etims");
  const [editing, setEditing] = useState(null);
  const [taxEditing, setTaxEditing] = useState(null);
  const [credentialEditing, setCredentialEditing] = useState(null);
  const [noteForm, setNoteForm] = useState({
    type: "credit",
    originalInvoice: "",
    totalAmount: "",
    taxAmount: "",
    reason: "",
  });

  const summary = useQuery({
    queryKey: ["compliance-summary"],
    queryFn: getComplianceSummary,
    refetchInterval: 60000,
  });
  const records = useQuery({
    queryKey: ["compliance-records"],
    queryFn: getComplianceRecords,
    refetchInterval: 60000,
  });
  const finance = useQuery({
    queryKey: ["finance-compliance-summary"],
    queryFn: getFinanceComplianceSummary,
    refetchInterval: 60000,
  });
  const taxProfile = useQuery({
    queryKey: ["tax-profile"],
    queryFn: getTaxProfile,
  });
  const environment = taxProfile.data?.data?.etimsEnvironment || "sandbox";
  const credential = useQuery({
    queryKey: ["etims-credentials", environment],
    queryFn: () => getEtimsCredentialStatus(environment),
    enabled: Boolean(taxProfile.data),
  });
  const submissions = useQuery({
    queryKey: ["etims-submissions"],
    queryFn: () => getEtimsSubmissions({ limit: 100 }),
    refetchInterval: 30000,
  });
  const notes = useQuery({
    queryKey: ["credit-debit-notes"],
    queryFn: getCreditDebitNotes,
  });

  const saveM = useMutation({
    mutationFn: ({ type, data }) => saveComplianceRecord(type, data),
    onSuccess: () => {
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["compliance-records"] });
      qc.invalidateQueries({ queryKey: ["compliance-summary"] });
    },
  });

  const initM = useMutation({
    mutationFn: () => Promise.all(types.map((type) => saveComplianceRecord(type, { status: "not_started" }))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["compliance-records"] });
      qc.invalidateQueries({ queryKey: ["compliance-summary"] });
    },
  });

  const taxM = useMutation({
    mutationFn: saveTaxProfile,
    onSuccess: () => {
      setTaxEditing(null);
      qc.invalidateQueries({ queryKey: ["tax-profile"] });
      qc.invalidateQueries({ queryKey: ["finance-compliance-summary"] });
    },
  });

  const credentialM = useMutation({
    mutationFn: saveEtimsCredentials,
    onSuccess: () => {
      setCredentialEditing(null);
      qc.invalidateQueries({ queryKey: ["etims-credentials"] });
    },
  });

  const invoiceQueueM = useMutation({
    mutationFn: queueEtimsInvoice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["etims-submissions"] });
      qc.invalidateQueries({ queryKey: ["finance-compliance-summary"] });
    },
  });

  const noteM = useMutation({
    mutationFn: createCreditDebitNote,
    onSuccess: () => {
      setNoteForm({ type: "credit", originalInvoice: "", totalAmount: "", taxAmount: "", reason: "" });
      qc.invalidateQueries({ queryKey: ["credit-debit-notes"] });
      qc.invalidateQueries({ queryKey: ["etims-submissions"] });
    },
  });

  const noteQueueM = useMutation({
    mutationFn: queueCreditDebitNote,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["credit-debit-notes"] });
      qc.invalidateQueries({ queryKey: ["etims-submissions"] });
    },
  });

  const rows = records.data?.data || [];
  const metrics = summary.data?.data || {};
  const fp = finance.data?.data || {};
  const profile = taxProfile.data?.data || {};
  const submissionsRows = submissions.data?.data || [];
  const notesRows = notes.data?.data || [];

  const cards = useMemo(
    () => [
      ["Tracked controls", metrics.total || 0, ShieldCheck],
      ["Expiring in 30 days", metrics.expiringSoon || 0, AlertTriangle],
      ["Action required", metrics.actionRequired || 0, FileCheck2],
      ["eTIMS synced", fp.etims?.synced || 0, CheckCircle2],
    ],
    [metrics, fp]
  );

  const begin = (row) => {
    setEditing({
      ...row,
      issueDate: row.issueDate ? String(row.issueDate).slice(0, 10) : "",
      expiryDate: row.expiryDate ? String(row.expiryDate).slice(0, 10) : "",
      nextReviewAt: row.nextReviewAt ? String(row.nextReviewAt).slice(0, 10) : "",
    });
  };

  const update = (key, value) => setEditing((current) => ({ ...current, [key]: value }));

  const startTaxEdit = () => {
    setTaxEditing({
      kraPin: profile.kraPin || "",
      vatRegistered: Boolean(profile.vatRegistered),
      vatNumber: profile.vatNumber || "",
      defaultVatRate: profile.defaultVatRate ?? 16,
      taxRegime: profile.taxRegime || "VAT",
      etimsEnabled: Boolean(profile.etimsEnabled),
      etimsSolution: profile.etimsSolution || "",
      etimsEnvironment: profile.etimsEnvironment || "sandbox",
      etimsDeviceId: profile.etimsDeviceId || "",
      etimsBranchId: profile.etimsBranchId || "",
      etimsBranchName: profile.etimsBranchName || "Head Office",
      etimsTillId: profile.etimsTillId || "",
      etimsInvoicePrefix: profile.etimsInvoicePrefix || "INV",
      etimsCredentialRef: profile.etimsCredentialRef || "",
      etimsAdapterUrl: profile.etimsAdapterUrl || "",
      complianceNotes: profile.complianceNotes || "",
    });
  };

  const startCredentialEdit = () => {
    setCredentialEditing({
      environment: environment,
      credentialRef: credential.data?.data?.credentialRef || "",
      certificateRef: credential.data?.data?.certificateRef || "",
      adapterToken: "",
      clientId: "",
      clientSecret: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Governance & tax</p>
          <h1 className="text-3xl font-bold">Compliance Centre</h1>
          <p className="mt-1 text-slate-500">
            Manage Kenyan regulatory controls, KRA tax configuration, eTIMS readiness, submission history and tax notes. KRA/provider certification remains an external requirement.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(([label, value, Icon]) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">{label}</span>
                <Icon size={19} />
              </div>
              <div className="mt-3 text-2xl font-bold">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
          {[
            ["etims", "eTIMS & KRA"],
            ["submissions", "Submission history"],
            ["notes", "Credit / debit notes"],
            ["controls", "Compliance controls"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === key ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "etims" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">KRA tax profile</p>
                  <h2 className="text-xl font-bold">Tax & eTIMS configuration</h2>
                </div>
                {profile.kraPin ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">KRA PIN configured</span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Not configured</span>
                )}
              </div>

              {!taxEditing ? (
                <>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div><span className="text-xs text-slate-500">KRA PIN</span><p className="font-semibold">{profile.kraPin || "—"}</p></div>
                    <div><span className="text-xs text-slate-500">VAT</span><p className="font-semibold">{profile.vatRegistered ? `Registered · ${profile.defaultVatRate}%` : "Not registered"}</p></div>
                    <div><span className="text-xs text-slate-500">eTIMS</span><p className="font-semibold">{profile.etimsEnabled ? `Enabled · ${profile.etimsEnvironment}` : "Disabled"}</p></div>
                    <div><span className="text-xs text-slate-500">Solution</span><p className="font-semibold">{profile.etimsSolution || "—"}</p></div>
                    <div><span className="text-xs text-slate-500">Branch / device</span><p className="font-semibold">{profile.etimsBranchId || "HQ"} / {profile.etimsDeviceId || "MAIN"}</p></div>
                    <div><span className="text-xs text-slate-500">Invoice prefix</span><p className="font-semibold">{profile.etimsInvoicePrefix || "INV"}</p></div>
                    <div className="sm:col-span-2"><span className="text-xs text-slate-500">Adapter</span><p className="break-all font-semibold">{profile.etimsAdapterUrl || "—"}</p></div>
                  </div>
                  <button type="button" className={`${buttonClass} mt-5`} onClick={startTaxEdit}><Save size={16} />Edit tax profile</button>
                </>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <input className={inputClass} placeholder="KRA PIN e.g. P051234567A" value={taxEditing.kraPin} onChange={(e) => setTaxEditing({ ...taxEditing, kraPin: e.target.value.toUpperCase() })} />
                  <input className={inputClass} placeholder="VAT number" value={taxEditing.vatNumber} onChange={(e) => setTaxEditing({ ...taxEditing, vatNumber: e.target.value })} />
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={taxEditing.vatRegistered} onChange={(e) => setTaxEditing({ ...taxEditing, vatRegistered: e.target.checked })} />VAT registered</label>
                  <input className={inputClass} type="number" min="0" max="100" placeholder="Default VAT rate" value={taxEditing.defaultVatRate} onChange={(e) => setTaxEditing({ ...taxEditing, defaultVatRate: Number(e.target.value) })} />
                  <select className={inputClass} value={taxEditing.taxRegime} onChange={(e) => setTaxEditing({ ...taxEditing, taxRegime: e.target.value })}><option value="VAT">VAT</option><option value="NON_VAT">Non-VAT</option></select>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={taxEditing.etimsEnabled} onChange={(e) => setTaxEditing({ ...taxEditing, etimsEnabled: e.target.checked })} />Enable eTIMS submission</label>
                  <select className={inputClass} value={taxEditing.etimsEnvironment} onChange={(e) => setTaxEditing({ ...taxEditing, etimsEnvironment: e.target.value })}><option value="sandbox">Sandbox</option><option value="production">Production</option></select>
                  <select className={inputClass} value={taxEditing.etimsSolution} onChange={(e) => setTaxEditing({ ...taxEditing, etimsSolution: e.target.value })}><option value="">Select solution</option><option value="OSCU">OSCU</option><option value="VSCU">VSCU</option><option value="THIRD_PARTY">Certified third-party adapter</option></select>
                  <input className={inputClass} placeholder="Branch ID" value={taxEditing.etimsBranchId} onChange={(e) => setTaxEditing({ ...taxEditing, etimsBranchId: e.target.value })} />
                  <input className={inputClass} placeholder="Branch name" value={taxEditing.etimsBranchName} onChange={(e) => setTaxEditing({ ...taxEditing, etimsBranchName: e.target.value })} />
                  <input className={inputClass} placeholder="Device ID" value={taxEditing.etimsDeviceId} onChange={(e) => setTaxEditing({ ...taxEditing, etimsDeviceId: e.target.value })} />
                  <input className={inputClass} placeholder="Till ID" value={taxEditing.etimsTillId} onChange={(e) => setTaxEditing({ ...taxEditing, etimsTillId: e.target.value })} />
                  <input className={inputClass} placeholder="Invoice prefix" value={taxEditing.etimsInvoicePrefix} onChange={(e) => setTaxEditing({ ...taxEditing, etimsInvoicePrefix: e.target.value.toUpperCase() })} />
                  <input className={inputClass} placeholder="Credential reference" value={taxEditing.etimsCredentialRef} onChange={(e) => setTaxEditing({ ...taxEditing, etimsCredentialRef: e.target.value })} />
                  <input className={`${inputClass} sm:col-span-2`} placeholder="Certified adapter URL (HTTPS in production)" value={taxEditing.etimsAdapterUrl} onChange={(e) => setTaxEditing({ ...taxEditing, etimsAdapterUrl: e.target.value })} />
                  <textarea className={`${inputClass} min-h-20 sm:col-span-2`} placeholder="Compliance notes" value={taxEditing.complianceNotes} onChange={(e) => setTaxEditing({ ...taxEditing, complianceNotes: e.target.value })} />
                  <div className="flex gap-2 sm:col-span-2">
                    <button type="button" className={buttonClass} disabled={taxM.isPending} onClick={() => taxM.mutate(taxEditing)}><Save size={16} />{taxM.isPending ? "Saving…" : "Save tax profile"}</button>
                    <button type="button" className="rounded-lg border px-4 py-2 text-sm font-semibold" onClick={() => setTaxEditing(null)}>Cancel</button>
                  </div>
                  {taxM.isError && <p className="text-sm text-red-600 sm:col-span-2">{taxM.error?.response?.data?.message || "Unable to save tax profile."}</p>}
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Secure credentials</p>
                  <h2 className="text-xl font-bold">eTIMS adapter credentials</h2>
                </div>
                {credential.data?.data?.configured ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Configured</span> : <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Missing</span>}
              </div>
              <p className="mt-2 text-sm text-slate-500">Secrets are write-only from this screen; stored values are encrypted server-side and are never returned to the browser.</p>

              {!credentialEditing ? (
                <>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div><span className="text-xs text-slate-500">Environment</span><p className="font-semibold uppercase">{environment}</p></div>
                    <div><span className="text-xs text-slate-500">Credential reference</span><p className="font-semibold">{credential.data?.data?.credentialRef || "—"}</p></div>
                    <div><span className="text-xs text-slate-500">Certificate reference</span><p className="font-semibold">{credential.data?.data?.certificateRef || "—"}</p></div>
                    <div><span className="text-xs text-slate-500">Last updated</span><p className="font-semibold">{formatDate(credential.data?.data?.updatedAt)}</p></div>
                  </div>
                  <button type="button" className={`${buttonClass} mt-5`} onClick={startCredentialEdit}><Save size={16} />Update credentials</button>
                </>
              ) : (
                <div className="mt-5 grid gap-3">
                  <select className={inputClass} value={credentialEditing.environment} onChange={(e) => setCredentialEditing({ ...credentialEditing, environment: e.target.value })}><option value="sandbox">Sandbox</option><option value="production">Production</option></select>
                  <input className={inputClass} placeholder="Credential reference" value={credentialEditing.credentialRef} onChange={(e) => setCredentialEditing({ ...credentialEditing, credentialRef: e.target.value })} />
                  <input className={inputClass} placeholder="Certificate reference" value={credentialEditing.certificateRef} onChange={(e) => setCredentialEditing({ ...credentialEditing, certificateRef: e.target.value })} />
                  <input className={inputClass} type="password" autoComplete="new-password" placeholder="Adapter token" value={credentialEditing.adapterToken} onChange={(e) => setCredentialEditing({ ...credentialEditing, adapterToken: e.target.value })} />
                  <input className={inputClass} autoComplete="off" placeholder="Client ID" value={credentialEditing.clientId} onChange={(e) => setCredentialEditing({ ...credentialEditing, clientId: e.target.value })} />
                  <input className={inputClass} type="password" autoComplete="new-password" placeholder="Client secret" value={credentialEditing.clientSecret} onChange={(e) => setCredentialEditing({ ...credentialEditing, clientSecret: e.target.value })} />
                  <div className="flex gap-2">
                    <button type="button" className={buttonClass} disabled={credentialM.isPending} onClick={() => credentialM.mutate(credentialEditing)}><Save size={16} />{credentialM.isPending ? "Saving…" : "Save credentials"}</button>
                    <button type="button" className="rounded-lg border px-4 py-2 text-sm font-semibold" onClick={() => setCredentialEditing(null)}>Cancel</button>
                  </div>
                  {credentialM.isError && <p className="text-sm text-red-600">{credentialM.error?.response?.data?.message || "Unable to save credentials."}</p>}
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
              <h2 className="text-xl font-bold">Readiness</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border p-4"><p className="text-xs text-slate-500">KRA PIN</p><p className="mt-1 font-semibold">{fp.compliance?.kraPinConfigured ? "Configured" : "Required"}</p></div>
                <div className="rounded-xl border p-4"><p className="text-xs text-slate-500">eTIMS configuration</p><p className="mt-1 font-semibold">{fp.compliance?.etimsConfigured ? "Configured" : "Incomplete"}</p></div>
                <div className="rounded-xl border p-4"><p className="text-xs text-slate-500">Production readiness</p><p className="mt-1 font-semibold">{fp.compliance?.productionReady ? "Configuration complete" : "Not ready"}</p></div>
              </div>
              {profile.etimsEnvironment === "production" && <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle size={18} className="mt-0.5 shrink-0" /><p>Production configuration should only be enabled after the selected OSCU/VSCU/third-party solution has completed the applicable KRA development, testing and certification process.</p></div>}
            </section>
          </div>
        )}

        {tab === "submissions" && (
          <section className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b p-6"><div className="flex items-center gap-2"><History size={19} /><h2 className="text-xl font-bold">eTIMS submission history</h2></div><p className="mt-1 text-sm text-slate-500">Durable audit records for invoice and tax-note submission attempts.</p></div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr><th className="p-3 text-left">Type</th><th className="p-3 text-left">Document</th><th className="p-3 text-left">Attempt</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Submitted</th><th className="p-3 text-right">Action</th></tr></thead>
              <tbody>
                {submissionsRows.map((row) => (
                  <tr key={row._id} className="border-t">
                    <td className="p-3 uppercase">{row.documentType || "—"}</td>
                    <td className="p-3"><div className="font-semibold">{row.documentNumber || "—"}</div><div className="text-xs text-slate-500">{row.etimsInvoiceNumber || row.etimsReceiptNumber || ""}</div></td>
                    <td className="p-3">{row.attempt || 1}</td>
                    <td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusTone(row.status)}`}>{row.status || "unknown"}</span></td>
                    <td className="p-3">{formatDate(row.submittedAt || row.createdAt)}</td>
                    <td className="p-3 text-right">{row.documentType === "invoice" && row.status !== "synced" && row.documentId ? <button type="button" className="rounded-lg border px-3 py-1.5 text-xs font-semibold" disabled={invoiceQueueM.isPending} onClick={() => invoiceQueueM.mutate(row.documentId)}>Queue / retry</button> : "—"}</td>
                  </tr>
                ))}
                {!submissionsRows.length && <tr><td colSpan="6" className="p-10 text-center text-slate-500">No eTIMS submissions recorded.</td></tr>}
              </tbody>
            </table>
          </section>
        )}

        {tab === "notes" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-bold">Issue tax note</h2>
              <p className="mt-1 text-sm text-slate-500">The original invoice must already be successfully synced to eTIMS.</p>
              <div className="mt-5 grid gap-3">
                <select className={inputClass} value={noteForm.type} onChange={(e) => setNoteForm({ ...noteForm, type: e.target.value })}><option value="credit">Credit note</option><option value="debit">Debit note</option></select>
                <input className={inputClass} placeholder="Original invoice MongoDB ID" value={noteForm.originalInvoice} onChange={(e) => setNoteForm({ ...noteForm, originalInvoice: e.target.value })} />
                <input className={inputClass} type="number" min="0.01" step="0.01" placeholder="Total amount" value={noteForm.totalAmount} onChange={(e) => setNoteForm({ ...noteForm, totalAmount: e.target.value })} />
                <input className={inputClass} type="number" min="0" step="0.01" placeholder="Tax amount" value={noteForm.taxAmount} onChange={(e) => setNoteForm({ ...noteForm, taxAmount: e.target.value })} />
                <textarea className={`${inputClass} min-h-24`} placeholder="Reason" value={noteForm.reason} onChange={(e) => setNoteForm({ ...noteForm, reason: e.target.value })} />
                <button type="button" className={buttonClass} disabled={noteM.isPending} onClick={() => noteM.mutate({ ...noteForm, totalAmount: Number(noteForm.totalAmount), taxAmount: Number(noteForm.taxAmount || 0) })}>{noteM.isPending ? "Issuing…" : "Issue & queue note"}</button>
                {noteM.isError && <p className="text-sm text-red-600">{noteM.error?.response?.data?.message || "Unable to issue note."}</p>}
              </div>
            </section>

            <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className="border-b p-6"><h2 className="text-xl font-bold">Issued notes</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50"><tr><th className="p-3 text-left">Type</th><th className="p-3 text-left">Original invoice</th><th className="p-3 text-left">eTIMS invoice</th><th className="p-3 text-left">Amount</th><th className="p-3 text-left">Status</th><th className="p-3 text-right">Action</th></tr></thead>
                  <tbody>
                    {notesRows.map((row) => (
                      <tr key={row._id} className="border-t">
                        <td className="p-3 capitalize">{row.type}</td>
                        <td className="p-3">{row.originalInvoiceNumber || "—"}</td>
                        <td className="p-3">{row.originalEtimsInvoiceNumber || "—"}</td>
                        <td className="p-3">KSh {Number(row.totalAmount || 0).toLocaleString()}</td>
                        <td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusTone(row.status)}`}>{row.status || "unknown"}</span></td>
                        <td className="p-3 text-right">{row.status !== "synced" ? <button type="button" className="rounded-lg border px-3 py-1.5 text-xs font-semibold" disabled={noteQueueM.isPending} onClick={() => noteQueueM.mutate(row._id)}>Queue / retry</button> : "—"}</td>
                      </tr>
                    ))}
                    {!notesRows.length && <tr><td colSpan="6" className="p-10 text-center text-slate-500">No credit/debit notes.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {tab === "controls" && (
          <>
            <section className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className="border-b p-6"><h2 className="text-xl font-bold">Regulatory controls</h2></div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50"><tr><th className="p-3 text-left">Control</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Authority</th><th className="p-3 text-left">Expiry</th><th className="p-3 text-left">Reference</th><th className="p-3 text-right">Action</th></tr></thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row._id} className="border-t">
                      <td className="p-3 font-semibold">{labels[row.type] || row.type}</td>
                      <td className="p-3 capitalize">{String(row.status || "not_started").replaceAll("_", " ")}</td>
                      <td className="p-3">{row.authority || "—"}</td>
                      <td className="p-3">{formatDate(row.expiryDate)}</td>
                      <td className="p-3">{row.referenceNumber || "—"}</td>
                      <td className="p-3 text-right"><button type="button" onClick={() => begin(row)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold">Edit</button></td>
                    </tr>
                  ))}
                  {!rows.length && <tr><td colSpan="6" className="p-10 text-center text-slate-500">No compliance records configured.</td></tr>}
                </tbody>
              </table>
            </section>

            {!rows.length && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <h2 className="font-bold text-emerald-900">Initialize compliance controls</h2>
                <p className="mt-1 text-sm text-emerald-800">Create TRA, ODPC, privacy, tax and eTIMS control records.</p>
                <button type="button" disabled={initM.isPending} onClick={() => initM.mutate()} className={`${buttonClass} mt-4`}>{initM.isPending ? "Initializing…" : "Initialize controls"}</button>
              </div>
            )}

            {editing && (
              <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Update control</p><h2 className="text-xl font-bold">{labels[editing.type] || editing.type}</h2></div>
                  <button type="button" onClick={() => setEditing(null)} className="text-sm text-slate-500">Cancel</button>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <select className={inputClass} value={editing.status || "not_started"} onChange={(e) => update("status", e.target.value)}>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select>
                  <input className={inputClass} placeholder="Authority" value={editing.authority || ""} onChange={(e) => update("authority", e.target.value)} />
                  <input className={inputClass} placeholder="Reference number" value={editing.referenceNumber || ""} onChange={(e) => update("referenceNumber", e.target.value)} />
                  <input className={inputClass} type="date" value={editing.issueDate || ""} onChange={(e) => update("issueDate", e.target.value)} />
                  <input className={inputClass} type="date" value={editing.expiryDate || ""} onChange={(e) => update("expiryDate", e.target.value)} />
                  <input className={inputClass} type="date" value={editing.nextReviewAt || ""} onChange={(e) => update("nextReviewAt", e.target.value)} />
                  <textarea className={`${inputClass} min-h-24 md:col-span-2 lg:col-span-3`} placeholder="Notes" value={editing.notes || ""} onChange={(e) => update("notes", e.target.value)} />
                </div>
                <button type="button" disabled={saveM.isPending} onClick={() => saveM.mutate({ type: editing.type, data: { status: editing.status, authority: editing.authority, referenceNumber: editing.referenceNumber, issueDate: editing.issueDate || null, expiryDate: editing.expiryDate || null, nextReviewAt: editing.nextReviewAt || null, notes: editing.notes || "", documents: editing.documents || [] } })} className={`${buttonClass} mt-4`}><Save size={16} />{saveM.isPending ? "Saving…" : "Save control"}</button>
                {saveM.isError && <p className="mt-2 text-sm text-red-600">{saveM.error?.response?.data?.message || "Unable to save compliance record."}</p>}
              </div>
            )}
          </>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          <ShieldCheck size={19} className="mt-0.5 shrink-0 text-emerald-700" />
          <p>Security note: tenant permissions remain enforced by the API. Never place KRA credentials, client secrets or certificates in frontend source code or Vite environment variables.</p>
          <XCircle size={19} className="mt-0.5 shrink-0 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
