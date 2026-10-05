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
    <section aria-labelledby="travel-experiences-heading">
      <div className="mb-9"><p className="text-xs font-extrabold uppercase tracking-[.24em] text-emerald-700">Travel your way</p><h2 id="travel-experiences-heading" className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Choose your kind of adventure</h2><p className="mt-2 max-w-2xl text-slate-500">From game drives to ocean escapes, find an experience that fits your story.</p></div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || FaMap;
          const slug = category.slug || category.filter || category._id;
          return <Link key={category._id || category.slug || category.name} to={`/tours/category/${slug}`} className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon aria-hidden="true" size={22}/></div>
            <h3 className="mt-6 text-xl font-black text-slate-950">{category.name}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">{category.description}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-700">Explore experiences <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span>
          </Link>;
        })}
      </div>
    </section>
  );
}