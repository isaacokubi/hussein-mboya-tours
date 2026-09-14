import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios";
import "./AccountingSubledgers.css";

const TYPES = ["inventory", "payroll", "accrual", "prepayment", "fx"];
const CURRENCIES = ["KES", "USD", "EUR", "GBP", "TZS", "UGX", "ZAR"];

const localDate = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const number = (value) => {
  if (value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) return "—";
  return Number(value).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const money = (value, currency = "KES") =>
  value === null || value === undefined || value === "" || !Number.isFinite(Number(value))
    ? "—"
    : `${currency} ${number(value)}`;

const titleCase = (value) => String(value || "").replace(/\b\w/g, (c) => c.toUpperCase());
const apiMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;

const initialForm = () => ({
  type: "inventory",
  reference: "",
  description: "",
  transactionDate: localDate(),
  amount: "",
  currency: "KES",
  exchangeRate: "1",
  quantity: "",
  unitCost: "",
  accountCode: "",
  contraAccountCode: "",
  direction: "in",
});

export default function AccountingSubledgers() {
  const qc = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [registerType, setRegisterType] = useState("all");
  const [clientError, setClientError] = useState("");

  const query = useQuery({
    queryKey: ["accounting-subledgers", registerType],
    queryFn: async () => {
      const suffix = registerType === "all" ? "" : `?type=${registerType}`;
      return (await api.get(`/admin/finance/accounting/subledgers${suffix}`)).data;
    },
    staleTime: 15_000,
  });

  const rows = query.data?.data || [];
  const serverSummary = query.data?.summary;

  const summary = useMemo(() => ({
    count: Number.isFinite(Number(serverSummary?.count)) ? Number(serverSummary.count) : rows.length,
    baseTotal: Number.isFinite(Number(serverSummary?.baseTotal)) ? Number(serverSummary.baseTotal) : rows.reduce((sum, row) => sum + Number(row.baseAmount || 0), 0),
    foreign: Number.isFinite(Number(serverSummary?.foreign)) ? Number(serverSummary.foreign) : rows.filter((row) => String(row.currency || "KES").toUpperCase() !== "KES").length,
  }), [rows, serverSummary]);

  const update = (key, value) => {
    setClientError("");
    setForm((current) => ({ ...current, [key]: value }));
  };

  const create = useMutation({
    mutationFn: async () => {
      const amount = Number(form.amount);
      const rate = Number(form.exchangeRate);
      const quantity = form.quantity === "" ? 0 : Number(form.quantity);
      const unitCost = form.unitCost === "" ? 0 : Number(form.unitCost);
      const currency = String(form.currency).toUpperCase();

      if (!form.reference.trim()) throw new Error("Reference is required.");
      if (!form.description.trim()) throw new Error("Description is required.");
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Amount must be greater than zero.");
      if (!Number.isFinite(rate) || rate <= 0) throw new Error("Rate to KES must be greater than zero.");
      if (currency === "KES" && rate !== 1) throw new Error("KES entries must use a rate of 1.00.");
      if (currency !== "KES" && rate === 1) throw new Error("Enter the explicit exchange rate to KES for non-KES entries.");
      if (form.type === "inventory" && (!Number.isFinite(quantity) || quantity <= 0)) throw new Error("Inventory quantity must be greater than zero.");
      if (form.type === "inventory" && (!Number.isFinite(unitCost) || unitCost <= 0)) throw new Error("Inventory unit cost must be greater than zero.");

      return api.post("/admin/finance/accounting/subledgers", {
        ...form,
        currency,
        amount,
        exchangeRate: rate,
        quantity,
        unitCost,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounting-subledgers"] });
      setForm(initialForm());
      setClientError("");
    },
    onError: (error) => setClientError(apiMessage(error, "Unable to save transaction.")),
  });

  const submit = (event) => {
    event.preventDefault();
    setClientError("");
    create.mutate();
  };

  const rateHelp = form.currency === "KES"
    ? "KES is the functional currency; rate must remain 1.00."
    : `1 ${form.currency} = ${form.exchangeRate || "—"} KES. An explicit rate is required.`;

  const registerLabel = registerType === "all" ? "All subledgers" : `${titleCase(registerType)} register`;

  return (
    <main className="subledger-page min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="subledger-header overflow-hidden rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-50">Management accounting</span>
              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Operational Subledgers</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50/90 sm:text-base">
                Tenant-scoped operational records for inventory, payroll, accruals, prepayments and foreign exchange. KES is the functional currency and non-KES entries require an explicit rate to KES.
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-emerald-50 backdrop-blur">
              <div className="font-semibold">Current register</div>
              <div className="mt-1 text-emerald-100">{registerLabel} · {summary.count.toLocaleString("en-KE")} record{summary.count === 1 ? "" : "s"}</div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="summary-card rounded-xl p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Records</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.count.toLocaleString("en-KE")}</p>
            <p className="mt-1 text-xs text-slate-500">{registerType === "all" ? "All tenant subledgers" : `${titleCase(registerType)} register`}</p>
          </div>
          <div className="summary-card rounded-xl p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Register value</p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">{money(summary.baseTotal)}</p>
            <p className="mt-1 text-xs text-slate-500">Reliable KES-equivalent values only</p>
          </div>
          <div className="summary-card rounded-xl p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Foreign currency</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.foreign.toLocaleString("en-KE")}</p>
            <p className="mt-1 text-xs text-slate-500">Records with explicit FX rates</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Record subledger transaction</h2>
              <p className="mt-1 text-sm text-slate-500">Transactions are posted to the accounting journal after successful validation.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">KES functional currency</span>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Field label="Type" required hint="Operational category">
                <select value={form.type} onChange={(e) => update("type", e.target.value)} className="field-control mt-1 w-full rounded-lg px-3 py-2.5 text-sm">{TYPES.map((type) => <option key={type} value={type}>{titleCase(type)}</option>)}</select>
              </Field>
              <Field label="Reference" required hint="Unique within this tenant">
                <input value={form.reference} onChange={(e) => update("reference", e.target.value)} maxLength={100} placeholder="e.g. INV-2026-001" className="field-control mt-1 w-full rounded-lg px-3 py-2.5 text-sm" />
              </Field>
              <Field label="Date" required>
                <input type="date" value={form.transactionDate} onChange={(e) => update("transactionDate", e.target.value)} className="field-control mt-1 w-full rounded-lg px-3 py-2.5 text-sm" />
              </Field>
              <Field label="Direction" required hint={form.type === "fx" ? "In = gain · Out = loss" : "In / gain · Out / loss"}>
                <select value={form.direction} onChange={(e) => update("direction", e.target.value)} className="field-control mt-1 w-full rounded-lg px-3 py-2.5 text-sm"><option value="in">In / gain</option><option value="out">Out / loss</option></select>
              </Field>
            </div>

            <Field label="Description" required hint="Clear audit-trail description">
              <input value={form.description} onChange={(e) => update("description", e.target.value)} maxLength={300} placeholder="Describe the transaction and business purpose" className="field-control mt-1 w-full rounded-lg px-3 py-2.5 text-sm" />
            </Field>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Field label="Amount" required hint="Enter the transaction currency amount">
                <input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => update("amount", e.target.value)} placeholder="0.00" className="field-control mt-1 w-full rounded-lg px-3 py-2.5 text-sm" />
              </Field>
              <Field label="Currency" required>
                <select value={form.currency} onChange={(e) => update("currency", e.target.value)} className="field-control mt-1 w-full rounded-lg px-3 py-2.5 text-sm">{CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}</select>
              </Field>
              <Field label="Rate to KES" required hint={rateHelp}>
                <input type="number" min="0.000001" step="0.000001" value={form.exchangeRate} disabled={form.currency === "KES"} onChange={(e) => update("exchangeRate", e.target.value)} className="field-control mt-1 w-full rounded-lg px-3 py-2.5 text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500" />
              </Field>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Base KES</p>
                <p className="mt-2 text-lg font-bold text-emerald-900">{form.amount && form.exchangeRate ? money(Number(form.amount) * Number(form.exchangeRate)) : "—"}</p>
                <p className="mt-1 text-xs text-emerald-700">Calculated before posting</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Field label="Quantity" hint={form.type === "inventory" ? "Required for inventory" : "Optional for this subledger type"}>
                <input type="number" min="0" step="0.01" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} placeholder="0" className="field-control mt-1 w-full rounded-lg px-3 py-2.5 text-sm" />
              </Field>
              <Field label="Unit cost" hint={form.type === "inventory" ? "Required for inventory" : "Optional"}>
                <input type="number" min="0" step="0.01" value={form.unitCost} onChange={(e) => update("unitCost", e.target.value)} placeholder="0.00" className="field-control mt-1 w-full rounded-lg px-3 py-2.5 text-sm" />
              </Field>
              <Field label="Account code" hint="Use the configured chart of accounts code">
                <input value={form.accountCode} onChange={(e) => update("accountCode", e.target.value)} maxLength={30} placeholder="e.g. 5200" className="field-control mt-1 w-full rounded-lg px-3 py-2.5 text-sm" />
              </Field>
              <Field label="Contra account" hint="Offsetting account code">
                <input value={form.contraAccountCode} onChange={(e) => update("contraAccountCode", e.target.value)} maxLength={30} placeholder="e.g. 2000" className="field-control mt-1 w-full rounded-lg px-3 py-2.5 text-sm" />
              </Field>
            </div>

            {(clientError || create.isError) && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{clientError || apiMessage(create.error, "Unable to save transaction.")}</div>}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">Posting creates the operational record and its corresponding journal entry. Duplicate tenant references are rejected.</p>
              <button type="submit" disabled={create.isPending} className="primary-action inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-bold text-white transition focus:outline-none focus:ring-4 focus:ring-emerald-100">{create.isPending ? "Posting…" : "Record transaction"}</button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{registerLabel}</h2>
              <p className="mt-1 text-sm text-slate-500">Tenant-scoped records with source amounts, KES equivalents and journal references.</p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="subledger-register-filter" className="text-xs font-bold uppercase tracking-wide text-slate-500">View</label>
              <select id="subledger-register-filter" value={registerType} onChange={(e) => setRegisterType(e.target.value)} className="field-control rounded-lg px-3 py-2 text-sm font-semibold">
                <option value="all">All subledgers</option>
                {TYPES.map((type) => <option key={type} value={type}>{titleCase(type)}</option>)}
              </select>
            </div>
          </div>

          {query.isError ? (
            <div className="p-8 text-center">
              <p className="font-semibold text-red-700">Unable to load the subledger register.</p>
              <p className="mt-1 text-sm text-slate-500">The system did not return reliable data, so financial zero values are not being substituted.</p>
              <button type="button" onClick={() => query.refetch()} className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-100">Retry</button>
            </div>
          ) : query.isLoading ? (
            <div className="p-8 text-center text-sm font-medium text-slate-500">Loading subledger records…</div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-semibold text-slate-800">No {registerType === "all" ? "subledger" : registerType} records yet.</p>
              <p className="mt-1 text-sm text-slate-500">Use the transaction form above to post a validated record. Existing records are never replaced with fabricated values.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] text-sm">
                <thead className="table-head">
                  <tr>
                    {["Date", "Type", "Reference", "Description", "Amount", "Currency", "Rate", "Base KES", "Qty", "Unit cost", "Accounts", "Status", "Journal"].map((heading) => <th key={heading} scope="col" className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide">{heading}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const currency = String(row.currency || "KES").toUpperCase();
                    const status = String(row.status || "draft").toLowerCase();
                    const hasRate = Number.isFinite(Number(row.exchangeRate)) && Number(row.exchangeRate) > 0;
                    const baseAmount = Number.isFinite(Number(row.baseAmount)) && Number(row.baseAmount) >= 0 ? Number(row.baseAmount) : null;
                    return (
                      <tr key={row._id} className="table-row border-t border-slate-100 align-top">
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">{row.transactionDate ? new Date(row.transactionDate).toLocaleDateString("en-KE") : "—"}</td>
                        <td className="px-4 py-4"><span className="type-pill inline-flex rounded-full px-2.5 py-1 text-xs font-bold">{titleCase(row.type)}</span></td>
                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">{row.reference || "—"}</td>
                        <td className="max-w-xs px-4 py-4 text-slate-600">{row.description || "—"}</td>
                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">{money(row.amount, currency)}</td>
                        <td className="px-4 py-4"><span className="currency-pill inline-flex rounded-full px-2.5 py-1 text-xs font-bold">{currency}</span></td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">{hasRate ? number(row.exchangeRate) : "Missing"}</td>
                        <td className="whitespace-nowrap px-4 py-4 font-bold text-emerald-700">{money(baseAmount)}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">{row.quantity !== null && row.quantity !== undefined && row.quantity !== "" ? number(row.quantity) : "—"}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">{row.unitCost !== null && row.unitCost !== undefined && row.unitCost !== "" ? money(row.unitCost, currency) : "—"}</td>
                        <td className="px-4 py-4 text-xs text-slate-600"><div>{row.accountCode || "—"}</div><div className="mt-1 text-slate-400">↔ {row.contraAccountCode || "—"}</div></td>
                        <td className="px-4 py-4"><span className={`status-badge status-${status}`}>{status}</span></td>
                        <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-slate-600">{row.journalReference || row.journalEntry?.entryNumber || row.journalEntry?.reference || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <span className="field-label text-xs">{label}{required ? <span className="ml-1 text-red-600" aria-hidden="true">*</span> : null}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] leading-4 text-slate-500">{hint}</span> : null}
    </label>
  );
}
