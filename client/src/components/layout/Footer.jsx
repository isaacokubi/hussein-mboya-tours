import { useSettings } from "../../context/SettingsContext";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTenant } from "../../context/TenantContext";
import { FaFacebookF, FaInstagram, FaXTwitter, FaYoutube, FaPhone, FaLocationDot, FaEnvelope } from "react-icons/fa6";
import { ShieldCheck, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const { user } = useAuth();
  const { settings = {} } = useSettings() || {};
  const { tenant = {} } = useTenant() || {};
  const companyName = settings.companyName || tenant.name || tenant.companyName || (user ? "Your Travel Company" : "Hussein Mboya Tours");
  const supportEmail = settings.supportEmail || tenant.contactEmail || "";
  const supportPhone = settings.supportPhone || tenant.contactPhone || "";
  const year = new Date().getFullYear();
  const userRole = typeof user?.role === "string" ? user.role.toLowerCase() : user?.role?.name?.toLowerCase() || user?.roles?.[0]?.name?.toLowerCase() || "";
  const socialLinks = [["Facebook", settings.facebook, FaFacebookF], ["Instagram", settings.instagram, FaInstagram], ["X", settings.twitter, FaXTwitter], ["YouTube", settings.youtube, FaYoutube]].filter(([, href]) => href);
  const popularDestinations = [["Maasai Mara", "/destinations/maasai-mara"], ["Diani Beach", "/destinations/diani-beach"], ["Mount Kenya", "/destinations/mount-kenya"], ["Nairobi", "/destinations/nairobi"]];

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-14">
        <div className="mb-12 flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[.05] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#e3bd67]">Travel with confidence</p><h2 className="mt-2 text-xl font-black text-white">Your trip, managed from discovery to return.</h2></div>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200"><ShieldCheck size={18} className="text-[#e3bd67]"/> Secure booking & payment</div>
        </div>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_.8fr_.9fr_.9fr]">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">{companyName}</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">Discover Kenya and East Africa through safaris, wildlife adventures, beach escapes, mountain expeditions and tailor-made travel experiences.</p>
            <div className="mt-6 space-y-3 text-sm">
              {supportPhone && <a href={`tel:${supportPhone.replace(/\s+/g, "")}`} className="flex items-center gap-3 hover:text-[#e3bd67]"><FaPhone/> {supportPhone}</a>}
              {supportEmail && <a href={`mailto:${supportEmail}`} className="flex items-center gap-3 hover:text-[#e3bd67]"><FaEnvelope/> {supportEmail}</a>}
              <div className="flex items-center gap-3"><FaLocationDot/> {settings.city || tenant.city || "Nairobi"}, {settings.country || tenant.country || "Kenya"}</div>
            </div>
            {socialLinks.length > 0 && <div className="mt-6 flex gap-3">{socialLinks.map(([label, href, Icon]) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 hover:border-[#c99a3e]/40 hover:text-[#e3bd67]"><Icon size={16}/></a>)}</div>}
          </div>
          <div><h3 className="font-bold text-white">Explore</h3><ul className="mt-4 space-y-3 text-sm">{[["Home","/"],["Destinations","/destinations"],["Tours","/tours"],["Hotels","/hotels"],["Airport Transfers","/airport-transfers"],["About Us","/about"],["Contact","/contact"]].map(([name,path])=><li key={path}><Link to={path} className="hover:text-[#e3bd67]">{name}</Link></li>)}</ul></div>
          <div><h3 className="font-bold text-white">Popular destinations</h3><ul className="mt-4 space-y-3 text-sm">{popularDestinations.map(([name,path])=><li key={path}><Link to={path} className="hover:text-[#e3bd67]">{name}</Link></li>)}</ul></div>
          <div><h3 className="font-bold text-white">Travel services</h3><ul className="mt-4 space-y-3 text-sm">{[["Luxury Safaris","/tours?category=luxury"],["Wildlife Tours","/tours?category=wildlife"],["Beach Holidays","/tours?category=beach"],["Group Adventures","/tours?category=group"],["Honeymoon Packages","/tours?category=honeymoon"],["Airport Transfers","/airport-transfers"]].map(([name,path])=><li key={path}><Link to={path} className="hover:text-[#e3bd67]">{name}</Link></li>)}</ul>{userRole === "admin" && !["super_admin","superadmin"].includes(user?.role) && <Link to="/admin" className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-[#e3bd67]">Open admin panel <ArrowUpRight size={14}/></Link>}</div>
        </div>
      </div>
      <div className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-xs text-slate-500 lg:flex-row lg:items-center lg:justify-between"><p>© {year} {companyName}. All rights reserved.</p><div className="flex flex-wrap gap-5"><Link to="/privacy" className="hover:text-white">Privacy Policy</Link><Link to="/terms" className="hover:text-white">Terms & Conditions</Link><Link to="/refund-policy" className="hover:text-white">Refund Policy</Link></div><p>Kenya & East Africa · Travel with confidence.</p></div></div>
    </footer>
  );
}