import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getTourBySlug } from "../api/tourApi";
import { getTourReviews } from "../api/reviewApi";
import { CalendarDays, CheckCircle2, Clock3, MapPin, MessageCircle, ShieldCheck, Star, UsersRound, XCircle } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useTenant } from "../context/TenantContext";
import { getTourImage, getTourImages } from "../utils/tourImage";

const formatDate = (value, locale = "en-KE", timeZone = "Africa/Nairobi") => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return date.toLocaleDateString(locale, { timeZone, day: "numeric", month: "short", year: "numeric" });
  } catch {
    return date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  }
};

const formatPrice = (value, currency) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return "Price on request";
  try {
    return new Intl.NumberFormat("en-KE", { style: "currency", currency: currency || "KES", maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency || "KES"} ${amount.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
  }
};

const DetailList = ({ title, items, icon: Icon, emptyText }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-label={title}>
    <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900"><Icon size={19} aria-hidden="true" />{title}</h2>
    {items.length ? (
      <ul className="mt-4 space-y-2">
        {items.map((item, index) => <li key={`${title}-${index}`} className="flex gap-2 text-sm leading-6 text-slate-700"><CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-700" />{item}</li>)}
      </ul>
    ) : <p className="mt-3 text-sm leading-6 text-slate-500">{emptyText}</p>}
  </section>
);

export default function TourDetails() {
  const { slug } = useParams();
  const [currentTime, setCurrentTime] = useState(0);
  useEffect(() => { setCurrentTime(Date.now()); }, []);
  const { supportPhone, settings = {} } = useSettings() || {};
  const { tenant = {} } = useTenant() || {};
  const navigate = useNavigate();
  const tenantKey = tenant?._id || tenant?.id || tenant?.slug || "public";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["tour", tenantKey, slug],
    queryFn: () => getTourBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 0,
    refetchInterval: 15000,
  });

  const tour = data?.data || data;
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isError: reviewsError,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ["tour-reviews", tenantKey, tour?._id],
    queryFn: () => getTourReviews(tour?._id),
    enabled: Boolean(tour?._id),
    staleTime: 30000,
    retry: 1,
  });

  const reviews = Array.isArray(reviewsData?.reviews)
    ? reviewsData.reviews
    : Array.isArray(reviewsData?.data)
      ? reviewsData.data
      : Array.isArray(reviewsData)
        ? reviewsData
        : [];

  if (isLoading) return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5" aria-live="polite"><p>Loading tour details…</p></main>;
  if (error || !tour) return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-5 text-center"><h1 className="text-2xl font-bold text-slate-900">Tour details are unavailable</h1><p className="max-w-lg text-slate-600">This tour may have been removed, is not published for this travel company, or is temporarily unavailable.</p><button type="button" onClick={() => refetch()} className="rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white">Try again</button></main>;

  const images = getTourImages(tour);
  const image = getTourImage(tour);
  const currency = settings?.currency || tenant?.currency || "KES";
  const locale = settings?.locale || (settings?.language === "sw" ? "sw-KE" : "en-KE");
  const timeZone = settings?.timezone || tenant?.timezone || "Africa/Nairobi";
  const basePrice = Number(tour.price ?? 0);
  const explicitFinalPrice = Number(tour.finalPrice);
  const legacyDiscountPrice = Number(tour.discountPrice);
  const calculatedFinalPrice = Number(tour.discount) > 0 ? basePrice * (1 - Number(tour.discount) / 100) : basePrice;
  const finalPrice = tour.finalPrice != null && Number.isFinite(explicitFinalPrice) && explicitFinalPrice >= 0
    ? explicitFinalPrice
    : Number.isFinite(legacyDiscountPrice) && legacyDiscountPrice > 0
      ? legacyDiscountPrice
      : calculatedFinalPrice;
  const priceLabel = formatPrice(finalPrice, currency);
  const startDate = tour.startDate || tour.date;
  const endDate = tour.endDate;
  const slotsTotal = Number(tour.availabilitySettings?.totalSlots ?? tour.capacity ?? tour.totalSlots ?? 0);
  const slotsBooked = Number(tour.availabilitySettings?.bookedSlots ?? tour.bookedSlots ?? 0);
  const slotsRemaining = Math.max(0, slotsTotal - slotsBooked);
  const whatsappNumber = String(supportPhone || settings?.supportPhone || tenant?.contactPhone || "").replace(/\D/g, "").replace(/^0/, "254");
  const canWhatsApp = whatsappNumber.length >= 10;
  const highlights = Array.isArray(tour.highlights) ? tour.highlights.filter(Boolean) : [];
  const inclusions = Array.isArray(tour.inclusions) ? tour.inclusions.filter(Boolean) : [];
  const exclusions = Array.isArray(tour.exclusions) ? tour.exclusions.filter(Boolean) : [];
  const itinerary = Array.isArray(tour.itinerary) ? tour.itinerary : [];
  const languages = Array.isArray(tour.languages) ? tour.languages.filter(Boolean) : [];
  const hasDepartureInventory = Array.isArray(tour.availability) && tour.availability.length > 0;
  const departureOptions = (Array.isArray(tour.availability) ? tour.availability : [])
    .filter((departure) => {
      const date = new Date(departure.date);
      return currentTime > 0 && !Number.isNaN(date.getTime()) && date.getTime() >= currentTime &&
        Number(departure.totalSlots ?? 0) - Number(departure.bookedSlots ?? 0) > 0;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const bookingUnavailable = (slotsTotal > 0 && slotsRemaining <= 0) || (hasDepartureInventory && departureOptions.length === 0);
  const handleWhatsAppBooking = () => {
    if (!canWhatsApp) return;
    const message = encodeURIComponent(`Hello ${settings?.companyName || tenant?.name || "Travel team"}, I would like to enquire about "${tour.title}". Please confirm the available dates, final price, inclusions and booking terms.`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-[1.25fr_.75fr] lg:items-start">
          <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="relative aspect-[16/10] bg-slate-200">
              <img src={image} alt={tour.title || "Tour experience"} className="h-full w-full object-cover" fetchPriority="high" />
              {tour.category && <span className="absolute left-4 top-4 rounded-full bg-slate-950/80 px-3 py-1.5 text-sm font-bold text-white">{tour.category}</span>}
            </div>
            {images.length > 1 && <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-4">{images.slice(0, 4).map((src, index) => <img key={src} src={src} alt={`${tour.title || "Tour"} view ${index + 1}`} loading="lazy" className="aspect-[4/3] w-full rounded-xl object-cover" />)}</div>}
            <div className="p-5 sm:p-8">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><MapPin size={16} aria-hidden="true" />{tour.destination?.name || tour.location || tour.country || "Destination details on request"}</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{tour.title}</h1>
              {tour.shortDescription && <p className="mt-3 text-lg leading-7 text-slate-600">{tour.shortDescription}</p>}
              <p className="mt-5 whitespace-pre-line leading-7 text-slate-700">{tour.description}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="flex gap-3 rounded-xl bg-slate-50 p-4"><Clock3 size={19} className="mt-0.5 shrink-0 text-emerald-800" /><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Duration</p><p className="mt-1 font-bold">{tour.durationDetails?.days || tour.durationDays || tour.duration || "To be confirmed"} day(s){tour.durationDetails?.nights != null ? ` · ${tour.durationDetails.nights} night(s)` : ""}</p></div></div>
                <div className="flex gap-3 rounded-xl bg-slate-50 p-4"><CalendarDays size={19} className="mt-0.5 shrink-0 text-emerald-800" /><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Departure</p><p className="mt-1 font-bold">{formatDate(startDate, locale, timeZone) || "Confirm with the travel team"}{endDate && formatDate(endDate, locale, timeZone) && formatDate(endDate, locale, timeZone) !== formatDate(startDate, locale, timeZone) ? ` – ${formatDate(endDate, locale, timeZone)}` : ""}</p></div></div>
                <div className="flex gap-3 rounded-xl bg-slate-50 p-4"><UsersRound size={19} className="mt-0.5 shrink-0 text-emerald-800" /><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Availability</p><p className="mt-1 font-bold">{hasDepartureInventory ? `${departureOptions.length} departure option${departureOptions.length === 1 ? "" : "s"} with spaces` : slotsTotal ? (slotsRemaining > 0 ? `${slotsRemaining} of ${slotsTotal} spaces remaining` : "Currently full") : "Confirm availability before paying"}</p></div></div>
                <div className="flex gap-3 rounded-xl bg-slate-50 p-4"><MapPin size={19} className="mt-0.5 shrink-0 text-emerald-800" /><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Meeting point</p><p className="mt-1 font-bold">{tour.meetingPoint || "Confirm with the travel team"}</p></div></div>
              </div>
              {hasDepartureInventory && <section className="mt-8" aria-label="Available departures"><h2 className="text-xl font-extrabold">Available departures</h2>{departureOptions.length ? <ul className="mt-3 grid gap-3 sm:grid-cols-2">{departureOptions.map((departure, index) => <li key={departure._id || String(departure.date) + index} className="rounded-xl border border-slate-200 p-4"><p className="font-bold">{formatDate(departure.date, locale, timeZone)}</p><p className="mt-1 text-sm text-slate-600">{Math.max(0, Number(departure.totalSlots || 0) - Number(departure.bookedSlots || 0))} spaces available</p></li>)}</ul> : <p className="mt-3 text-sm text-slate-600">No published departure currently has spaces. Contact the travel team before making a booking.</p>}</section>}
              {highlights.length > 0 && <section className="mt-8" aria-label="Tour highlights"><h2 className="text-xl font-extrabold">Highlights</h2><ul className="mt-3 grid gap-2 sm:grid-cols-2">{highlights.map((item, index) => <li key={index} className="flex gap-2 text-sm leading-6"><CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-700" />{item}</li>)}</ul></section>}
              {itinerary.length > 0 && <section className="mt-8" aria-label="Day-by-day itinerary"><h2 className="text-xl font-extrabold">Day-by-day itinerary</h2><ol className="mt-4 space-y-4">{itinerary.map((day, index) => <li key={day._id || `${day.day || index}-${day.title || "day"}`} className="rounded-2xl border border-slate-200 p-4 sm:p-5"><p className="text-xs font-extrabold uppercase tracking-wide text-emerald-800">Day {day.day || index + 1}</p><h3 className="mt-1 text-lg font-bold">{day.title || `Day ${index + 1}`}</h3>{day.description && <p className="mt-2 leading-6 text-slate-600">{day.description}</p>}{Array.isArray(day.activities) && day.activities.length > 0 && <p className="mt-2 text-sm text-slate-600"><strong>Activities:</strong> {day.activities.join(", ")}</p>}{Array.isArray(day.meals) && day.meals.length > 0 && <p className="mt-1 text-sm text-slate-600"><strong>Meals:</strong> {day.meals.join(", ")}</p>}{day.accommodation && <p className="mt-1 text-sm text-slate-600"><strong>Accommodation:</strong> {day.accommodation}</p>}</li>)}</ol></section>}
              {languages.length > 0 && <p className="mt-6 text-sm text-slate-600"><strong>Languages:</strong> {languages.join(", ")}</p>}
            </div>
          </section>

          <aside className="space-y-5 lg:sticky lg:top-5">
            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6" aria-label="Booking and pricing">
              <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-800">Trip price</p>
              <div className="mt-2 flex flex-wrap items-baseline gap-3">{Number.isFinite(finalPrice) && finalPrice < basePrice && <span className="text-lg text-slate-400 line-through">{formatPrice(basePrice, currency)}</span>}<p className="text-3xl font-black">{priceLabel}</p></div>
              <p className="mt-2 text-sm leading-6 text-slate-500">Confirm the final price, traveler count, availability, taxes and any optional extras in your booking summary before payment.</p>
              <button type="button" onClick={() => navigate(`/checkout/tour/${tour._id}`)} disabled={bookingUnavailable} className="mt-5 w-full rounded-xl bg-emerald-800 px-5 py-3.5 font-extrabold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-400">{bookingUnavailable ? "No available departures" : "Check dates & book"}</button>
              {canWhatsApp && <button type="button" onClick={handleWhatsAppBooking} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-800 px-5 py-3 font-bold text-emerald-900 hover:bg-emerald-50"><MessageCircle size={18} aria-hidden="true" />Ask on WhatsApp</button>}
              <p className="mt-4 flex gap-2 text-xs leading-5 text-slate-500"><ShieldCheck size={15} className="mt-0.5 shrink-0" aria-hidden="true" />Payment options and confirmation are shown during checkout. Do not treat an unconfirmed payment as a completed booking.</p>
              {Number(tour.minimumAge) > 0 && <p className="mt-3 text-sm text-slate-600"><strong>Minimum age:</strong> {tour.minimumAge}</p>}
              {Number(tour.maximumAge) > 0 && Number(tour.maximumAge) < 99 && <p className="mt-1 text-sm text-slate-600"><strong>Maximum age:</strong> {tour.maximumAge}</p>}
              {tour.difficulty && <p className="mt-1 text-sm capitalize text-slate-600"><strong>Difficulty:</strong> {tour.difficulty}</p>}
              {Number(tour.bookingDeadline) > 0 && <p className="mt-1 text-sm text-slate-600"><strong>Booking deadline:</strong> {tour.bookingDeadline} day(s) before departure, subject to live availability.</p>}
            </section>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <DetailList title="What's included" items={inclusions} icon={CheckCircle2} emptyText="Ask the travel team to confirm exactly what is included in your quote." />
              <DetailList title="Not included" items={exclusions} icon={XCircle} emptyText="Confirm exclusions, taxes and optional extras before paying." />
            </div>
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-extrabold text-amber-950">Cancellation & booking terms</h2><p className="mt-2 whitespace-pre-line text-sm leading-6 text-amber-950/80">{tour.cancellationPolicy || "Cancellation, refund and change terms must be confirmed in your booking quote before payment."}</p></section>
          </aside>
        </div>

        <section className="mt-8 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8" aria-labelledby="reviews-heading">
          <div className="flex items-center gap-2"><Star className="text-amber-500" fill="currentColor" aria-hidden="true" /><h2 id="reviews-heading" className="text-2xl font-black">Customer reviews</h2></div>
          {reviewsLoading ? <p className="mt-4 text-slate-500" aria-live="polite">Loading approved reviews…</p> : reviewsError ? <div className="mt-4 flex flex-wrap items-center gap-3"><p className="text-red-700">Unable to load reviews.</p><button type="button" onClick={() => refetchReviews()} className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800">Retry</button></div> : <><p className="mt-2 text-sm text-slate-500">{reviews.length ? `${reviews.length} approved review${reviews.length === 1 ? "" : "s"}` : "No approved reviews yet."}</p><div className="mt-5 grid gap-4 md:grid-cols-2">{reviews.map((review) => { const stars = Math.max(0, Math.min(5, Number(review.rating) || 0)); return <article key={review._id} className="rounded-xl border border-slate-200 p-5"><div className="flex items-center justify-between gap-3"><strong>{review.user?.name || review.customer?.name || "Traveler"}</strong><span className="text-amber-600" aria-label={`${stars} out of 5 stars`}>{"★".repeat(stars)}{"☆".repeat(5 - stars)}</span></div>{review.title && <h3 className="mt-2 font-semibold">{review.title}</h3>}<p className="mt-2 whitespace-pre-line leading-6 text-slate-600">{review.comment || "No comment provided."}</p>{review.verified && <span className="mt-3 inline-block text-xs font-semibold text-sky-700">Verified customer</span>}</article>; })}</div></>}
        </section>
      </div>
    </main>
  );
}
