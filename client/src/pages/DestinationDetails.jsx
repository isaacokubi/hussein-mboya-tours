import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { useTenant } from "../context/TenantContext";
import LazyImage from "../components/common/LazyImage";

const FALLBACK_IMAGES = ["/gallery/mara.jpg", "/gallery/amboseli.jpg", "/gallery/diani.jpg", "/gallery/beach.jpg"];

const imageValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value?.url || value?.secure_url || value?.src || value?.path || "";
};

const fallbackFor = (value, index = 0) => {
  const stable = String(value?._id || value?.slug || value?.name || index);
  const hash = [...stable].reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, 0);
  return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
};

const DestinationDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const tenantId = String(tenant?._id || tenant?.id || "").trim();

  const { data, isLoading } = useQuery({
    queryKey: ["destination", tenantId || "public", slug],
    queryFn: async () => {
      const res = await api.get(`/destinations/${slug}`);
      return res.data?.data?.destination || res.data?.destination || null;
    },
    enabled: Boolean(slug),
  });

  useEffect(() => {
    if (data?.seo?.title) document.title = data.seo.title;
  }, [data]);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-200">Loading destination...</div>;
  }

  if (!data) {
    return <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-200">Destination not found</div>;
  }

  const images = Array.isArray(data.images) ? data.images : [];
  const destinationId = String(data._id || "");
  const tours = (Array.isArray(data.tours) ? data.tours : []).filter((tour) => {
    const tourDestination = tour?.destination?._id || tour?.destination;
    return Boolean(destinationId && tourDestination && String(tourDestination) === destinationId);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl p-6">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            {images[0] && (
              <LazyImage
                src={imageValue(images[0])}
                alt={data.name}
                fallback={fallbackFor(data, 0)}
                className="h-[450px] w-full rounded-xl object-cover shadow-2xl ring-1 ring-slate-800"
              />
            )}
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.slice(1, 5).map((img, index) => (
                <LazyImage
                  key={index}
                  src={imageValue(img)}
                  fallback={fallbackFor(data, index + 1)}
                  className="h-24 w-full rounded object-cover ring-1 ring-slate-800"
                  alt={`${data.name} ${index + 2}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            {data.featured && <span className="w-fit rounded bg-yellow-500 px-3 py-1 font-semibold text-slate-950">Featured</span>}
            <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">{data.name}</h1>
            <p className="mt-3 text-lg text-slate-300">📍 {data.city || ""}, {data.country || ""}</p>
            <p className="mt-6 leading-relaxed text-slate-300">{data.description}</p>
            <button
              onClick={() => navigate(`/tours?destination=${encodeURIComponent(destinationId)}`)}
              className="mt-6 w-fit rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!destinationId}
            >
              Explore Tours
            </button>
          </div>
        </div>

        {tours.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-3xl font-bold text-white">Tours Available in {data.name}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {tours.map((tour) => (
                <Link
                  to={`/tours/${tour.slug}`}
                  key={tour._id}
                  className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-xl transition hover:border-slate-700"
                >
                  <LazyImage
                    src={imageValue(tour.images?.[0])}
                    fallback={fallbackFor(tour)}
                    className="h-48 w-full object-cover"
                    alt={tour.title || "Tour"}
                  />
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white">{tour.title}</h3>
                    <p className="mt-2 text-slate-300">{tour.duration}</p>
                    <div className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 font-semibold text-white">View Tour</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {data.relatedDestinations?.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-3xl font-bold text-white">More Destinations</h2>
            <div className="grid gap-5 md:grid-cols-4">
              {data.relatedDestinations.map((item) => (
                <div key={item._id} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                  <LazyImage
                    src={imageValue(item.images?.[0])}
                    fallback={fallbackFor(item)}
                    className="h-40 w-full object-cover"
                    alt={item.name || "Destination"}
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <button onClick={() => navigate(`/destinations/${item.slug}`)} className="mt-3 font-semibold text-blue-400 transition hover:text-blue-300">View</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default DestinationDetails;
