import { getTourImage } from "../utils/tourImage";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getTourBySlug } from "../api/tourApi";
import { getTourReviews } from "../api/reviewApi";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  MessageCircle,
  MoonStar,
  Star,
  Utensils,
  X,
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useState } from "react";

const asList = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);
const displayText = (value) => (typeof value === "string" ? value.trim() : "");
const getLocalDateInputValue = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};
const formatDuration = (tour) => {
  const value = tour?.durationDetails?.days || tour?.durationDays || tour?.duration;
  if (value === undefined || value === null || value === "") return "Confirm duration";
  const text = String(value).trim();
  if (/^\d+(?:\.\d+)?$/.test(text)) {
    const days = Number(text);
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  return text;
};
const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
};

function DetailList({ title, items, included = true }) {
  const values = asList(items).map((item) => typeof item === "string" ? item.trim() : "").filter(Boolean);
  if (!values.length) return null;
  const Icon = included ? Check : X;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <ul className="mt-4 space-y-3">
        {values.map((item, index) => (
          <li key={`${item}-${index}`} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
            <Icon size={17} className={`mt-1 shrink-0 ${included ? "text-emerald-600" : "text-slate-400"}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ItineraryDay({ day, index }) {
  const dayNumber = Number(day?.day ?? day?.dayNumber) > 0 ? Number(day?.day ?? day?.dayNumber) : index + 1;
  const activities = asList(day?.activities)
    .map((item) => typeof item === "string" ? item.trim() : displayText(item?.title || item?.name || item?.description))
    .filter(Boolean);
  const meals = asList(day?.meals)
    .map((item) => typeof item === "string" ? item.trim() : displayText(item?.name || item?.title))
    .filter(Boolean);
  const title = displayText(day?.title || day?.name) || `Day ${dayNumber}`;
  const description = displayText(day?.description || day?.summary || day?.overview);
  const accommodation = displayText(day?.accommodation || day?.lodging);

  return (
    <article className="relative grid gap-4 sm:grid-cols-[76px_minmax(0,1fr)] sm:gap-6">
      <div className="flex items-start sm:justify-center">
        <div className="inline-flex min-w-[68px] flex-col items-center rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-emerald-900">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-700">Day</span>
          <span className="mt-0.5 text-2xl font-black leading-none">{dayNumber}</span>
        </div>
      </div>
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-bold leading-snug text-slate-900 sm:text-xl">{title}</h3>
        {description && <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{description}</p>}

        {activities.length > 0 && (
          <div className="mt-5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Planned experiences</h4>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {activities.map((activity, activityIndex) => (
                <li key={`${activity}-${activityIndex}`} className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700">
                  <Check size={16} className="mt-1 shrink-0 text-emerald-600" />
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(meals.length > 0 || accommodation) && (
          <div className="mt-5 flex flex-wrap gap-3">
            {meals.length > 0 && (
              <div className="flex min-w-0 flex-1 items-start gap-2.5 rounded-xl border border-slate-100 px-3 py-3">
                <Utensils size={17} className="mt-0.5 shrink-0 text-emerald-700" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Meals</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{meals.join(" · ")}</p>
                </div>
              </div>
            )}
            {accommodation && (
              <div className="flex min-w-0 flex-1 items-start gap-2.5 rounded-xl border border-slate-100 px-3 py-3">
                <MoonStar size={17} className="mt-0.5 shrink-0 text-emerald-700" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Accommodation</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{accommodation}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function TourDetails() {
  const { slug } = useParams();
  const { supportPhone, settings } = useSettings();
  const navigate = useNavigate();
  const [whatsAppFormOpen, setWhatsAppFormOpen] = useState(false);
  const [whatsAppForm, setWhatsAppForm] = useState({
    fullName: "", phone: "", email: "", travelDate: "", adults: "2", children: "0", pickupLocation: "", notes: "",
  });
  const [whatsAppFormError, setWhatsAppFormError] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["tour", slug],
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
    queryKey: ["tour-reviews", tour?._id],
    queryFn: () => getTourReviews(tour?._id),
    enabled: Boolean(tour?._id),
    staleTime: 30000,
    retry: 1,
  });

  const reviews = Array.isArray(reviewsData?.reviews)
    ? reviewsData.reviews
    : Array.isArray(reviewsData)
      ? reviewsData
      : [];

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
        <p className="text-sm font-semibold text-slate-600" role="status">Loading tour details…</p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900">We couldn’t find this tour</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">The tour may have moved or may no longer be available. Browse our tours to find another experience.</p>
        <button onClick={() => navigate("/tours")} className="mt-5 rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white transition hover:bg-emerald-900">Explore tours</button>
      </div>
    );
  }

  const image = getTourImage(tour);
  const itinerarySource = Array.isArray(tour.itinerary)
    ? tour.itinerary
    : asList(tour.itinerary?.days || tour.itineraryDays);
  const itinerary = itinerarySource
    .filter((day) => day && typeof day === "object")
    .slice()
    .sort((a, b) => (Number(a.day ?? a.dayNumber) || 0) - (Number(b.day ?? b.dayNumber) || 0));
  const highlights = asList(tour.highlights);
  const destination = typeof tour.destination === "object"
    ? tour.destination?.name || tour.destination?.title
    : tour.destination;
  const price = Number(tour.finalPrice ?? tour.discountPrice ?? (Number(tour.discount) > 0
    ? Number(tour.price || 0) * (1 - Number(tour.discount) / 100)
    : tour.price));
  const currency = tour.currency || "KES";
  const departureDate = formatDate(tour.startDate || tour.date);
  const returnDate = formatDate(tour.endDate);

  const handleBooking = () => navigate(`/checkout/tour/${tour._id}`);

  const handleWhatsAppBooking = (event) => {
    event?.preventDefault?.();
    setWhatsAppFormError("");
    const rawNumber = String(supportPhone || "").replace(/\D/g, "");
    const whatsappNumber = rawNumber.startsWith("0")
      ? `254${rawNumber.slice(1)}`
      : rawNumber.startsWith("254")
        ? rawNumber
        : rawNumber.startsWith("7") || rawNumber.startsWith("1")
          ? `254${rawNumber}`
          : rawNumber;
    if (!whatsappNumber || whatsappNumber.length < 10) {
      setWhatsAppFormError("The tour operator’s WhatsApp contact is not configured correctly. Please use the Contact page.");
      return;
    }
    if (!whatsAppForm.fullName.trim()) return setWhatsAppFormError("Please enter the lead traveller’s full name.");
    if (!whatsAppForm.phone.trim()) return setWhatsAppFormError("Please enter a contact phone number.");
    if (!whatsAppForm.travelDate) return setWhatsAppFormError("Please choose your preferred travel date.");
    const travelDate = new Date(`${whatsAppForm.travelDate}T12:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(travelDate.getTime()) || travelDate < today) {
      return setWhatsAppFormError("Please choose today or a future travel date.");
    }
    const adults = Math.max(1, Math.min(50, Number(whatsAppForm.adults) || 1));
    const children = Math.max(0, Math.min(50, Number(whatsAppForm.children) || 0));
    const lines = [
      `Hello ${settings?.companyName || "Kenya Tours"}, I would like to arrange a booking.`,
      "",
      "TOUR BOOKING REQUEST",
      `Tour: ${tour.title}`,
      `Destination: ${destination || tour.location || "Please confirm"}`,
      `Tour reference: ${tour._id}`,
      `Preferred travel date: ${travelDate.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}`,
      `Travellers: ${adults} adult(s), ${children} child(ren)`,
      `Lead traveller: ${whatsAppForm.fullName.trim()}`,
      `Contact phone: ${whatsAppForm.phone.trim()}`,
      whatsAppForm.email.trim() ? `Email: ${whatsAppForm.email.trim()}` : "",
      whatsAppForm.pickupLocation.trim() ? `Pickup / meeting preference: ${whatsAppForm.pickupLocation.trim()}` : "",
      whatsAppForm.notes.trim() ? `Special requests: ${whatsAppForm.notes.trim()}` : "",
      "",
      "Please confirm availability, final pricing for this group, inclusions, itinerary, and secure payment/confirmation steps. I understand this is a request, not a confirmed reservation.",
    ].filter(Boolean);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-7 sm:px-6 sm:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-slate-100 shadow-sm">
            <img src={image} alt={tour.title} className="aspect-[16/10] w-full object-cover" />
          </div>
          <div className="py-1">
            <div className="flex flex-wrap items-center gap-2">
              {tour.category && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{tour.category}</span>}
              {tour.country && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{tour.country}</span>}
            </div>
            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">{tour.title}</h1>
            <p className="mt-4 whitespace-pre-line text-base leading-7 text-slate-600">{tour.shortDescription || tour.description}</p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5">
                <MapPin size={19} className="mt-0.5 shrink-0 text-emerald-700" />
                <div><p className="text-xs font-semibold text-slate-500">Destination</p><p className="mt-1 font-bold text-slate-900">{destination || tour.location || "Confirm with our team"}</p></div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5">
                <Clock3 size={19} className="mt-0.5 shrink-0 text-emerald-700" />
                <div><p className="text-xs font-semibold text-slate-500">Duration</p><p className="mt-1 font-bold text-slate-900">{formatDuration(tour)}</p></div>
              </div>
              {(departureDate || returnDate) && (
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5 sm:col-span-2">
                  <CalendarDays size={19} className="mt-0.5 shrink-0 text-emerald-700" />
                  <div><p className="text-xs font-semibold text-slate-500">Scheduled dates</p><p className="mt-1 font-bold text-slate-900">{departureDate || "Departure date to be confirmed"}{returnDate ? ` – ${returnDate}` : ""}</p></div>
                </div>
              )}
            </div>

            <div className="mt-7 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Tour price</p>
                <p className="mt-1 text-3xl font-black tracking-tight text-emerald-800">{currency} {Number.isFinite(price) ? price.toLocaleString("en-KE", { maximumFractionDigits: 2 }) : "Contact us"}</p>
                <p className="mt-1 text-xs text-slate-500">Confirm availability and what is included before payment.</p>
              </div>
              <div className="flex flex-col gap-2 sm:min-w-[200px]">
                <button onClick={handleBooking} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2">Book this tour <ArrowRight size={17} /></button>
                {supportPhone && <button type="button" onClick={() => { setWhatsAppFormError(""); setWhatsAppFormOpen((open) => !open); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 font-bold text-emerald-900 transition hover:bg-emerald-50"><MessageCircle size={17} /> {whatsAppFormOpen ? "Close WhatsApp booking" : "Book via WhatsApp"}</button>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {whatsAppFormOpen && supportPhone && (
        <section className="mx-auto mt-6 max-w-4xl px-4 sm:px-6 lg:px-8" aria-labelledby="whatsapp-booking-heading">
          <form onSubmit={handleWhatsAppBooking} className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700">Self-service booking request</p>
                <h2 id="whatsapp-booking-heading" className="mt-2 text-2xl font-black text-slate-950">Plan your trip on WhatsApp</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Enter your trip details once. We’ll prepare a booking request and open WhatsApp so you can review and send it to the tour team.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">No account needed</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">Lead traveller full name *
                <input required autoComplete="name" value={whatsAppForm.fullName} onChange={(event) => setWhatsAppForm((form) => ({ ...form, fullName: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" placeholder="Your full name" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Your contact phone *
                <input required type="tel" autoComplete="tel" value={whatsAppForm.phone} onChange={(event) => setWhatsAppForm((form) => ({ ...form, phone: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" placeholder="+254 7XX XXX XXX" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Email (optional)
                <input type="email" autoComplete="email" value={whatsAppForm.email} onChange={(event) => setWhatsAppForm((form) => ({ ...form, email: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" placeholder="you@example.com" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Preferred travel date *
                <input required type="date" min={getLocalDateInputValue()} value={whatsAppForm.travelDate} onChange={(event) => setWhatsAppForm((form) => ({ ...form, travelDate: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Adults
                <input required type="number" min="1" max="50" inputMode="numeric" value={whatsAppForm.adults} onChange={(event) => setWhatsAppForm((form) => ({ ...form, adults: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Children
                <input type="number" min="0" max="50" inputMode="numeric" value={whatsAppForm.children} onChange={(event) => setWhatsAppForm((form) => ({ ...form, children: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
              </label>
              <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">Pickup or meeting preference (optional)
                <input value={whatsAppForm.pickupLocation} onChange={(event) => setWhatsAppForm((form) => ({ ...form, pickupLocation: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" placeholder="e.g. Nairobi CBD, hotel name, or airport" />
              </label>
              <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">Special requests (optional)
                <textarea rows="3" value={whatsAppForm.notes} onChange={(event) => setWhatsAppForm((form) => ({ ...form, notes: event.target.value }))} className="mt-1.5 w-full resize-y rounded-xl border border-slate-300 px-3.5 py-3 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" placeholder="Accessibility needs, occasion, child ages, or other details" />
              </label>
            </div>
            {whatsAppFormError && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{whatsAppFormError}</p>}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-xs leading-5 text-slate-500">WhatsApp opens with your request filled in. Review it and tap Send. Your booking is not confirmed until the operator confirms availability and payment terms.</p>
              <button type="submit" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3.5 font-bold text-white transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"><MessageCircle size={18} /> Continue in WhatsApp <ArrowRight size={17} /></button>
            </div>
          </form>
        </section>
      )}

      <div className="mx-auto mt-8 grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-8">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="itinerary-heading">
            <div className="mb-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">Your journey, day by day</p>
              <h2 id="itinerary-heading" className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Daily itinerary</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">See the planned flow of your trip, including the experiences and arrangements recorded for each day.</p>
            </div>
            {itinerary.length ? (
              <div className="space-y-4">
                {itinerary.map((day, index) => <ItineraryDay key={`${day.day || index + 1}-${day.title || day.name || "day"}`} day={day} index={index} />)}
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
                <h3 className="font-bold text-amber-950">Detailed daily plan to be confirmed</h3>
                <p className="mt-2 text-sm leading-6 text-amber-900">A day-by-day schedule has not been published for this tour yet. Contact our team before booking to confirm the planned activities, meals, accommodation and timings.</p>
                {supportPhone && <button type="button" onClick={() => { setWhatsAppFormError(""); setWhatsAppFormOpen(true); }} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-950"><MessageCircle size={16} /> Ask about the itinerary</button>}
              </div>
            )}
          </section>

          {highlights.length > 0 && (
            <section>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Trip highlights</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {highlights.map((highlight, index) => (
                  <div key={`${highlight}-${index}`} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                    <Star size={17} className="mt-0.5 shrink-0 text-amber-500" />
                    <p className="text-sm leading-6 text-slate-700">{highlight}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(asList(tour.inclusions).length > 0 || asList(tour.exclusions).length > 0) && (
            <section>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">What’s included</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <DetailList title="Included in the price" items={tour.inclusions} />
                <DetailList title="Not included" items={tour.exclusions} included={false} />
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2"><Star className="text-amber-500" fill="currentColor" /><h2 className="text-xl font-black text-slate-950">Customer reviews</h2></div>
            {reviewsLoading ? (
              <p className="mt-3 text-sm text-slate-500" role="status">Loading customer reviews…</p>
            ) : reviewsError ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="text-sm text-slate-600">We couldn’t load reviews just now.</p>
                <button onClick={() => refetchReviews()} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Try again</button>
              </div>
            ) : (
              <>
                <p className="mt-1 text-sm text-slate-500">{reviews.length ? `${reviews.length} approved review${reviews.length === 1 ? "" : "s"}` : "No approved reviews yet."}</p>
                {reviews.length > 0 && <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {reviews.map((review) => {
                    const stars = Math.max(0, Math.min(5, Number(review.rating) || 0));
                    return (
                      <article key={review._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <strong className="text-sm text-slate-900">{review.user?.name || review.customer?.name || "Traveler"}</strong>
                          <span className="whitespace-nowrap text-sm text-amber-500" aria-label={`${stars} out of 5 stars`}>{"★".repeat(stars)}{"☆".repeat(5 - stars)}</span>
                        </div>
                        {review.title && <h3 className="mt-2 font-semibold text-slate-800">{review.title}</h3>}
                        <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment || "No comment provided."}</p>
                        {review.verified && <span className="mt-3 inline-block text-xs font-semibold text-sky-700">Verified customer</span>}
                      </article>
                    );
                  })}
                </div>}
              </>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">Travel with confidence</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Review the daily plan and confirm trip details with our team before you book.</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2"><Check size={17} className="mt-0.5 shrink-0 text-emerald-600" /><span>Clear day-by-day trip information where published</span></li>
              <li className="flex items-start gap-2"><Check size={17} className="mt-0.5 shrink-0 text-emerald-600" /><span>Review listed inclusions and exclusions</span></li>
              <li className="flex items-start gap-2"><Check size={17} className="mt-0.5 shrink-0 text-emerald-600" /><span>Ask about availability before payment</span></li>
            </ul>
            <button onClick={handleBooking} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 font-bold text-white hover:bg-emerald-900">Continue to booking <ArrowRight size={16} /></button>
          </div>
          {(tour.meetingPoint || tour.location) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-bold text-slate-900">Departure information</h2>
              {tour.meetingPoint && <p className="mt-3 text-sm leading-6 text-slate-700"><span className="font-semibold">Meeting point:</span> {tour.meetingPoint}</p>}
              {tour.location && <p className="mt-2 text-sm leading-6 text-slate-700"><span className="font-semibold">Area:</span> {tour.location}</p>}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
