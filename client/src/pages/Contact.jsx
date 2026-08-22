import { useSettings } from "../context/SettingsContext";
import { Phone, Mail, MapPin, Send, MessageCircle, Globe, Clock } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Contact() {
  const { supportPhone, supportEmail, settings } = useSettings();
  const companyName = settings?.companyName || "Coherent Tours";
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

    if (!name || !email || !message) {
      setError("Please enter your name, email address and inquiry message.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!supportEmail?.trim()) {
      setError("Our inquiry email is not configured yet. Please use the phone number above.");
      return;
    }

    const subject = encodeURIComponent(`Travel Inquiry from ${name}`);
    const body = encodeURIComponent(
      `Hello ${companyName},\n\n` +
      `I would like to make an inquiry.\n\n` +
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone || "Not provided"}\n\n` +
      `Message:\n${message}\n\n` +
      `Sent from the ${companyName} contact page.`
    );

    // Open the configured business mailbox with a complete, pre-filled inquiry.
    window.location.href = `mailto:${supportEmail.trim()}?subject=${subject}&body=${body}`;
    setSent(true);
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  const details = [
    { icon: Phone, title: "Phone", value: supportPhone || "Contact us" },
    { icon: Mail, title: "Email", value: supportEmail || "Contact us" },
    { icon: MapPin, title: "Office", value: "Nairobi, Kenya" },
    { icon: Clock, title: "Working Hours", value: "Mon - Sat | 8AM - 6PM" },
  ];

  return (
    <div className="bg-white">
      <section className="relative flex h-[480px] items-center bg-cover bg-center" style={{ backgroundImage: "url('/hero4.jpeg')" }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 text-white">
          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-4xl font-extrabold sm:text-5xl md:text-6xl">
            Contact Us
          </motion.h1>
          <p className="max-w-3xl text-base text-gray-200 sm:text-xl">
            Let our travel experts help you plan your next unforgettable African adventure.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 sm:px-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {details.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div key={index} whileHover={{ y: -8 }} className="min-w-0 rounded-xl border bg-white p-6 text-center shadow-lg sm:p-8">
                <Icon size={40} className="mx-auto mb-4 text-yellow-500" />
                <h3 className="mb-2 text-lg font-bold text-green-900 sm:text-xl">{item.title}</h3>
                <p className="break-words text-sm text-gray-600 sm:text-base">{item.value}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="bg-gray-50 py-12 sm:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="mb-6 text-3xl font-bold text-green-900 sm:text-4xl">Start Planning Your Journey</h2>
            <p className="mb-8 leading-relaxed text-gray-600">
              Whether you want corporate travel management services, airport transfers, car hire and transport services, meet and assist services, conference and events services, a luxury safari, beach holiday, honeymoon experience, mountain adventure or customized tour, our team will create the perfect package for you.
            </p>
            <div className="space-y-5">
              <div className="flex items-start gap-3"><MessageCircle className="mt-0.5 shrink-0 text-yellow-500" /><span>Fast response from our travel consultants</span></div>
              <div className="flex items-start gap-3"><MapPin className="mt-0.5 shrink-0 text-yellow-500" /><span>Explore Africa with local experts</span></div>
            </div>
          </div>

          <motion.form onSubmit={submitHandler} noValidate initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="min-w-0 rounded-2xl bg-white p-5 shadow-xl sm:p-8">
            <h3 className="mb-6 text-2xl font-bold text-green-900">Send An Inquiry</h3>

            {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {sent && <div role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">Your inquiry has been prepared in your email application. Please send the email to complete your inquiry.</div>}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" autoComplete="name" required className="w-full min-w-0 rounded-lg border p-3 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100" />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email Address" type="email" autoComplete="email" required className="w-full min-w-0 rounded-lg border p-3 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100" />
            </div>

            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" type="tel" autoComplete="tel" className="mt-4 w-full min-w-0 rounded-lg border p-3 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100" />

            <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us about your trip..." rows={6} required className="mt-4 w-full min-w-0 resize-y rounded-lg border p-3 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100" />

            <button type="submit" className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl bg-green-900 py-4 font-bold text-white transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              <Send size={20} />
              Send Message
            </button>
            <p className="mt-3 text-center text-xs text-gray-500">Your email application will open with the inquiry already filled in.</p>
          </motion.form>
        </div>
      </section>

      <section className="bg-green-950 py-14 text-white">
        <div className="text-center">
          <h2 className="mb-6 text-3xl font-bold">Follow Our Adventures</h2>
          <div className="flex justify-center gap-5">
            <a href="#" aria-label="Facebook" className="rounded-full bg-white/10 p-4 hover:bg-yellow-500"><FaFacebook size={24} /></a>
            <a href="#" aria-label="Instagram" className="rounded-full bg-white/10 p-4 hover:bg-yellow-500"><FaInstagram size={24} /></a>
            <a href="#" aria-label="Website" className="rounded-full bg-white/10 p-4 hover:bg-yellow-500"><Globe /></a>
          </div>
        </div>
      </section>
    </div>
  );
}
