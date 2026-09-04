import { useTenant } from '../context/TenantContext';
import { useSettings } from "../context/SettingsContext";
import { Phone, Mail, MapPin, Send, MessageCircle, Clock } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState } from "react";

const BUSINESS_PHONE = "0707476586";
const BUSINESS_EMAIL = "izobrack3@gmail.com";
const OFFICE_ADDRESS = "Nairobi, Kenya";
const CONTACT_HERO = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=92";

export default function Contact() {
  const { tenant } = useTenant();
  const { settings } = useSettings();
  const companyName = settings?.companyName || tenant?.name || "Global Tours";
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (error) setError("");
    if (sent) setSent(false);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setError("");
    setSent(false);
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const message = form.message.trim();
    if (!name || !email || !message) return setError("Please enter your name, email address and inquiry message.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
    const subject = encodeURIComponent(`Travel Inquiry from ${name}`);
    const body = encodeURIComponent(`Hello ${companyName},\n\nI would like to make an inquiry.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\n\nMessage:\n${message}\n\nSent from the ${companyName} contact page.`);
    window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  const details = [
    { icon: Phone, title: "Phone", value: BUSINESS_PHONE, href: `tel:${BUSINESS_PHONE}` },
    { icon: Mail, title: "Email", value: BUSINESS_EMAIL, href: `mailto:${BUSINESS_EMAIL}` },
    { icon: MapPin, title: "Office", value: OFFICE_ADDRESS, href: "https://www.google.com/maps/search/?api=1&query=Nairobi%2C%20Kenya" },
    { icon: Clock, title: "Working Hours", value: "Mon - Sat | 8AM - 6PM" },
  ];

  return (
    <div
      className="tenant-public-site min-w-0 overflow-x-clip bg-slate-950 text-slate-100"
      style={{ backgroundColor: "#020617", color: "#f1f5f9" }}
    >
      <section
        className="relative flex min-h-[400px] items-center bg-cover bg-center sm:min-h-[480px]"
        style={{ backgroundImage: `url(${CONTACT_HERO})` }}
      >
        <div className="absolute inset-0 bg-slate-950/75" />
        <div className="relative mx-auto w-full max-w-7xl px-4 text-white sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-3xl font-extrabold text-white sm:text-4xl md:text-5xl lg:text-6xl"
          >
            Contact Us
          </motion.h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base md:text-lg">
            Let our travel experts help you plan your next unforgettable African adventure.
          </p>
        </div>
      </section>

      <section className="bg-slate-950 py-10 text-slate-100 sm:py-14 lg:py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-6 lg:px-8">
          {details.map((item, index) => {
            const Icon = item.icon;
            const content = (
              <>
                <Icon size={34} className="mx-auto mb-3 text-yellow-400" />
                <h3 className="mb-2 text-base font-bold text-white sm:text-lg">{item.title}</h3>
                <p className="break-words text-xs text-slate-300 sm:text-sm">{item.value}</p>
              </>
            );

            return (
              <motion.div
                key={index}
                whileHover={{ y: -6 }}
                className="min-w-0 rounded-xl border border-slate-700 bg-slate-900 p-5 text-center shadow-xl shadow-black/20 sm:p-6"
              >
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900 py-12 text-slate-100 sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
          <div className="min-w-0">
            <h2 className="mb-5 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              Start Planning Your Journey
            </h2>
            <p className="mb-7 text-sm leading-relaxed text-slate-300 sm:text-base">
              Whether you want corporate travel management services, airport transfers, car hire and transport services, meet and assist services, conference and events services, a luxury safari, beach holiday, honeymoon experience, mountain adventure or customized tour, our team will create the perfect package for you.
            </p>
            <div className="space-y-4 text-sm sm:text-base">
              <a
                href={`tel:${BUSINESS_PHONE}`}
                className="flex items-start gap-3 text-slate-200 transition hover:text-yellow-400"
              >
                <MessageCircle className="mt-0.5 shrink-0 text-yellow-400" />
                <span>Fast response from our travel consultants — call {BUSINESS_PHONE}</span>
              </a>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Nairobi%2C%20Kenya"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 text-slate-200 transition hover:text-yellow-400"
              >
                <MapPin className="mt-0.5 shrink-0 text-yellow-400" />
                <span>Our office: {OFFICE_ADDRESS}</span>
              </a>
            </div>
          </div>

          <motion.form
            onSubmit={submitHandler}
            noValidate
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="min-w-0 rounded-2xl border border-slate-700 bg-slate-950 p-4 shadow-2xl shadow-black/30 sm:p-6 lg:p-8"
          >
            <h3 className="mb-5 text-xl font-bold text-white sm:text-2xl">Send An Inquiry</h3>

            {error && (
              <div role="alert" className="mb-4 rounded-lg border border-red-800 bg-red-950/70 p-3 text-xs text-red-200 sm:text-sm">
                {error}
              </div>
            )}

            {sent && (
              <div role="status" className="mb-4 rounded-lg border border-emerald-800 bg-emerald-950/70 p-3 text-xs text-emerald-200 sm:text-sm">
                Your inquiry has been prepared in your email application. Please send the email to complete your inquiry.
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
                autoComplete="name"
                required
                className="w-full min-w-0 rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                type="email"
                autoComplete="email"
                required
                className="w-full min-w-0 rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
              />
            </div>

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              type="tel"
              autoComplete="tel"
              className="mt-3 w-full min-w-0 rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            />

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us about your trip..."
              rows={6}
              required
              className="mt-3 w-full min-w-0 resize-y rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
            />

            <button
              type="submit"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              <Send size={18} />
              Send Message
            </button>

            <p className="mt-2 text-center text-[11px] text-slate-400">
              Inquiries are sent to {BUSINESS_EMAIL}.
            </p>
          </motion.form>
        </div>
      </section>

      <section className="bg-slate-950 py-12 text-white sm:py-14">
        <div className="text-center">
          <h2 className="mb-5 text-2xl font-bold text-white sm:text-3xl">Follow Our Adventures</h2>
          <div className="flex justify-center gap-3 sm:gap-5">
            <a href="#" aria-label="Facebook" className="rounded-full border border-slate-700 bg-slate-900 p-3 text-slate-100 transition hover:border-yellow-400 hover:bg-yellow-500 hover:text-slate-950 sm:p-4">
              <FaFacebook size={21} />
            </a>
            <a href="#" aria-label="Instagram" className="rounded-full border border-slate-700 bg-slate-900 p-3 text-slate-100 transition hover:border-yellow-400 hover:bg-yellow-500 hover:text-slate-950 sm:p-4">
              <FaInstagram size={21} />
            </a>
            <a href={`mailto:${BUSINESS_EMAIL}`} aria-label="Email" className="rounded-full border border-slate-700 bg-slate-900 p-3 text-slate-100 transition hover:border-yellow-400 hover:bg-yellow-500 hover:text-slate-950 sm:p-4">
              <Mail size={21} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
