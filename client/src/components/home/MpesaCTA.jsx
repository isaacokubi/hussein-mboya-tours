import { Link } from "react-router-dom";
import { useSettings } from "../../context/SettingsContext";

export default function MpesaCTA() {
  const { settings = {} } = useSettings() || {};
  // Do not advertise a payment provider that the tenant has not enabled.
  if (settings.enableMpesa !== true) return null;

  return (
    <section className="bg-black py-16 text-center text-white sm:py-20" aria-labelledby="mpesa-cta-heading">
      <div className="mx-auto max-w-4xl px-6">
        <h2 id="mpesa-cta-heading" className="text-3xl font-bold md:text-4xl">Ready to explore Kenya?</h2>
        <p className="mt-5 text-lg text-gray-300 md:text-xl">Explore available trips and review the payment methods offered for your booking at checkout.</p>
        <p className="mt-4 text-sm text-gray-400">M-Pesa availability and transaction confirmation are shown in the booking flow.</p>
        <Link to="/tours" className="mt-8 inline-block rounded-full bg-green-600 px-10 py-4 font-bold transition hover:bg-green-700">Explore tours</Link>
      </div>
    </section>
  );
}
