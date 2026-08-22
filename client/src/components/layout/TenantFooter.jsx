import { useTenant } from "../../context/TenantContext";
import { useSettings } from "../../context/SettingsContext";
import { Link } from "react-router-dom";
import { FaEnvelope, FaFacebookF, FaInstagram, FaLocationDot, FaPhone, FaXTwitter, FaYoutube } from "react-icons/fa6";

const cleanPhone = (value = "") => String(value).replace(/\s+/g, "");

export default function TenantFooter() {
  const { tenant } = useTenant() || {};
  const { settings = {} } = useSettings() || {};

  const companyName = settings.companyName || tenant?.name || "Travel Company";
  const supportEmail = settings.supportEmail || tenant?.contactEmail || "";
  const supportPhone = settings.supportPhone || tenant?.contactPhone || "";
  const address = settings.address || tenant?.address || "";
  const city = settings.city || tenant?.city || "Nairobi";
  const country = settings.country || tenant?.country || "Kenya";
  const social = {
    facebook: settings.facebook || "",
    instagram: settings.instagram || "",
    twitter: settings.twitter || "",
    youtube: settings.youtube || "",
  };
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{companyName}</h2>
          <p className="mt-4 leading-relaxed text-gray-400">
            Discover Kenya and East Africa through unforgettable safaris, wildlife adventures,
            luxury holidays, beach escapes and tailor-made travel experiences.
          </p>
          <div className="mt-6 space-y-3 text-sm">
            {supportPhone && (
              <a href={`tel:${cleanPhone(supportPhone)}`} className="flex items-center gap-2 hover:text-green-400">
                <FaPhone /> {supportPhone}
              </a>
            )}
            {supportEmail && (
              <a href={`mailto:${supportEmail}`} className="flex items-center gap-2 hover:text-green-400">
                <FaEnvelope /> {supportEmail}
              </a>
            )}
            <div className="flex items-center gap-2">
              <FaLocationDot /> {address ? `${address}, ${city}, ${country}` : `${city}, ${country}`}
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            {social.facebook && <a href={social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-green-400"><FaFacebookF size={20} /></a>}
            {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-green-400"><FaInstagram size={20} /></a>}
            {social.twitter && <a href={social.twitter} target="_blank" rel="noreferrer" aria-label="X" className="hover:text-green-400"><FaXTwitter size={20} /></a>}
            {social.youtube && <a href={social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-green-400"><FaYoutube size={20} /></a>}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">Explore</h3>
          <ul className="space-y-3">
            <li><Link to="/" className="hover:text-green-400">Home</Link></li>
            <li><Link to="/destinations" className="hover:text-green-400">Destinations</Link></li>
            <li><Link to="/tours" className="hover:text-green-400">Tours</Link></li>
            <li><Link to="/about" className="hover:text-green-400">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-green-400">Contact</Link></li>
            <li><Link to="/login" className="hover:text-green-400">Login</Link></li>
            <li><Link to="/register" className="hover:text-green-400">Register</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">Popular Destinations</h3>
          <ul className="space-y-3">
            <li><Link to="/destinations/maasai-mara" className="hover:text-green-400">Maasai Mara</Link></li>
            <li><Link to="/destinations/amboseli" className="hover:text-green-400">Amboseli National Park</Link></li>
            <li><Link to="/destinations/diani-beach" className="hover:text-green-400">Diani Beach</Link></li>
            <li><Link to="/destinations/tsavo" className="hover:text-green-400">Tsavo National Park</Link></li>
            <li><Link to="/destinations/lake-naivasha" className="hover:text-green-400">Lake Naivasha</Link></li>
            <li><Link to="/destinations/watamu" className="hover:text-green-400">Watamu Marine Park</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">Travel Services</h3>
          <ul className="space-y-3">
            <li><Link to="/tours?category=luxury" className="hover:text-green-400">Luxury Safaris</Link></li>
            <li><Link to="/tours?category=wildlife" className="hover:text-green-400">Wildlife Tours</Link></li>
            <li><Link to="/tours?category=beach" className="hover:text-green-400">Beach Holidays</Link></li>
            <li><Link to="/tours?category=group" className="hover:text-green-400">Group Adventures</Link></li>
            <li><Link to="/tours?category=honeymoon" className="hover:text-green-400">Honeymoon Packages</Link></li>
            <li><Link to="/airport-transfers" className="hover:text-green-400">Airport Transfers</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm lg:flex-row">
          <p className="text-center text-gray-500 lg:text-left">© {year} {companyName}. All Rights Reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/privacy" className="hover:text-green-400">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-green-400">Terms & Conditions</Link>
            <Link to="/refund-policy" className="hover:text-green-400">Refund Policy</Link>
          </div>
          <p className="text-center text-gray-500 lg:text-right">{companyName} creates unforgettable African travel experiences.</p>
        </div>
      </div>
    </footer>
  );
}
