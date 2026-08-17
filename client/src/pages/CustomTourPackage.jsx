import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Send,
  Users,
} from "lucide-react";

export default function CustomTourPackage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    destination: "",
    travelDate: "",
    travelers: 1,
    duration: "",
    budget: "",
    interests: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSubmitted(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <section className="min-h-screen bg-slate-50">
      {/* HERO */}
      <div className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.22),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
              Bespoke Kenya Travel
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Create Your Custom Tour Package
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Tell us how you want to experience Kenya and our travel team
              will design a personalized safari, beach holiday, cultural
              experience, or adventure around your needs.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur">
                <MapPin className="h-4 w-4 text-emerald-400" />
                Kenya destinations
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur">
                <Users className="h-4 w-4 text-emerald-400" />
                Flexible group sizes
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur">
                <CalendarDays className="h-4 w-4 text-emerald-400" />
                Flexible dates
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {submitted && (
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>

              <div>
                <h2 className="font-bold text-emerald-900">
                  Request received
                </h2>

                <p className="mt-1 text-sm leading-6 text-emerald-800">
                  Thank you for submitting your custom tour request. Our team
                  can review your preferences and contact you with a tailored
                  itinerary.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* FORM */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                Tour Planner
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                Tell us about your trip
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                The more details you provide, the better we can tailor your
                experience.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* CONTACT */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-900">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Full Name *
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email Address *
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="email"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+254 7XX XXX XXX"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="mb-4 text-lg font-bold text-slate-900">
                  Trip Details
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="destination"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Preferred Destination *
                    </label>

                    <select
                      id="destination"
                      name="destination"
                      required
                      value={formData.destination}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    >
                      <option value="">Select destination</option>
                      <option value="Maasai Mara">Maasai Mara</option>
                      <option value="Amboseli">Amboseli</option>
                      <option value="Tsavo">Tsavo</option>
                      <option value="Samburu">Samburu</option>
                      <option value="Lake Nakuru">Lake Nakuru</option>
                      <option value="Diani Beach">Diani Beach</option>
                      <option value="Mombasa">Mombasa</option>
                      <option value="Watamu">Watamu</option>
                      <option value="Multiple Destinations">
                        Multiple Destinations
                      </option>
                      <option value="Not Sure">Not Sure</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="travelDate"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Preferred Travel Date
                    </label>

                    <input
                      id="travelDate"
                      name="travelDate"
                      type="date"
                      value={formData.travelDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="travelers"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Number of Travelers *
                    </label>

                    <input
                      id="travelers"
                      name="travelers"
                      type="number"
                      min="1"
                      required
                      value={formData.travelers}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="duration"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Trip Duration
                    </label>

                    <select
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    >
                      <option value="">Select duration</option>
                      <option value="1-3 days">1–3 days</option>
                      <option value="4-6 days">4–6 days</option>
                      <option value="7-10 days">7–10 days</option>
                      <option value="11-14 days">11–14 days</option>
                      <option value="15+ days">15+ days</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="budget"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Approximate Budget
                    </label>

                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    >
                      <option value="">Select budget range</option>
                      <option value="Under KES 100,000">
                        Under KES 100,000
                      </option>
                      <option value="KES 100,000 - 250,000">
                        KES 100,000 – 250,000
                      </option>
                      <option value="KES 250,000 - 500,000">
                        KES 250,000 – 500,000
                      </option>
                      <option value="KES 500,000 - 1,000,000">
                        KES 500,000 – 1,000,000
                      </option>
                      <option value="Above KES 1,000,000">
                        Above KES 1,000,000
                      </option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* INTERESTS */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="mb-4 text-lg font-bold text-slate-900">
                  Your Preferences
                </h3>

                <div>
                  <label
                    htmlFor="interests"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    What would you like to experience?
                  </label>

                  <textarea
                    id="interests"
                    name="interests"
                    rows="4"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder="Safari, beach holiday, wildlife, photography, culture, hiking, luxury accommodation..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Additional Information
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us anything else we should know about your trip..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
              >
                <Send className="h-4 w-4" />
                Request Custom Package
              </button>
            </form>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-3xl bg-emerald-700 p-6 text-white shadow-sm">
              <h2 className="text-xl font-black">
                Build a trip around you
              </h2>

              <p className="mt-3 text-sm leading-6 text-emerald-50">
                Your custom itinerary can be shaped around your schedule,
                interests, group size and preferred travel style.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  "Personalized itinerary",
                  "Flexible travel dates",
                  "Safari and beach combinations",
                  "Accommodation recommendations",
                  "Transport and tour coordination",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" />
                    <span className="text-sm font-medium text-white">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">
                Need help?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Our travel team can help you choose destinations and create a
                practical itinerary.
              </p>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <Phone className="h-4 w-4 text-emerald-600" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="text-sm font-semibold text-slate-800">
                      Contact our travel team
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="text-sm font-semibold text-slate-800">
                      Send us your requirements
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <MapPin className="h-4 w-4 text-amber-600" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Destination</p>
                    <p className="text-sm font-semibold text-slate-800">
                      Kenya & East Africa
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
