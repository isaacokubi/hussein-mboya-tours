import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../../api/axios";
import Pagination from "../../../components/admin/Pagination";

const PAGE_SIZE = 15;
const TAX_CODES = ["2100", "2110", "2120", "2130"];
const STATUTORY_CODES = ["2140", "2150"];

const ACCOUNT_LABELS = {
  "2100": "VAT / Tax Payable",
  "2110": "Output VAT",
  "2120": "Input VAT",
  "2130": "Withholding Tax Payable",
  "2140": "Payroll Liabilities",
  "2150": "Customer Deposits",
};

const money = (value) =>
  value == null
    ? "—"
    : `KES ${Number(value).toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

const date = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-KE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const label = (value) =>
  String(value || "manual")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const statusClass = (status) =>
  [
    "review_required",
    "reviewable",
    "uncollected_or_unlinked",
    "typed_payment_unlinked",
  ].includes(status)
    ? "border-amber-200 bg-amber-50 text-amber-900"
    : "border-emerald-200 bg-emerald-50 text-emerald-900";

const fetchReport = async (url, name) => {
  const response = (await api.get(url)).data;

  if (!response?.success) {
    throw new Error(`${name} returned an invalid response.`);
  }

  return response;
};

function ErrorBox({ query, name }) {
  if (!query.isError) return null;

  return (
    <div
      className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
      role="alert"
    >
      <b>{name} unavailable.</b> The API request failed, so no fallback
      accounting values are displayed.
    </div>
  );
}

function LoadingBox({ name }) {
  return (
    <div className="px-4 py-10 text-center" aria-live="polite">
      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" />
      <p className="mt-3 font-semibold text-slate-700">
        Loading {name.toLowerCase()}…
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Reading tenant-scoped posted accounting data.
      </p>
    </div>
  );
}

function Empty({ name }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="font-semibold text-slate-700">
        No posted {name.toLowerCase()} activity
      </p>
      <p className="mt-1 text-sm text-slate-500">
        No qualifying records exist for this reporting period.
      </p>
    </div>
  );
}

function MissingAccount({ code, name }) {
  return (
    <div className="px-4 py-8 text-center">
      <p className="font-semibold text-amber-800">
        Control account {code} is not configured
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {name} cannot be reported until the tenant chart of accounts contains
        an active {code} account. This is not treated as KES 0.00.
      </p>
    </div>
  );
}

function Metric({ title, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{money(value)}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Badge({ status, children }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
        status
      )}`}
    >
      {children}
    </span>
  );
}

function LedgerSummary({ data }) {
  if (!data?.accountFound) return null;

  return (
    <div className="grid gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-4">
      <div>
        <p className="text-xs text-slate-500">Opening balance</p>
        <p className="mt-1 font-bold text-slate-900">
          {money(data.openingBalance)}
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-500">Period debit</p>
        <p className="mt-1 font-semibold text-slate-800">
          {money(data.periodDebit)}
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-500">Period credit</p>
        <p className="mt-1 font-semibold text-slate-800">
          {money(data.periodCredit)}
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-500">Closing balance</p>
        <p className="mt-1 font-bold text-emerald-800">
          {money(data.closingBalance)}
        </p>
      </div>
    </div>
  );
}

function LedgerSection({ title, sub, type, from, to }) {
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: [`${type}-ledger`, from, to, page],
    queryFn: () =>
      fetchReport(
        `/admin/finance/accounting/${type}-ledger?from=${from}&to=${to}&page=${page}&pageSize=${PAGE_SIZE}`,
        `${title} report`
      ),
    staleTime: 15000,
    placeholderData: (previous) => previous,
  });

  const data = query.data?.data;
  const pagination = data?.pagination || {
    page,
    pages: 0,
    total: 0,
    pageSize: PAGE_SIZE,
  };

  const pageChange = (next) => {
    setPage(next);
    window.requestAnimationFrame(() => {
      document
        .getElementById(`${type}-ledger`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const rows = data?.rows || [];

  return (
    <section
      id={`${type}-ledger`}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{sub}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-right">
            <p className="text-xs text-emerald-700">Closing balance</p>
            <p className="font-bold text-emerald-900">
              {query.isError || !data?.accountFound
                ? "—"
                : money(data.closingBalance)}
            </p>
          </div>
        </div>
      </div>

      {query.isError ? (
        <ErrorBox query={query} name={title} />
      ) : query.isPending && !data ? (
        <LoadingBox name={title} />
      ) : !data?.accountFound ? (
        <MissingAccount
          code={data?.account || (type === "customer" ? "1100" : "2000")}
          name={
            type === "customer" ? "Accounts receivable" : "Accounts payable"
          }
        />
      ) : (
        <>
          <LedgerSummary data={data} />

          {query.isFetching && (
            <div
              className="border-b border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800"
              aria-live="polite"
            >
              Updating ledger page…
            </div>
          )}

          {rows.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-[1080px] w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      {[
                        "Date",
                        "Reference",
                        "Source",
                        "Description",
                        "Debit",
                        "Credit",
                        "Balance",
                      ].map((heading) => (
                        <th key={heading} className="px-4 py-3 text-left">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={`${row._id || row.entryNumber || row.reference}-${row.entryDate}`}
                        className="border-t border-slate-100 hover:bg-emerald-50/40"
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          {date(row.entryDate)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">
                            {row.reference || row.entryNumber || "Journal entry"}
                          </div>
                          {row.isDemoReference && (
                            <span className="mt-1 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                              TEST / DEMO
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-700">
                            {label(row.sourceType)}
                          </div>
                          {row.sourceId && (
                            <div
                              className="max-w-[180px] truncate text-xs text-slate-400"
                              title={String(row.sourceId)}
                            >
                              Source ID: {String(row.sourceId)}
                            </div>
                          )}
                        </td>
                        <td
                          className="max-w-[240px] truncate px-4 py-3 text-slate-600"
                          title={row.description || ""}
                        >
                          {row.description || "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {money(row.debit)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {money(row.credit)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {money(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onPageChange={pageChange}
              />
            </>
          ) : (
            <Empty name={type} />
          )}
        </>
      )}
    </section>
  );
}

function TaxAccountCards({ data }) {
  const rows = data?.rows || [];
  const byCode = new Map(rows.map((row) => [row.code, row]));
  const configured = new Set(
    data?.reconciliation?.availableTaxAccounts || []
  );
  const statutoryConfigured = new Set(
    data?.reconciliation?.availableStatutoryAccounts || []
  );

  const renderAccount = (code) => {
    const row = byCode.get(code);
    const isConfigured =
      configured.has(code) || statutoryConfigured.has(code);

    return (
      <div
        key={code}
        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {code}
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {ACCOUNT_LABELS[code] || "Control account"}
            </p>
          </div>

          <span
            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
              isConfigured
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {isConfigured ? "Configured" : "Missing"}
          </span>
        </div>

        <p className="mt-4 text-lg font-bold text-slate-900">
          {isConfigured ? money(row?.balance ?? 0) : "—"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {isConfigured
            ? "Posted journal balance"
            : "No active control account"}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Tax controls
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TAX_CODES.map(renderAccount)}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Other statutory controls
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {STATUTORY_CODES.map(renderAccount)}
        </div>
      </div>
    </div>
  );
}

export default function AccountingControlReports() {
  const year = new Date().getFullYear();
  const from = `${year}-01-01`;
  const to = `${year}-12-31`;

  const tax = useQuery({
    queryKey: ["tax-control", year],
    queryFn: () =>
      fetchReport(
        `/admin/finance/accounting/tax-control?from=${from}&to=${to}`,
        "Tax control report"
      ),
    staleTime: 15000,
  });

  const billing = useQuery({
    queryKey: ["billing-control", year],
    queryFn: () =>
      fetchReport(
        `/admin/finance/accounting/profitability?from=${from}&to=${to}`,
        "Service billing report"
      ),
    staleTime: 15000,
  });

  const td = tax.data?.data;
  const billingData = billing.data;
  const serviceRows = billingData?.data || [];
  const reconciliation = billingData?.reconciliation;
  const taxReconciliation = td?.reconciliation;
  const taxAccounts = taxReconciliation?.availableTaxAccounts || [];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 p-6 text-white shadow-lg sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
            Accounting controls
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            Tax, Ledgers &amp; Billing Controls
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50/80">
            Read-only controls from tenant-scoped posted journals, qualifying
            invoices and completed payments. Zeros are shown only when the
            corresponding report successfully confirms no qualifying activity.
          </p>
          <p className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs">
            Reporting period: {from} — {to}
          </p>
        </header>

        <ErrorBox query={tax} name="Tax control report" />
        <ErrorBox query={billing} name="Service billing report" />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            title="Output VAT"
            value={
              tax.isError || !taxAccounts.includes("2110")
                ? null
                : td?.outputVat
            }
            hint="Posted control account 2110"
          />
          <Metric
            title="Input VAT"
            value={
              tax.isError || !taxAccounts.includes("2120")
                ? null
                : td?.inputVat
            }
            hint="Posted control account 2120"
          />
          <Metric
            title="Net VAT"
            value={
              tax.isError ||
              !taxAccounts.includes("2110") ||
              !taxAccounts.includes("2120")
                ? null
                : td?.netVat
            }
            hint="Output VAT less Input VAT"
          />
          <Metric
            title="WHT payable"
            value={
              tax.isError || !taxAccounts.includes("2130")
                ? null
                : td?.withholdingTaxPayable
            }
            hint="Posted control account 2130"
          />
        </section>

        {tax.data && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-slate-900">
                  Tax reconciliation check
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Invoice tax is a supporting basis; posted tax journals remain
                  the accounting control source.
                </p>
              </div>
              <Badge status={taxReconciliation?.status}>
                {taxReconciliation?.status === "no_activity"
                  ? "No qualifying activity"
                  : "Reviewable control"}
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Tax accounts configured
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {taxReconciliation?.configuredTaxAccounts} / {taxReconciliation?.expectedTaxAccounts}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Qualifying invoices</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {taxReconciliation?.invoiceCount ?? "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Invoice VAT basis</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {money(taxReconciliation?.invoiceVatBasis)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Posted Output VAT</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {money(taxReconciliation?.outputVat ?? td?.outputVat)}
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Invoice VAT basis variance vs Output VAT
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {money(taxReconciliation?.invoiceOutputVatVariance)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Posted tax journal activity
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {money(taxReconciliation?.postedTaxActivity)}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              {taxReconciliation?.note}
            </p>
          </section>
        )}

        {billing.data && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-slate-900">
                  Service billing &amp; collection
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Invoices are measured by issue date. Collections are measured
                  by payment/refund date and can settle invoices issued before
                  the reporting period without being misclassified as unmatched.
                </p>
              </div>
              <Badge status={reconciliation?.status}>
                {reconciliation?.status === "review_required"
                  ? "Review required"
                  : "Payment links reconciled"}
              </Badge>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[1100px] w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    {[
                      "Service",
                      "Invoices",
                      "Invoiced",
                      "Collected",
                      "Refunded",
                      "Net collected",
                      "Outstanding",
                      "Net collection rate",
                      "Control",
                    ].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-left">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {serviceRows.map((row) => (
                    <tr
                      key={row.serviceType}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {label(row.serviceType)}
                      </td>
                      <td className="px-4 py-3">{row.invoiceCount}</td>
                      <td className="px-4 py-3">{money(row.invoiced)}</td>
                      <td className="px-4 py-3">{money(row.collected)}</td>
                      <td className="px-4 py-3">{money(row.refunded)}</td>
                      <td className="px-4 py-3 font-semibold">
                        {money(row.netCollected)}
                      </td>
                      <td className="px-4 py-3">
                        {money(row.outstanding)}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {row.collectionRate == null
                          ? "—"
                          : `${row.collectionRate}%`}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={row.reconciliationStatus}>
                          {row.unlinkedTypedPaymentCount
                            ? `${row.unlinkedTypedPaymentCount} typed payment${
                                row.unlinkedTypedPaymentCount === 1 ? "" : "s"
                              } unlinked`
                            : row.linkedPaymentCount
                            ? `${row.linkedPaymentCount} linked`
                            : "No linked collection"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reconciliation?.unmatchedPaymentCount > 0 && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {reconciliation.unmatchedPaymentCount} qualifying payment
                {reconciliation.unmatchedPaymentCount === 1 ? "" : "s"}{" "}require reconciliation ({money(reconciliation.unmatchedPaymentAmount)}). Payments with an explicit service type remain in that service group but are flagged until an invoice relationship is established.
              </div>
            )}

            {reconciliation?.outsidePeriodLinkedPaymentCount > 0 && (
              <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
                {reconciliation.outsidePeriodLinkedPaymentCount} linked
                collection
                {reconciliation.outsidePeriodLinkedPaymentCount === 1
                  ? ""
                  : "s"}{" "}settle invoice
                {reconciliation.outsidePeriodLinkedPaymentCount === 1
                  ? ""
                  : "s"}{" "}issued outside the reporting period (
                {money(reconciliation.outsidePeriodLinkedPaymentAmount)}).
              </div>
            )}
          </section>
        )}

        {tax.data && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-bold text-slate-900">
                Tax &amp; statutory control accounts
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Posted journal balances only. Configured accounts with no posted
                activity are shown as KES 0.00; missing accounts are shown as
                unavailable.
              </p>
            </div>
            <TaxAccountCards data={td} />
          </section>
        )}

        <section className="space-y-5">
          <LedgerSection
            title="Customer ledger"
            sub="Accounts receivable control account 1100"
            type="customer"
            from={from}
            to={to}
          />
          <LedgerSection
            title="Supplier ledger"
            sub="Accounts payable control account 2000"
            type="supplier"
            from={from}
            to={to}
          />
        </section>
      </div>
    </main>
  );
}
