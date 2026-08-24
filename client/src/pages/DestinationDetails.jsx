import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

const DestinationDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["destination", slug],
    queryFn: async () => {
      const res = await api.get(`/destinations/${slug}`);
      return res.data?.data?.destination || res.data?.destination || null;
    },
  });

  useEffect(() => {
    if (data?.seo?.title) document.title = data.seo.title;
  }, [data]);

  if (isLoading) return <div className="p-10">Loading destination...</div>;
  if (!data) return <div className="p-10">Destination not found</div>;

  const images = Array.isArray(data.images) ? data.images : [];
  const destinationId = String(data._id || "");
  const tours = (Array.isArray(data.tours) ? data.tours : []).filter((tour) => {
    // The destination endpoint is already tenant-scoped and server-filtered.
    // Keep this defensive check so a malformed/stale API payload can never
    // display a tour belonging to another destination on this page.
    const tourDestination = tour?.destination?._id || tour?.destination;
    return !tourDestination || String(tourDestination) === destinationId;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          {images[0] && (
            <img src={images[0]?.url || images[0]} alt={data.name} className="w-full h-[450px] object-cover rounded-xl shadow" />
          )}
          <div className="grid grid-cols-4 gap-3 mt-4">
            {images.slice(1, 5).map((img, index) => (
              <img key={index} src={img?.url || img} className="h-24 w-full object-cover rounded" alt={`${data.name} ${index + 2}`} />
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          {data.featured && <span className="bg-yellow-500 text-white px-3 py-1 rounded w-fit">Featured</span>}
          <h1 className="text-5xl font-bold mt-4">{data.name}</h1>
          <p className="text-gray-600 mt-3 text-lg">📍 {data.city}, {data.country}</p>
          <p className="mt-6 leading-relaxed">{data.description}</p>
          <button
            onClick={() => navigate(`/tours?destination=${encodeURIComponent(destinationId)}`)}
            className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg w-fit"
            disabled={!destinationId}
          >
            Explore Tours
          </button>
        </div>
      </div>

      {tours.length > 0 && (
        <section className="mt-16">
          <h2 className="text-3xl font-bold mb-6">Tours Available in {data.name}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <Link to={`/tours/${tour.slug}`} key={tour._id} className="border rounded-xl overflow-hidden shadow">
                {(tour.images?.[0]?.url || tour.images?.[0]) && (
                  <img src={tour.images[0]?.url || tour.images[0]} className="h-48 w-full object-cover" alt={tour.title} />
                )}
                <div className="p-5">
                  <h3 className="font-bold text-xl">{tour.title}</h3>
                  <p className="mt-2">{tour.duration}</p>
                  <div className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded">View Tour</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {data.relatedDestinations?.length > 0 && (
        <section className="mt-16">
          <h2 className="text-3xl font-bold mb-6">More Destinations</h2>
          <div className="grid md:grid-cols-4 gap-5">
            {data.relatedDestinations.map((item) => (
              <div key={item._id} className="border rounded-xl overflow-hidden">
                <img src={item.images?.[0]?.url || item.images?.[0]} className="h-40 w-full object-cover" alt={item.name} />
                <div className="p-4">
                  <h3 className="font-bold">{item.name}</h3>
                  <button onClick={() => navigate(`/destinations/${item.slug}`)} className="mt-3 text-blue-600">View</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default DestinationDetails;
