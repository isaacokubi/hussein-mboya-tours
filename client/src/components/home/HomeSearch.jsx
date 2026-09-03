import { Search, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomeSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/tours?search=${encodeURIComponent(value)}` : "/tours");
  };

  return (
    <section className="relative z-20 -mt-12 px-4 sm:-mt-16">
      <form onSubmit={submit} className="mx-auto max-w-5xl rounded-3xl border border-white/20 bg-slate-950/80 p-2 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl bg-white/10 px-5 text-white ring-1 ring-white/10">
            <Search className="shrink-0 text-emerald-300" size={21} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Where do you want to explore? Try Maasai Mara, Watamu, safari..." className="w-full bg-transparent text-sm outline-none placeholder:text-white/50 sm:text-base" aria-label="Search tours and destinations" />
          </div>
          <button type="submit" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-7 font-bold text-slate-950 transition hover:bg-emerald-300 hover:shadow-lg hover:shadow-emerald-400/20">
            <Search size={19} /> Search Adventures
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 pb-2 pt-3 text-xs text-white/60">
          <span className="inline-flex items-center gap-1"><MapPin size={13} /> Kenya & East Africa</span>
          <span className="inline-flex items-center gap-1"><Sparkles size={13} /> Curated experiences</span>
          <span>Safari • Beach • Mountain • Culture</span>
        </div>
      </form>
    </section>
  );
}
