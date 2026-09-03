import { useTenant } from '../context/TenantContext';
import { useSettings } from "../context/SettingsContext";
import { Phone, Mail, MapPin, Send, MessageCircle, Globe, Clock } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState } from "react";

const CONTACT_HERO = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=92";

export default function Contact() {
  const { tenant } = useTenant();
  const { supportPhone, supportEmail, settings } = useSettings();
  const companyName = settings?.companyName || tenant?.name || 'Your Travel Company';
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const handleChange = (e) => { const { name, value } = e.target; setForm((current) => ({ ...current, [name]: value })); if (error) setError(""); if (sent) setSent(false); };
  const submitHandler = (e) => {
    e.preventDefault(); setError(""); setSent(false);
    const name = form.name.trim(), email = form.email.trim(), phone = form.phone.trim(), message = form.message.trim();
    if (!name || !email || !message) return setError("Please enter your name, email address and inquiry message.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
    if (!supportEmail?.trim()) return setError("Our inquiry email is not configured yet. Please use the phone number above.");
    const subject = encodeURIComponent(`Travel Inquiry from ${name}`);
    const body = encodeURIComponent(`Hello ${companyName},\n\nI would like to make an inquiry.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\n\nMessage:\n${message}\n\nSent from the ${companyName} contact page.`);
    window.location.href = `mailto:${supportEmail.trim()}?subject=${subject}&body=${body}`;
    setSent(true); setForm({ name: "", email: "", phone: "", message: "" });
  };
  const details = [
    { icon: Phone, title: "Phone", value: supportPhone || "Contact us" },
    { icon: Mail, title: "Email", value: supportEmail || "Contact us" },
    { icon: MapPin, title: "Office", value: "Nairobi, Kenya" },
    { icon: Clock, title: "Working Hours", value: "Mon - Sat | 8AM - 6PM" },
  ];

  return <div className="min-w-0 overflow-x-clip bg-white">
    <section className="relative flex min-h-[400px] items-center bg-cover bg-center sm:min-h-[480px]" style={{ backgroundImage: `url(${CONTACT_HERO})` }}><div className="absolute inset-0 bg-black/60" /><div className="relative mx-auto w-full max-w-7xl px-4 text-white sm:px-6 lg:px-8"><motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-3xl font-extrabold sm:text-4xl md:text-5xl lg:text-6xl">Contact Us</motion.h1><p className="max-w-3xl text-sm text-gray-200 sm:text-base md:text-lg">Let our travel experts help you plan your next unforgettable African adventure.</p></div></section>
    <section className="py-10 sm:py-14 lg:py-16"><div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-6 lg:px-8">{details.map((item, index) => { const Icon = item.icon; return <motion.div key={index} whileHover={{ y: -6 }} className="min-w-0 rounded-xl border bg-white p-5 text-center shadow-lg sm:p-6"><Icon size={36} className="mx-auto mb-3 text-yellow-500" /><h3 className="mb-2 text-base font-bold text-green-900 sm:text-lg">{item.title}</h3><p className="break-words text-xs text-gray-600 sm:text-sm">{item.value}</p></motion.div>; })}</div></section>
    <section className="bg-gray-50 py-12 sm:py-16 lg:py-20"><div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8"><div className="min-w-0"><h2 className="mb-5 text-2xl font-bold text-green-900 sm:text-3xl lg:text-4xl">Start Planning Your Journey</h2><p className="mb-7 text-sm leading-relaxed text-gray-600 sm:text-base">Whether you want corporate travel management services, airport transfers, car hire and transport services, meet and assist services, conference and events services, a luxury safari, beach holiday, honeymoon experience, mountain adventure or customized tour, our team will create the perfect package for you.</p><div className="space-y-4 text-sm sm:text-base"><div className="flex items-start gap-3"><MessageCircle className="mt-0.5 shrink-0 text-yellow-500" /><span>Fast response from our travel consultants</span></div><div className="flex items-start gap-3"><MapPin className="mt-0.5 shrink-0 text-yellow-500" /><span>Experience personalized journeys with local experts</span></div></div></div>
      <motion.form onSubmit={submitHandler} noValidate initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="min-w-0 rounded-2xl bg-white p-4 shadow-xl sm:p-6 lg:p-8"><h3 className="mb-5 text-xl font-bold text-green-900 sm:text-2xl">Send An Inquiry</h3>{error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:text-sm">{error}</div>}{sent && <div role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-700 sm:text-sm">Your inquiry has been prepared in your email application. Please send the email to complete your inquiry.</div>}<div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" autoComplete="name" required className="w-full min-w-0 rounded-lg border p-2.5 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100" /><input name="email" value={form.email} onChange={handleChange} placeholder="Email Address" type="email" autoComplete="email" required className="w-full min-w-0 rounded-lg border p-2.5 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100" /></div><input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" type="tel" autoComplete="tel" className="mt-3 w-full min-w-0 rounded-lg border p-2.5 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100" /><textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us about your trip..." rows={6} required className="mt-3 w-full min-w-0 resize-y rounded-lg border p-2.5 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100" /><button type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-900 py-3 text-sm font-bold text-white transition hover:bg-green-800"><Send size={18} />Send Message</button><p className="mt-2 text-center text-[11px] text-gray-500">Your email application will open with the inquiry already filled in.</p></motion.form>
    </div></section>
    <section className="bg-green-950 py-12 text-white sm:py-14"><div className="text-center"><h2 className="mb-5 text-2xl font-bold sm:text-3xl">Follow Our Adventures</h2><div className="flex justify-center gap-3 sm:gap-5"><a href="#" aria-label="Facebook" className="rounded-full bg-white/10 p-3 hover:bg-yellow-500 sm:p-4"><FaFacebook size={21} /></a><a href="#" aria-label="Instagram" className="rounded-full bg-white/10 p-3 hover:bg-yellow-500 sm:p-4"><FaInstagram size={21} /></a><a href="#" aria-label="Website" className="rounded-full bg-white/10 p-3 hover:bg-yellow-500 sm:p-4"><Globe size={21} /></a></div></div></section>
  </div>;
}
