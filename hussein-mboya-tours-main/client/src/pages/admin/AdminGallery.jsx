import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

export default function AdminGallery() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => (await api.get("/admin/gallery")).data,
  });
  const items = data?.gallery || data?.data || [];

  if (isLoading) return <div className="p-6">Loading gallery...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load gallery.</div>;

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-3xl font-bold">Gallery</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow overflow-hidden">
            {item.image?.url && <img src={item.image.url} alt={item.title} className="w-full h-48 object-cover" />}
            <div className="p-4">
              <h2 className="font-semibold">{item.title}</h2>
              <p className="text-sm text-gray-500">{item.category} · {item.featured ? "Featured" : "Standard"}</p>
            </div>
          </div>
        ))}
      </div>
      {!items.length && <p className="text-gray-500">No gallery items found.</p>}
    </div>
  );
}
