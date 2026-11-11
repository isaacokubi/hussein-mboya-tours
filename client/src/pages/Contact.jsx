/**
 * Purpose: Contact page-level UI component. Main declarations: Contact, handleChange, submitHandler.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useState } from "react";
// Load react-router-dom so this module can use its exported dependencies.
import { useSearchParams } from "react-router-dom";
// Load framer-motion so this module can use its exported dependencies.
import { motion } from "framer-motion";
// Load lucide-react so this module can use its exported dependencies.
import { Phone, Mail, MapPin, Send, MessageCircle, Clock } from "lucide-react";
// Load react-icons/fa so this module can use its exported dependencies.
import { FaFacebook, FaInstagram } from "react-icons/fa";
// Load ../context/TenantContext so this module can use its exported dependencies.
import { useTenant } from "../context/TenantContext";
// Load ../context/SettingsContext so this module can use its exported dependencies.
import { useSettings } from "../context/SettingsContext";
// Load ./PaymentLink so this module can use its exported dependencies.
import PaymentLink from "./PaymentLink";

// Declare OFFICE_ADDRESS for use by the surrounding module or function.
const OFFICE_ADDRESS = "";
// Declare CONTACT_HERO for use by the surrounding module or function.
const CONTACT_HERO = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=92";

// Define Contact; its parameters and body implement this operation.
export default function Contact() {
  // Declare [searchParams] for use by the surrounding module or function.
  const [searchParams] = useSearchParams();
  // Declare paymentToken for use by the surrounding module or function.
  const paymentToken = searchParams.get("paymentToken");
  // Declare { tenant } for use by the surrounding module or function.
  const { tenant } = useTenant();
  // Declare { settings } for use by the surrounding module or function.
  const { settings } = useSettings();
  // Declare companyName for use by the surrounding module or function.
  const companyName = settings?.companyName || tenant?.name || "Hussein Mboya Tours";
  // Declare businessPhone for use by the surrounding module or function.
  const businessPhone = String(settings?.supportPhone || tenant?.contactPhone || "").trim();
  // Declare businessEmail for use by the surrounding module or function.
  const businessEmail = String(settings?.supportEmail || tenant?.contactEmail || "").trim();
  // Declare [form, setForm] for use by the surrounding module or function.
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  // Declare [error, setError] for use by the surrounding module or function.
  const [error, setError] = useState("");
  // Declare [sent, setSent] for use by the surrounding module or function.
  const [sent, setSent] = useState(false);

  // Check the condition (paymentToken) and run the matching branch.
  if (paymentToken) return <PaymentLink token={paymentToken} />;

  // Declare handleChange for use by the surrounding module or function.
  const handleChange = (event) => {
    // Declare { name, value } for use by the surrounding module or function.
    const { name, value } = event.target;
    // Perform the side effect or state update expressed on the following line.
    setForm((current) => ({ ...current, [name]: value }));
    // Perform the side effect or state update expressed on the following line.
    setError("");
    // Perform the side effect or state update expressed on the following line.
    setSent(false);
  };

  // Declare submitHandler for use by the surrounding module or function.
  const submitHandler = (event) => {
    // Perform the side effect or state update expressed on the following line.
    event.preventDefault();
    // Perform the side effect or state update expressed on the following line.
    setError("");
    // Perform the side effect or state update expressed on the following line.
    setSent(false);
    // Declare name for use by the surrounding module or function.
    const name = form.name.trim();
    // Declare email for use by the surrounding module or function.
    const email = form.email.trim();
    // Declare phone for use by the surrounding module or function.
    const phone = form.phone.trim();
    // Declare message for use by the surrounding module or function.
    const message = form.message.trim();
    // Check the condition (!name || !email || !message) and run the matching branch.
    if (!name || !email || !message) return setError("Please enter your name, email address and inquiry message.");
    // Check the condition (!/^\S+@\S+\.\S+$/.test(email)) and run the matching branch.
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
    // Check the condition (!businessEmail) and run the matching branch.
    if (!businessEmail) return setError("This tenant has not configured a support email yet.");
    // Declare subject for use by the surrounding module or function.
    const subject = encodeURIComponent(`Travel Inquiry from ${name}`);
    // Declare body for use by the surrounding module or function.
    const body = encodeURIComponent(`Hello ${companyName},\n\nI would like to make an inquiry.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\n\nMessage:\n${message}\n\nSent from the ${companyName} contact page.`);
    // Perform the side effect or state update expressed on the following line.
    window.location.href = `mailto:${businessEmail}?subject=${subject}&body=${body}`;
    // Perform the side effect or state update expressed on the following line.
    setSent(true);
    // Perform the side effect or state update expressed on the following line.
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  // Declare mapHref for use by the surrounding module or function.
  const mapHref = settings?.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}` : "";


  // Declare details for use by the surrounding module or function.
  const details = [
    { icon: Phone, title: "Phone", value: businessPhone || "Not configured", href: businessPhone ? `tel:${businessPhone.replace(/\s+/g, "")}` : "" },
    { icon: Mail, title: "Email", value: businessEmail || "Not configured", href: businessEmail ? `mailto:${businessEmail}` : "" },
    { icon: MapPin, title: "Office", value: settings?.address || OFFICE_ADDRESS, href: mapHref },
    { icon: Clock, title: "Working Hours", value: "Mon - Sat | 8AM - 6PM" },
  ];

  // Return the expression shown below to the caller.
  return (
    <div className="min-w-0 overflow-x-clip bg-white">
      <section className="relative flex min-h-[400px] items-center bg-cover bg-center sm:min-h-[480px]" style={{ backgroundImage: `url(${CONTACT_HERO})` }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative mx-auto w-full max-w-7xl px-4 text-white sm:px-6 lg:px-8">
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-3xl font-extrabold sm:text-4xl md:text-5xl lg:text-6xl">Contact Us</motion.h1>
          <p className="max-w-3xl text-sm text-gray-200 sm:text-base md:text-lg">Let our travel experts help you plan your next unforgettable African adventure.</p>
        </div>
      </section>
      <section className="py-10 sm:py-14 lg:py-16"><div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-6 lg:px-8">
          {details.map(({ icon: Icon, title, value, href }) => { const content = <><Icon size={34} className="mx-auto mb-3 text-yellow-500" /><h3 className="mb-2 text-base font-bold text-green-900 sm:text-lg">{title}</h3><p className="break-words text-xs text-gray-600 sm:text-sm">{value}</p></>; return <motion.div key={title} whileHover={{ y: -6 }} className="min-w-0 rounded-xl border bg-white p-5 text-center shadow-lg sm:p-6">{href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">{content}</a> : content}</motion.div>; })}
        </div></section>
      <section className="bg-gray-50 py-12 sm:py-16 lg:py-20"><div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
          <div className="min-w-0"><h2 className="mb-5 text-2xl font-bold text-green-900 sm:text-3xl lg:text-4xl">Start Planning Your Journey</h2><p className="mb-7 text-sm leading-relaxed text-gray-600 sm:text-base">Whether you want corporate travel management, airport transfers, car hire, meet and assist, conferences and events, a safari, beach holiday, honeymoon, mountain adventure or a customized tour, our team will create the right package for you.</p><div className="space-y-4 text-sm sm:text-base">{businessPhone && <a href={`tel:${businessPhone.replace(/\s+/g, "")}`} className="flex items-start gap-3 text-gray-700 hover:text-green-800"><MessageCircle className="mt-0.5 shrink-0 text-yellow-500" />Fast response from our travel consultants — call {businessPhone}</a>}{mapHref ? <a href={mapHref} target="_blank" rel="noreferrer" className="flex items-start gap-3 text-gray-700 hover:text-green-800"><MapPin className="mt-0.5 shrink-0 text-yellow-500" />Our office: {settings?.address}</a> : <div className="flex items-start gap-3 text-gray-700"><MapPin className="mt-0.5 shrink-0 text-yellow-500" />Our office location is configured by the travel company.</div>}</div></div>
          <motion.form onSubmit={submitHandler} noValidate initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="min-w-0 rounded-2xl bg-white p-4 shadow-xl sm:p-6 lg:p-8"><h3 className="mb-5 text-xl font-bold text-green-900 sm:text-2xl">Send An Inquiry</h3>{error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:text-sm">{error}</div>}{sent && <div role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-700 sm:text-sm">Your inquiry has been prepared in your email application. Please send the email to complete your inquiry.</div>}<div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" autoComplete="name" required className="w-full min-w-0 rounded-lg border p-2.5 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" /><input name="email" value={form.email} onChange={handleChange} placeholder="Email Address" type="email" autoComplete="email" required className="w-full min-w-0 rounded-lg border p-2.5 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" /></div><input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" type="tel" autoComplete="tel" className="mt-3 w-full min-w-0 rounded-lg border p-2.5 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" /><textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us about your trip..." rows={6} required className="mt-3 w-full min-w-0 resize-y rounded-lg border p-2.5 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" /><button type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-900 py-3 text-sm font-bold text-white hover:bg-green-800"><Send size={18} />Send Message</button><p className="mt-2 text-center text-[11px] text-gray-500">Inquiries are sent to {businessEmail || "the tenant support email"}.</p></motion.form>
        </div></section>
      <section className="bg-green-950 py-12 text-white sm:py-14"><div className="text-center"><h2 className="mb-5 text-2xl font-bold sm:text-3xl">Follow Our Adventures</h2><div className="flex justify-center gap-3 sm:gap-5">{settings?.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full bg-white/10 p-3 hover:bg-yellow-500 sm:p-4"><FaFacebook size={21} /></a>}{settings?.instagram && <a href={settings.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full bg-white/10 p-3 hover:bg-yellow-500 sm:p-4"><FaInstagram size={21} /></a>}{businessEmail && <a href={`mailto:${businessEmail}`} aria-label="Email" className="rounded-full bg-white/10 p-3 hover:bg-yellow-500 sm:p-4"><Mail size={21} /></a>}</div></div></section>
    </div>
  );
}