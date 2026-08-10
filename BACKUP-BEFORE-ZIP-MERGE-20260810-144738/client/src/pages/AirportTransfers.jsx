import { Link } from "react-router-dom";

export default function AirportTransfers() {
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <div className="bg-white rounded-2xl shadow p-8">
        <h1 className="text-4xl font-bold mb-4">Airport Transfers</h1>
        <p className="text-gray-600 leading-7 mb-6">
          Arrange a private or group transfer between Kenyan airports, hotels,
          lodges and other agreed destinations. Availability and pricing are
          confirmed by the operations team.
        </p>
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {["Airport pickup", "Hotel transfer", "Custom transfer"].map((item) => (
            <div key={item} className="border rounded-xl p-5">
              <h2 className="font-semibold">{item}</h2>
              <p className="text-sm text-gray-500 mt-2">Request a tailored transfer for your itinerary.</p>
            </div>
          ))}
        </div>
        <Link to="/contact" className="inline-block px-5 py-3 rounded-lg bg-blue-600 text-white">
          Request a transfer
        </Link>
      </div>
    </div>
  );
}
