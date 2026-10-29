import PaymentGatewayCenter from "../../components/admin/PaymentGatewayCenter";

export default function MpesaConfiguration() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Tenant settings</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">M-Pesa Configuration</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Configure this tenant’s Daraja credentials separately for Sandbox and Production. Validate checks OAuth connectivity only and never starts a payment.
        </p>
      </header>
      <PaymentGatewayCenter mpesaOnly />
    </div>
  );
}
