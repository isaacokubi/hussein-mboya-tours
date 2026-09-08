import { useTenant } from "../context/TenantContext";
import { useSettings } from "../context/SettingsContext";
import { Globe2, HeartHandshake, MapPin, ShieldCheck, Users, Compass, Plane, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ABOUT_IMAGES = {
  hero: "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2200&q=92",
  story: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1800&q=92",
};

export default function About() {
  const { tenant } = useTenant();
  const { settings } = useSettings();
  const companyName = settings?.companyName || tenant?.name || "Coherent Tours";
  const values = [
    { icon: HeartHandshake, title: "Personalized Experiences", text: "Every journey is carefully designed around your interests, comfort, and travel dreams." },
    { icon: ShieldCheck, title: "Trusted Travel Partner", text: "We provide safe, reliable, and professionally managed tours across Africa." },
    { icon: Globe2, title: "Authentic Adventures", text: "Discover real African cultures, landscapes, wildlife, and unforgettable moments." },
    { icon: Users, title: "Expert Team", text: "Our experienced guides and travel specialists ensure every trip runs smoothly." },
  ];
  const destinations = ["Maasai Mara Wildlife Safari", "Amboseli National Park", "Diani Beach Holidays", "Mount Kenya Adventures", "Cultural Heritage Tours", "Luxury African Safaris"];

  return <div className="min-w-0 overflow-x-clip bg-white">
    <section className="relative flex min-h-[420px] items-center bg-cover bg-center sm:min-h-[500px]" style={{ backgroundImage: `url(${ABOUT_IMAGES.hero})` }}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative mx-auto w-full max-w-7xl px-4 text-white sm:px-6 lg:px-8">
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-4 max-w-5xl text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">About {companyName}</motion.h1>
        <p className="max-w-3xl text-sm leading-relaxed text-gray-200 sm:text-base md:text-lg">{companyName} creates unforgettable African travel experiences through luxury safaris, beach holidays, cultural adventures and tailor-made journeys.</p>
      </div>
    </section>

    <section className="py-12 sm:py-16 lg:py-20"><div className="mx-auto grid max-w-7xl min-w-0 grid-cols-1 items-center gap-8 px-4 sm:px-6 md:grid-cols-2 lg:gap-12 lg:px-8">
      <div className="min-w-0"><h2 className="mb-5 text-2xl font-bold text-green-900 sm:text-3xl lg:text-4xl">Your Gateway To Africa</h2><p className="mb-4 text-sm leading-relaxed text-gray-600 sm:text-base">{companyName} is a premier African travel company dedicated to creating exceptional journeys for travelers seeking adventure, relaxation, and cultural discovery.</p><p className="mb-4 text-sm leading-relaxed text-gray-600 sm:text-base">From the breathtaking wildlife of Kenya's national parks to the beautiful beaches of the Indian Ocean, we connect travelers with Africa's most remarkable destinations.</p><p className="text-sm leading-relaxed text-gray-600 sm:text-base">Our mission is simple: deliver safe, memorable and authentic travel experiences that guests will treasure forever.</p></div>
      <div className="min-w-0 overflow-hidden rounded-2xl shadow-xl"><img src={ABOUT_IMAGES.story} alt="Kenyan landscape and mountain adventure" loading="lazy" decoding="async" className="h-[280px] w-full object-cover sm:h-[360px] lg:h-[420px]" /></div>
    </div></section>

    <section className="bg-gray-50 py-12 sm:py-16 lg:py-20"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mb-8 text-center sm:mb-12"><h2 className="text-2xl font-bold text-green-900 sm:text-3xl lg:text-4xl">Why Travel With Us?</h2></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">{values.map((item, index) => { const Icon = item.icon; return <motion.div key={index} whileHover={{ y: -6 }} className="min-w-0 rounded-xl bg-white p-5 text-center shadow-md sm:p-6 lg:p-7"><Icon size={38} className="mx-auto mb-4 text-yellow-500" /><h3 className="mb-2 text-base font-bold leading-snug text-green-900 sm:text-lg">{item.title}</h3><p className="text-sm leading-relaxed text-gray-600">{item.text}</p></motion.div>; })}</div></div></section>

    <section className="py-12 sm:py-16 lg:py-20"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12"><div><h2 className="mb-5 text-2xl font-bold text-green-900 sm:text-3xl lg:text-4xl">Explore Our Experiences</h2><div className="space-y-3">{destinations.map((item, index) => <div key={index} className="flex min-w-0 items-center gap-2"><MapPin className="shrink-0 text-yellow-500" size={19} /><span className="min-w-0 text-sm text-gray-700 sm:text-base">{item}</span></div>)}</div></div><div className="min-w-0 rounded-2xl bg-green-900 p-6 text-white sm:p-8 lg:p-10"><Star className="mb-4 text-yellow-400" size={38} /><h3 className="mb-3 text-2xl font-bold sm:text-3xl">Our Promise</h3><p className="text-sm leading-relaxed text-gray-200 sm:text-base">We don't just sell holidays. We create stories, memories and experiences that last a lifetime.</p></div></div></div></section>

    <section className="bg-yellow-500 py-12 sm:py-16"><div className="mx-auto max-w-5xl px-4 text-center sm:px-6"><Compass className="mx-auto mb-4 text-green-950" size={42} /><h2 className="mb-4 text-2xl font-bold text-green-950 sm:text-3xl lg:text-4xl">Ready For Your African Adventure?</h2><p className="mb-6 text-sm text-green-900 sm:text-base">Let our travel experts create the perfect journey for you.</p><Link to="/tours" className="inline-flex max-w-full items-center gap-2 rounded-xl bg-green-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-800 sm:px-8 sm:py-4"><Plane size={19} />Explore Tours</Link></div></section>
  </div>;
}
