import { Search, MapPin, Sparkles, UsersRound, CalendarDays } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EXPERIENCE_TO_CATEGORY = { Safari: "Safari", Beach: "Beach", Mountain: "Mountain", Culture: "Culture", Family: "Family", Honeymoon: "Honeymoon", Luxury: "Luxury", Corporate: "Corporate", Photography: "Photography" };

export default function HomeSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [experience, setExperience] = useState("");
  const [duration, setDuration] = useState("");
  const [travellers, setTravellers] = useState("");
  const [travelDate, setTravelDate] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (experience) params.set("category", EXPERIENCE_TO_CATEGORY[experience] || experience);
    if (duration) params.set("duration", duration);
    if (travellers) params.set("travellers", travellers);
    if (travelDate) params.set("date", travelDate);
    navigate(params.toString() ? `/tours?${params.toString()}` : "/tours");
  };

  return (
    <section className="relative z-20 -mt-16 px-4 sm:-mt-20" aria-label="Trip finder">
      <form onSubmit={submit} className="mx-auto max-w-6xl rounded-[1.75rem] border border-white/20 bg-slate-950/90 p-3 shadow-2xl backdrop-blur-xl">
        <div className="grid gap-2 md:grid-cols-[1.35fr_.9fr_.9fr_.75fr_1fr_auto] md:items-center">
          <label className="flex min-h-14 items-center gap-3 rounded-2xl bg-white/10 px-4 text-white ring-1 ring-white/10"><Search className="shrink-0 text-emerald-300" size={20}/><span className="sr-only">Destination or tour</span><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Maasai Mara, Diani, safari..." className="w-full bg-transparent text-sm outline-none placeholder:text-white/50" aria-label="Destination or tour"/></label>
          <label className="flex min-h-14 items-center gap-2 rounded-2xl bg-white/10 px-4 text-sm text-white ring-1 ring-white/10"><Sparkles className="shrink-0 text-emerald-300" size={18}/><span className="sr-only">Experience</span><select value={experience} onChange={(e)=>setExperience(e.target.value)} className="w-full bg-transparent outline-none" aria-label="Experience type"><option value="" className="text-slate-900">Any experience</option>{Object.keys(EXPERIENCE_TO_CATEGORY).map((item)=><option key={item} value={item} className="text-slate-900">{item}</option>)}</select></label>
          <label className="flex min-h-14 items-center gap-2 rounded-2xl bg-white/10 px-4 text-sm text-white ring-1 ring-white/10"><CalendarDays className="shrink-0 text-emerald-300" size={18}/><span className="sr-only">Duration</span><select value={duration} onChange={(e)=>setDuration(e.target.value)} className="w-full bg-transparent outline-none" aria-label="Trip duration"><option value="" className="text-slate-900">Any duration</option><option value="1-3" className="text-slate-900">1–3 days</option><option value="4-6" className="text-slate-900">4–6 days</option><option value="7+" className="text-slate-900">7+ days</option></select></label>
          <label className="flex min-h-14 items-center gap-2 rounded-2xl bg-white/10 px-4 text-sm text-white ring-1 ring-white/10"><CalendarDays className="shrink-0 text-emerald-300" size={18}/><span className="sr-only">Travel date</span><input type="date" value={travelDate} onChange={(e)=>setTravelDate(e.target.value)} className="w-full min-w-0 bg-transparent text-sm outline-none [color-scheme:dark]" aria-label="Preferred travel date"/></label>
          <label className="flex min-h-14 items-center gap-2 rounded-2xl bg-white/10 px-4 text-sm text-white ring-1 ring-white/10"><UsersRound className="shrink-0 text-emerald-300" size={18}/><span className="sr-only">Travellers</span><input type="number" min="1" max="99" value={travellers} onChange={(e)=>setTravellers(e.target.value)} placeholder="Travellers" className="w-full bg-transparent outline-none placeholder:text-white/50" aria-label="Number of travellers"/></label>
          <button type="submit" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#e3bd67] px-6 font-black text-slate-950 transition hover:bg-[#f0d38b] hover:shadow-lg"><Search size={18}/> Find My Trip</button>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-2 pb-1 pt-3 text-xs text-white/60"><span className="inline-flex items-center gap-1"><MapPin size={13}/> Kenya & East Africa</span><span>Safari • Beach • Mountain • Culture</span></div>
      </form>
    </section>
  );
}
