import { Boxes, Cloud, Database, GitBranch, Server, ShieldCheck, Sparkles } from "lucide-react";
import DeveloperPlatformCenter from "../../components/admin/DeveloperPlatformCenter";
import PaymentGatewayCenter from "../../components/admin/PaymentGatewayCenter";
import PrivacyRequests from "./PrivacyRequests";

const layers = [
  ["Customer experience", "React + Vite", "Public website, tour discovery, booking, custom requests, checkout and reviews", Boxes],
  ["Business services", "Node.js + Express", "Sales, CRM, quotations, bookings, finance, operations, RBAC and notifications", Server],
  ["Data layer", "MongoDB + Mongoose", "Tenant-isolated customers, tours, bookings, payments, resources and audit data", Database],
  ["Integrations", "M-Pesa · Stripe · PayPal · PesaPal · Cloudinary · Email · AI", "Payments, media, customer communications and intelligent assistance", Cloud],
];

const controlCards = [
  ["Multi-tenant isolation", "Tenant-aware models, queries, permissions and branding keep business data separated.", ShieldCheck],
  ["Scalable delivery", "Frontend, API, database and integrations remain independently extensible.", GitBranch],
  ["Intelligent operations", "AI assists support, booking risk, operations, analytics and finance while humans retain approval control.", Sparkles],
];

export default function PlatformArchitecture() {
  return (
    <div className="admin-control-center min-h-screen bg-[var(--tenant-background,#f8fafc)] p-4 text-[var(--tenant-text,#0f172a)] md:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="admin-dashboard-hero mb-7 rounded-3xl p-6 text-white shadow-xl md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">Platform architecture</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Tourism platform ecosystem</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-50/80 md:text-base">Production architecture, security controls, tenant payment infrastructure, privacy governance and integration management.</p>
        </header>

        <section className="grid gap-5 md:grid-cols-2" aria-label="Platform architecture layers">
          {layers.map(([title, tech, desc, Icon]) => (
            <section key={title} className="admin-panel rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-start gap-4">
                <div className="admin-icon-badge rounded-xl p-3"><Icon size={22} /></div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                  <p className="mt-1 font-semibold text-emerald-800">{tech}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
                </div>
              </div>
            </section>
          ))}
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-3" aria-label="Platform controls">
          {controlCards.map(([title, desc, Icon]) => (
            <section key={title} className="admin-panel rounded-2xl p-6">
              <Icon className="text-emerald-700" size={22} />
              <h2 className="mt-3 font-bold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
            </section>
          ))}
        </section>

        <div className="mt-6 space-y-6">
          <PaymentGatewayCenter />
          <DeveloperPlatformCenter />
          <PrivacyRequests />
        </div>
      </div>
    </div>
  );
}
