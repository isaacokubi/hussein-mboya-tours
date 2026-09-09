import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, AlertTriangle, FileCheck2 } from "lucide-react";
import { getComplianceRecords, getComplianceSummary } from "../../api/complianceApi";

const labels = { TRA_LICENSE: "TRA licence", ODPC_REGISTRATION: "ODPC registration", PRIVACY_POLICY: "Privacy policy", DATA_RETENTION: "Data retention", DPA_REVIEW: "DPA review", BREACH_RESPONSE: "Breach response", KRA_TAX_PROFILE: "KRA tax profile", ETIMS_ONBOARDING: "eTIMS onboarding" };

export default function AdminCompliance() {
  const summary = useQuery({ queryKey: ["compliance-summary"], queryFn: getComplianceSummary, refetchInterval: 60000 });
  const records = useQuery({ queryKey: ["compliance-records"], queryFn: getComplianceRecords, refetchInterval: 60000 });
  const rows = records.data?.data || [];
  const metrics = summary.data?.data || {};
  const cards = useMemo(() => [["Tracked controls", metrics.total || 0, ShieldCheck], ["Expiring in 30 days", metrics.expiringSoon || 0, AlertTriangle], ["Action required", metrics.actionRequired || 0, FileCheck2]], [metrics]);

  return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-7xl">
    <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Governance</p><h1 className="text-3xl font-bold">Compliance Centre</h1><p className="mt-1 text-slate-500">Track tenant regulatory records, reviews, expiry dates and eTIMS readiness. This workflow does not replace legal or regulator approval.</p></div>
    <div className="grid gap-4 sm:grid-cols-3">{cards.map(([label,value,Icon]) => <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex justify-between"><span className="text-sm text-slate-500">{label}</span><Icon size={19}/></div><div className="mt-3 text-2xl font-bold">{value}</div></div>)}</div>
    <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-3 text-left">Control</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Authority</th><th className="p-3 text-left">Expiry</th><th className="p-3 text-left">Reference</th></tr></thead><tbody>{rows.map((row) => <tr key={row._id} className="border-t"><td className="p-3 font-semibold">{labels[row.type] || row.type}</td><td className="p-3 capitalize">{String(row.status || "not_started").replaceAll("_", " ")}</td><td className="p-3">{row.authority || "—"}</td><td className="p-3">{row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : "—"}</td><td className="p-3">{row.referenceNumber || "—"}</td></tr>)}{!rows.length && <tr><td colSpan="5" className="p-10 text-center text-slate-500">No compliance records have been configured yet.</td></tr>}</tbody></table></div>
  </div></div>;
}
