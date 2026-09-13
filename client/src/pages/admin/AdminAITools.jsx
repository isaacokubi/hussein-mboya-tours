import { useEffect, useState } from "react";

import HusseinAIWidget from "../../components/HusseinAIWidget";
import AIAnalyticsCharts from "../../components/admin/AIAnalyticsCharts";
import AIOperationsCopilot from "../../components/admin/AIOperationsCopilot";
import AICustomerSupport from "../../components/admin/AICustomerSupport";
import AIRevenueAdvisor from "../../components/admin/AIRevenueAdvisor";

import { getDashboard } from "../../api/adminApi";
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
const unwrap = (response) => response?.data && typeof response.data === "object" ? response.data : (response || {});

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
  const [canonicalDashboard, setCanonicalDashboard] = useState(null);
  const [briefing, setBriefing] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [revenueAdvice, setRevenueAdvice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        getDashboard(),
        getAIDashboard(),
        getAIBriefing(),
        getAIAnalytics(),
        getAIIntelligence(),
        getAIRevenueAdvice()
      ]);

      if (!active) return;

      const [canonicalRes, dashboardRes, briefingRes, analyticsRes, intelligenceRes, revenueAdviceRes] = results;
      setCanonicalDashboard(canonicalRes.status === "fulfilled" ? unwrap(canonicalRes.value) : null);
      setDashboard(dashboardRes.status === "fulfilled" ? unwrap(dashboardRes.value) : null);
      setBriefing(briefingRes.status === "fulfilled" ? unwrap(briefingRes.value) : null);
      setAnalytics(analyticsRes.status === "fulfilled" ? unwrap(analyticsRes.value) : null);
      setIntelligence(intelligenceRes.status === "fulfilled" ? unwrap(intelligenceRes.value) : null);
      setRevenueAdvice(revenueAdviceRes.status === "fulfilled" ? unwrap(revenueAdviceRes.value) : null);
      setLoading(false);
    };

    load().catch((error) => {
      if (!active) return;
      console.error("AI dashboard loading failed", error);
      setLoading(false);
    });

    return () => { active = false; };
  }, []);

  const source = canonicalDashboard?.data || canonicalDashboard || {};
  const aiDashboard = dashboard?.data || dashboard || {};
  const aiIntelligence = intelligence?.data || intelligence || {};
  const aiRevenue = revenueAdvice?.data || revenueAdvice || {};
  const aiBriefing = briefing?.data || briefing || {};

  const bookingCount = numberValue(source.bookings ?? aiDashboard.bookings ?? aiIntelligence.totalBookings ?? aiRevenue.metrics?.totalBookings);
  const revenue = numberValue(source.revenue ?? aiDashboard.revenue ?? aiIntelligence.revenue ?? aiRevenue.metrics?.totalRevenue ?? aiBriefing.metrics?.revenue);
  const customers = numberValue(source.customers ?? aiDashboard.customers ?? aiIntelligence.totalCustomers);
  const vehicles = numberValue(source.vehicles ?? aiDashboard.vehicles ?? aiIntelligence.totalVehicles);
  const totalTours = numberValue(source.tours ?? aiDashboard.tours ?? aiIntelligence.totalTours ?? aiRevenue.metrics?.totalTours ?? aiBriefing.metrics?.totalTours);
  const confirmedBookings = numberValue(source.confirmedBookings ?? aiIntelligence.confirmedBookings ?? aiBriefing.metrics?.confirmedBookings);
  const completedBookings = numberValue(source.completedBookings ?? 0);
  const conversionRate = numberValue(source.conversionRate ?? aiIntelligence.conversionRate ?? (bookingCount !== null && bookingCount > 0 && confirmedBookings !== null ? (((confirmedBookings + completedBookings) / bookingCount) * 100).toFixed(1) : null));
  const failedPayments = numberValue(source.failedPayments ?? aiIntelligence.failedPayments ?? source.paymentStats?.failed);
  const customerRating = numberValue(source.customerRating ?? aiIntelligence.customerRating ?? aiBriefing.metrics?.rating ?? source.averageRating);
  const averageBooking = numberValue(source.averageBookingValue ?? aiIntelligence.averageBookingValue ?? (bookingCount !== null && bookingCount > 0 && revenue !== null ? revenue / bookingCount : null));
  const topTour = hasValue(source.topTour) ? source.topTour : (hasValue(aiIntelligence.topTour) ? aiIntelligence.topTour : (aiRevenue.topTours?.[0]?.tour?.title || source.popularTours?.[0]?.title || null));

  const derivedRecommendations = [];
  if (numberValue(source.pendingBookings) > 0) derivedRecommendations.push(`Follow up ${numberValue(source.pendingBookings)} pending booking(s) to improve conversion.`);
  if (numberValue(failedPayments) > 0) derivedRecommendations.push(`${numberValue(failedPayments)} failed payment attempt(s) need customer follow-up.`);
  if (bookingCount !== null && bookingCount < 20) derivedRecommendations.push("Increase targeted marketing activity while booking volume is still growing.");
  if (revenue !== null && revenue > 0) derivedRecommendations.push("Offer premium packages and add-ons to increase average booking value.");
  if (hasValue(topTour)) derivedRecommendations.push(`Prioritize promotion for ${topTour}, the current leading tour by recorded bookings.`);
  if (!derivedRecommendations.length) derivedRecommendations.push("Continue monitoring bookings, payments and tour performance for new opportunities.");

  const recommendations = aiRevenue.recommendations?.length ? aiRevenue.recommendations : (aiIntelligence.recommendations?.length ? aiIntelligence.recommendations : (aiBriefing.recommendations?.length ? aiBriefing.recommendations : derivedRecommendations));
  const briefingSummary = aiBriefing.summary || `Today's operations show ${numberValue(source.pendingBookings) ?? 0} pending bookings, ${numberValue(confirmedBookings) ?? 0} confirmed bookings, ${numberValue(source.paidBookings) ?? 0} paid bookings, KES ${Number(revenue ?? 0).toLocaleString()} recorded revenue and customer rating ${customerRating ?? 0}/5 across ${totalTours ?? 0} tours.`;

  const aiFeedUnavailable = [dashboard, briefing, analytics, intelligence, revenueAdvice].filter((item) => !item).length;
  const actualUnavailable = loading ? 0 : aiFeedUnavailable;
  const analyticsFallback = {
    monthlyRevenue: source.monthlyRevenue || [],
    statusData: source.statusData || [],
    totalRevenue: revenue
  };
  const hasAnalyticsData = Boolean(analytics || analyticsFallback.monthlyRevenue.length || analyticsFallback.statusData.length || revenue !== null || bookingCount !== null);
  const revenueAdvisorFallback = {
    metrics: {
      totalBookings: bookingCount,
      totalRevenue: revenue,
      totalTours
    },
    topTours: source.popularTours || [],
    recommendations
  };

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
              <span className={`h-2.5 w-2.5 rounded-full ${loading ? "animate-pulse bg-amber-300" : "bg-emerald-300"}`} />
              {loading ? "Loading intelligence" : "Business intelligence connected"}
            </div>
          </div>
        </header>

        {!loading && actualUnavailable > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 shadow-sm">
            <span className="mt-0.5 rounded-full bg-blue-200 px-2 py-0.5 text-xs font-black">i</span>
            <p><strong>Live business data is connected.</strong> Some optional AI enrichment feeds are offline, but the dashboard is using tenant business records as the authoritative fallback so metrics, briefing, analytics and recommendations remain populated.</p>
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
          <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/50 px-5 py-5 sm:px-6"><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Intelligence</p><h2 className="mt-1 text-xl font-black text-slate-900">AI Business Intelligence</h2><p className="mt-1 text-sm text-slate-500">Key indicators generated from the tenant's recorded business activity.</p></div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
            <Card title="Conversion Rate" value={loading ? "…" : metricValue(conversionRate, (value) => `${value}%`)} tone="emerald" detail={conversionRate === 0 ? "No converted bookings recorded" : "Confirmed/completed booking rate"} />
            <Card title="Failed Payments" value={loading ? "…" : metricValue(failedPayments)} tone="rose" detail={failedPayments === 0 ? "No failed payments recorded" : "Failed or cancelled payment records"} />
            <Card title="Customer Rating" value={loading ? "…" : metricValue(customerRating, (value) => `${value}/5`)} tone="amber" detail={customerRating === 0 ? "No ratings recorded" : "Average customer rating"} />
            <Card title="Average Booking" value={loading ? "…" : metricValue(averageBooking, (value) => `KES ${Math.round(Number(value)).toLocaleString()}`)} tone="blue" detail={averageBooking === 0 ? "No booking value available" : "Average recorded booking value"} />
            <Card title="Top Tour" value={loading ? "…" : metricValue(topTour)} tone="violet" detail={!hasValue(topTour) ? "No tour performance data" : "Leading tour by recorded bookings"} />
            <Card title="Total Tours" value={loading ? "…" : metricValue(totalTours)} tone="emerald" detail={totalTours === 0 ? "No tours recorded" : "Available tour records"} />
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm">
          <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 via-white to-orange-50 px-5 py-5 sm:px-6"><p className="text-xs font-bold uppercase tracking-widest text-amber-700">Daily intelligence</p><h2 className="mt-1 text-xl font-black text-slate-900">Daily AI Briefing</h2></div>
          <div className="p-5 sm:p-6">
            {loading ? <div className="animate-pulse space-y-3"><div className="h-4 w-3/4 rounded bg-slate-200" /><div className="h-4 w-full rounded bg-slate-100" /><div className="h-4 w-2/3 rounded bg-slate-100" /></div> : <p className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm leading-7 text-slate-700">{briefingSummary}</p>}
            {!loading && <div className="mt-5 space-y-2">{recommendations.slice(0, 4).map((item, index) => <div key={`${index}-${item}`} className="flex gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">{index + 1}</span><p className="text-sm leading-6 text-slate-700">{item}</p></div>)}</div>}
          </div>
        </section>

        <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5"><p className="text-xs font-bold uppercase tracking-widest text-blue-700">Performance</p><h2 className="mt-1 text-xl font-black text-slate-900">AI Analytics</h2><p className="mt-1 text-sm text-slate-500">Visual trends for revenue and booking activity.</p></div>
          {hasAnalyticsData ? <AIAnalyticsCharts analytics={analytics || {}} fallback={analyticsFallback} /> : <UnavailableState label="Analytics data unavailable" />}
        </section>

        <section className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm sm:p-6"><AIOperationsCopilot /></section>
        <section className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm sm:p-6"><AICustomerSupport /></section>
        <section className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm sm:p-6"><AIRevenueAdvisor data={aiRevenue} fallback={revenueAdvisorFallback} /></section>

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
