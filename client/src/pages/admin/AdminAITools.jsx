import { useEffect, useState } from "react";

import HusseinAIWidget from "../../components/HusseinAIWidget";
import AIAnalyticsCharts from "../../components/admin/AIAnalyticsCharts";
import AIOperationsCopilot from "../../components/admin/AIOperationsCopilot";
import AICustomerSupport from "../../components/admin/AICustomerSupport";
import AIRevenueAdvisor from "../../components/admin/AIRevenueAdvisor";

import {
  getAIDashboard,
  getAIBriefing,
  getAIAnalytics,
  getAIIntelligence,
  getAIRevenueAdvice
} from "../../api/adminAIApi";

const hasValue = (value) => value !== undefined && value !== null && value !== "";
const numberValue = (value) => hasValue(value) && Number.isFinite(Number(value)) ? Number(value) : null;
const metricValue = (value, formatter = (item) => item) => hasValue(value) ? formatter(value) : "—";

const metricTone = {
  emerald: "border-emerald-100 bg-gradient-to-br from-emerald-50 to-white text-emerald-950",
  blue: "border-blue-100 bg-gradient-to-br from-blue-50 to-white text-blue-950",
  amber: "border-amber-100 bg-gradient-to-br from-amber-50 to-white text-amber-950",
  violet: "border-violet-100 bg-gradient-to-br from-violet-50 to-white text-violet-950",
  rose: "border-rose-100 bg-gradient-to-br from-rose-50 to-white text-rose-950",
  slate: "border-slate-200 bg-white text-slate-950"
};

export default function AdminAITools() {
  const [dashboard, setDashboard] = useState(null);
  const [briefing, setBriefing] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [revenueAdvice, setRevenueAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failedSections, setFailedSections] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        getAIDashboard(),
        getAIBriefing(),
        getAIAnalytics(),
        getAIIntelligence(),
        getAIRevenueAdvice()
      ]);

      if (!active) return;

      const [dashboardRes, briefingRes, analyticsRes, intelligenceRes, revenueAdviceRes] = results;
      setDashboard(dashboardRes.status === "fulfilled" ? dashboardRes.value?.data || null : null);
      setBriefing(briefingRes.status === "fulfilled" ? briefingRes.value?.data || null : null);
      setAnalytics(analyticsRes.status === "fulfilled" ? analyticsRes.value?.data || null : null);
      setIntelligence(intelligenceRes.status === "fulfilled" ? intelligenceRes.value?.data || null : null);
      setRevenueAdvice(revenueAdviceRes.status === "fulfilled" ? revenueAdviceRes.value?.data || null : null);
      setFailedSections(results.filter((result) => result.status === "rejected").length);
      setLoading(false);
    };

    load().catch((error) => {
      if (!active) return;
      console.error("AI dashboard loading failed", error);
      setFailedSections(5);
      setLoading(false);
    });

    return () => { active = false; };
  }, []);

  // The dashboard endpoint is the authoritative fallback for the core snapshot.
  // This prevents one secondary AI feed from hiding values that are already available.
  const bookingCount = numberValue(dashboard?.bookings ?? intelligence?.totalBookings ?? revenueAdvice?.metrics?.totalBookings);
  const revenue = numberValue(dashboard?.revenue ?? intelligence?.revenue ?? revenueAdvice?.metrics?.totalRevenue ?? briefing?.metrics?.revenue);
  const customers = numberValue(dashboard?.customers ?? intelligence?.totalCustomers);
  const vehicles = numberValue(dashboard?.vehicles ?? intelligence?.totalVehicles);
  const totalTours = numberValue(dashboard?.tours ?? intelligence?.totalTours ?? revenueAdvice?.metrics?.totalTours ?? briefing?.metrics?.totalTours);

  const conversionRate = numberValue(intelligence?.conversionRate);
  const failedPayments = numberValue(intelligence?.failedPayments);
  const customerRating = numberValue(intelligence?.customerRating ?? briefing?.metrics?.rating);
  const averageBooking = numberValue(intelligence?.averageBookingValue);
  const topTour = hasValue(intelligence?.topTour) ? intelligence.topTour : null;
  const recommendations = revenueAdvice?.recommendations || intelligence?.recommendations || briefing?.recommendations || [];

  const availableFeeds = [dashboard, briefing, analytics, intelligence, revenueAdvice].filter(Boolean).length;
  const actualUnavailable = loading ? 0 : 5 - availableFeeds;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 p-6 text-white shadow-xl sm:p-8">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-300/20 blur-2xl" />
          <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-amber-300/10 blur-2xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">AI Operations</div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">AI Control Center</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">Intelligent business assistance for operations, analytics, revenue and customer management.</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur">
              <span className={`h-2.5 w-2.5 rounded-full ${loading ? "animate-pulse bg-amber-300" : actualUnavailable ? "bg-amber-300" : "bg-emerald-300"}`} />
              {loading ? "Loading intelligence" : actualUnavailable ? `${actualUnavailable} AI feed${actualUnavailable === 1 ? "" : "s"} unavailable` : "AI feeds connected"}
            </div>
          </div>
        </header>

        {actualUnavailable > 0 && !loading && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
            <span className="mt-0.5 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-black">!</span>
            <p><strong>Some AI data is unavailable.</strong> Available business values are still displayed from the other connected feeds. A dash (—) means no source returned that particular value.</p>
          </div>
        )}

        <section>
          <div className="mb-4"><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Live snapshot</p><h2 className="mt-1 text-xl font-black text-slate-900">Business overview</h2></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card title="Bookings" value={loading ? "…" : metricValue(bookingCount)} tone="emerald" detail={bookingCount === 0 ? "No bookings recorded" : "Total recorded bookings"} />
            <Card title="Revenue" value={loading ? "…" : metricValue(revenue, (value) => `KES ${Number(value).toLocaleString()}`)} tone="amber" detail={revenue === 0 ? "No revenue recorded" : "Recorded revenue"} />
            <Card title="Customers" value={loading ? "…" : metricValue(customers)} tone="blue" detail={customers === 0 ? "No customers recorded" : "Total customer records"} />
            <Card title="Vehicles" value={loading ? "…" : metricValue(vehicles)} tone="violet" detail={vehicles === 0 ? "No vehicles recorded" : "Fleet records"} />
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/50 px-5 py-5 sm:px-6"><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Intelligence</p><h2 className="mt-1 text-xl font-black text-slate-900">AI Business Intelligence</h2><p className="mt-1 text-sm text-slate-500">Key indicators generated from the available business data.</p></div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
            <Card title="Conversion Rate" value={loading ? "…" : metricValue(conversionRate, (value) => `${value}%`)} tone="emerald" detail={conversionRate === 0 ? "No converted bookings recorded" : "Confirmed/completed booking rate"} />
            <Card title="Failed Payments" value={loading ? "…" : metricValue(failedPayments)} tone="rose" detail={failedPayments === 0 ? "No failed payments recorded" : "Failed payment records"} />
            <Card title="Customer Rating" value={loading ? "…" : metricValue(customerRating, (value) => `${value}/5`)} tone="amber" detail={customerRating === 0 ? "No ratings recorded" : "Average customer rating"} />
            <Card title="Average Booking" value={loading ? "…" : metricValue(averageBooking, (value) => `KES ${Math.round(Number(value)).toLocaleString()}`)} tone="blue" detail={averageBooking === 0 ? "No booking value available" : "Average booking value"} />
            <Card title="Top Tour" value={loading ? "…" : metricValue(topTour)} tone="violet" detail={!hasValue(topTour) ? "No tour performance data" : "Leading tour by bookings"} />
            <Card title="Total Tours" value={loading ? "…" : metricValue(totalTours)} tone="emerald" detail={totalTours === 0 ? "No tours recorded" : "Available tour records"} />
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm">
          <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 via-white to-orange-50 px-5 py-5 sm:px-6"><p className="text-xs font-bold uppercase tracking-widest text-amber-700">Daily intelligence</p><h2 className="mt-1 text-xl font-black text-slate-900">Daily AI Briefing</h2></div>
          <div className="p-5 sm:p-6">
            {loading ? <div className="animate-pulse space-y-3"><div className="h-4 w-3/4 rounded bg-slate-200" /><div className="h-4 w-full rounded bg-slate-100" /><div className="h-4 w-2/3 rounded bg-slate-100" /></div> : briefing?.summary ? <p className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm leading-7 text-slate-700">{briefing.summary}</p> : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center"><p className="font-semibold text-slate-700">No briefing available</p><p className="mt-1 text-xs text-slate-500">The AI briefing service did not return a summary for this period.</p></div>}
            {!!briefing?.recommendations?.length && <div className="mt-5 space-y-2">{briefing.recommendations.map((item, index) => <div key={`${index}-${item}`} className="flex gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">{index + 1}</span><p className="text-sm leading-6 text-slate-700">{item}</p></div>)}</div>}
          </div>
        </section>

        <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-widest text-blue-700">Performance</p><h2 className="mt-1 text-xl font-black text-slate-900">AI Analytics</h2><p className="mt-1 text-sm text-slate-500">Visual trends for revenue and booking activity.</p></div>{analytics ? <AIAnalyticsCharts analytics={analytics} /> : <UnavailableState label="Analytics data unavailable" />}</section>
        <section className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6"><AIOperationsCopilot /></section>
        <section className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm sm:p-6"><AICustomerSupport /></section>
        <section className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm sm:p-6"><AIRevenueAdvisor data={revenueAdvice || {}} /></section>

        <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
          <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-teal-50 px-5 py-5 sm:px-6"><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Customer experience</p><h2 className="mt-1 text-xl font-black text-slate-900">Customer AI Assistant</h2><p className="mt-1 text-sm text-slate-500">AI-powered assistance for customer conversations and travel questions.</p></div>
          <div className="p-5 sm:p-6"><HusseinAIWidget /></div>
        </section>
      </div>
    </div>
  );
}

function Card({ title, value, tone = "slate", detail }) {
  return <div className={`group rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${metricTone[tone] || metricTone.slate}`}><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p><p className="mt-3 break-words text-2xl font-black tracking-tight sm:text-3xl">{value}</p>{detail && <p className="mt-2 text-xs font-medium text-slate-500">{detail}</p>}</div>;
}

function UnavailableState({ label }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">{label}. This is shown as unavailable rather than zero.</div>;
}
