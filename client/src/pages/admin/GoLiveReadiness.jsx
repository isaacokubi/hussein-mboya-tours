import { Link } from "react-router-dom";
import { CheckCircle2, ExternalLink, ShieldCheck, CreditCard, Database, Activity, FileCheck2 } from "lucide-react";

const controls = [
  { title: "KRA / eTIMS", detail: "Complete the applicable KRA/eTIMS onboarding and connect the certified adapter before enabling production submission.", href: "/admin/compliance", label: "Open compliance", icon: FileCheck2 },
  { title: "TRA & tourism licensing", detail: "Record applicable licences, permits, issue dates, expiry dates and review dates in the compliance centre.", href: "/admin/compliance", label: "Review licences", icon: ShieldCheck },
  { title: "Payment providers", detail: "Configure each tenant's real M-Pesa, card, bank or other enabled gateway credentials and production callbacks.", href: "/admin/settings", label: "Open settings", icon: CreditCard },
  { title: "Backups & recovery", detail: "Configure production backups and perform a restore drill before relying on the deployment for live operations.", href: "/superadmin/database", label: "Open database", icon: Database },
  { title: "Monitoring", detail: "Use system health and request correlation IDs to monitor runtime availability and investigate failures.", href: "/admin/system-health", label: "Open health", icon: Activity },
  { title: "Finance & accounting", detail: "Review tax rules, invoices, payments, supplier costs, reconciliation and the automatically posted general ledger.", href: "/admin/finance", label: "Open finance", icon: CheckCircle2 },
];

export default function GoLiveReadiness() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-sm font-semibold text-green-700">Production readiness</p>
        <h1 className="text-2xl font-bold text-gray-900">Go-Live Readiness Center</h1>
        <p className="mt-1 max-w-3xl text-sm text-gray-600">Application-side controls are implemented here; external registrations, provider credentials, certification and deployment infrastructure must still be completed by the business or deployment team.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {controls.map(({ title, detail, href, label, icon: Icon }) => (
          <section key={title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-green-50 p-2 text-green-700"><Icon size={20} /></div>
              <div className="min-w-0"><h2 className="font-semibold text-gray-900">{title}</h2><p className="mt-2 text-sm leading-6 text-gray-600">{detail}</p></div>
            </div>
            <Link to={href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800">{label}<ExternalLink size={15}/></Link>
          </section>
        ))}
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <strong>Production boundary:</strong> the system never fabricates KRA/eTIMS receipts or silently reads an unrelated company's website. A website owner must authorize an integration through the supported connector/API before booking information is captured automatically.
      </div>
    </div>
  );
}
