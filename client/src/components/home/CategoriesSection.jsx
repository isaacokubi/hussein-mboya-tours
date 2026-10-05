import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBinoculars, FaUmbrellaBeach, FaMountain, FaPeopleGroup, FaMap, FaWater, FaLandmark } from "react-icons/fa6";
import { ArrowRight } from "lucide-react";
import { getCategories } from "../../api/categoryApi";

const DEFAULT_EXPERIENCES = [
  { _id: "default-safari", name: "Safari Adventures", slug: "safari", icon: "Binoculars", description: "Wildlife safaris, game drives and unforgettable national park experiences." },
  { _id: "default-beach", name: "Beach Holidays", slug: "beach", icon: "Beach", description: "Relax on Kenya's coast with beautiful beaches, islands and ocean escapes." },
  { _id: "default-mountain", name: "Mountain Adventures", slug: "mountain", icon: "Mountain", description: "Hiking, climbing and highland adventures for every level of explorer." },
  { _id: "default-culture", name: "Cultural Experiences", slug: "culture", icon: "Landmark", description: "Discover Kenyan heritage, communities, traditions and authentic local culture." },
];
const iconMap = { Binoculars: FaBinoculars, Beach: FaUmbrellaBeach, Mountain: FaMountain, People: FaPeopleGroup, Map: FaMap, Waves: FaWater, Landmark: FaLandmark };

export default function CategoriesSection() {
  const [categories, setCategories] = useState(DEFAULT_EXPERIENCES);
  useEffect(() => {
    let mounted = true;
    getCategories().then((data) => {
      const remote = Array.isArray(data) ? data : Array.isArray(data?.categories) ? data.categories : [];
      if (mounted && remote.length) setCategories(remote);
    }).catch((error) => console.warn("Travel experiences unavailable; using homepage defaults.", error));
    return () => { mounted = false; };
  }, []);

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[#d8bd7a]/25 bg-[linear-gradient(135deg,#0b241b_0%,#173f31_52%,#102d23_100%)] px-5 py-11 text-white shadow-2xl sm:px-8 md:py-16" aria-labelledby="travel-experiences-heading">
      <div className="relative z-10 mb-10 max-w-3xl"><div className="mb-4 inline-flex items-center rounded-full border border-[#d8bd7a]/35 bg-[#f4ead5]/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[.24em] text-[#f0d38b]">Travel your way</div><h2 id="travel-experiences-heading" className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">Choose your kind of adventure</h2><p className="mt-3 max-w-2xl text-base leading-7 text-[#eadfca]">From game drives to ocean escapes, find an experience that fits your story. Choose an experience and let our local team help turn it into a memorable Kenya journey.</p></div>
      <div className="relative z-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || FaMap;
          const slug = category.slug || category.filter || category._id;
          return <Link key={category._id || category.slug || category.name} to={`/tours/category/${slug}`} className="group rounded-3xl border border-[#d8bd7a]/25 bg-[#071a13]/75 p-7 shadow-lg backdrop-blur-sm transition duration-300 hover:-translate-y-2 hover:border-[#f0d38b]/70 hover:bg-[#102d23] hover:shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4ead5] text-[#684a18] shadow-lg ring-4 ring-[#f0d38b]/10"><Icon aria-hidden="true" size={22}/></div>
            <h3 className="mt-6 text-xl font-black tracking-tight text-white">{category.name}</h3>
            <p className="mt-3 text-sm leading-6 text-[#eadfca]">{category.description}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#f0d38b]">Explore experiences <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span>
          </Link>;
        })}
      </div>
    </section>
  );
}