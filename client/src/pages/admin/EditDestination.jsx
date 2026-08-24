import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminDestinationById,
  getAdminDestinations,
  updateDestination,
} from "../../api/adminDestinationApi";

const emptyForm = {
  name: "",
  slug: "",
  country: "",
  city: "",
  description: "",
  featured: false,
  seo: {
    title: "",
    metaDescription: "",
    keywords: "",
  },
};

const normalizeDestination = (destination) => {
  const d = destination?.data || destination?.destination || destination;
  if (!d || typeof d !== "object" || !d._id) return null;

  const keywords = Array.isArray(d.seo?.keywords)
    ? d.seo.keywords.join(", ")
    : String(d.seo?.keywords || "");

  return {
    ...d,
    seo: {
      title: d.seo?.title || "",
      metaDescription: d.seo?.metaDescription || "",
      keywords,
    },
  };
};

const destinationToForm = (destination) => ({
  name: destination?.name || "",
  slug: destination?.slug || "",
  country: destination?.country || "",
  city: destination?.city || "",
  description: destination?.description || "",
  featured: destination?.featured === true || destination?.featured === "true",
  seo: {
    title: destination?.seo?.title || "",
    metaDescription: destination?.seo?.metaDescription || "",
    keywords: Array.isArray(destination?.seo?.keywords)
      ? destination.seo.keywords.join(", ")
      : String(destination?.seo?.keywords || ""),
  },
});

const EditDestination = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);

  const destinationQuery = useQuery({
    queryKey: ["admin-destination", id],
    enabled: Boolean(id),
    retry: 1,
    queryFn: async () => {
      // The detail endpoint is the source of truth. If an older deployment or
      // tenant-aware route cannot resolve it, fall back to the already
      // tenant-scoped admin collection instead of rendering an empty form.
      try {
        const direct = normalizeDestination(await getAdminDestinationById(id));
        if (direct) return direct;
      } catch (directError) {
        const list = await getAdminDestinations();
        const destinations = Array.isArray(list)
          ? list
          : Array.isArray(list?.destinations)
            ? list.destinations
            : [];
        const fallback = destinations.find((item) => String(item?._id) === String(id));
        if (fallback) return normalizeDestination(fallback);
        throw directError;
      }

      const list = await getAdminDestinations();
      const destinations = Array.isArray(list)
        ? list
        : Array.isArray(list?.destinations)
          ? list.destinations
          : [];
      const fallback = destinations.find((item) => String(item?._id) === String(id));
      if (fallback) return normalizeDestination(fallback);

      const error = new Error("Destination could not be found in the current tenant.");
      error.code = "DESTINATION_NOT_FOUND";
      throw error;
    },
  });

  useEffect(() => {
    if (destinationQuery.data) {
      setForm(destinationToForm(destinationQuery.data));
      setImages([]);
    }
  }, [destinationQuery.data]);

  const existingImages = useMemo(() => {
    const source = destinationQuery.data?.images;
    return Array.isArray(source) ? source : [];
  }, [destinationQuery.data]);

  const mutation = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      data.append("name", form.name.trim());
      data.append("slug", form.slug.trim());
      data.append("country", form.country.trim());
      data.append("city", form.city.trim());
      data.append("description", form.description);
      data.append("featured", String(form.featured));
      data.append(
        "seo",
        JSON.stringify({
          title: form.seo.title.trim(),
          metaDescription: form.seo.metaDescription.trim(),
          keywords: form.seo.keywords
            .split(",")
            .map((keyword) => keyword.trim())
            .filter(Boolean),
        })
      );
      images.forEach((image) => data.append("images", image));
      return updateDestination(id, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-destinations"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-destination", id] });
      await queryClient.invalidateQueries({ queryKey: ["destinations"] });
      navigate("/admin/destinations");
    },
  });

  if (destinationQuery.isLoading) {
    return <div className="p-6">Loading destination...</div>;
  }

  if (destinationQuery.isError || !destinationQuery.data) {
    return (
      <div className="p-6 max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Edit Destination</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Unable to load this destination.</p>
          <p className="mt-1 text-sm">
            {destinationQuery.error?.response?.data?.message ||
              destinationQuery.error?.message ||
              "The destination may not belong to the current tenant."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/destinations")}
          className="mt-4 rounded bg-gray-700 px-4 py-2 text-white"
        >
          Back to Destinations
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Edit Destination</h1>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        {["name", "slug", "country", "city"].map((field) => (
          <input
            key={field}
            className="border p-3 rounded w-full"
            placeholder={field}
            value={form[field]}
            onChange={(event) =>
              setForm((current) => ({ ...current, [field]: event.target.value }))
            }
          />
        ))}

        <textarea
          className="border p-3 rounded w-full"
          rows="5"
          placeholder="Description"
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
        />

        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) =>
              setForm((current) => ({ ...current, featured: event.target.checked }))
            }
          />
          Featured
        </label>

        <h2 className="font-bold text-xl">SEO</h2>

        <input
          className="border p-3 rounded w-full"
          placeholder="SEO title"
          value={form.seo.title}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              seo: { ...current.seo, title: event.target.value },
            }))
          }
        />

        <textarea
          className="border p-3 rounded w-full"
          placeholder="Meta description"
          value={form.seo.metaDescription}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              seo: { ...current.seo, metaDescription: event.target.value },
            }))
          }
        />

        <input
          className="border p-3 rounded w-full"
          placeholder="keywords comma separated"
          value={form.seo.keywords}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              seo: { ...current.seo, keywords: event.target.value },
            }))
          }
        />

        <h2 className="font-bold text-xl">Images</h2>

        {existingImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {existingImages.map((image, index) => {
              const url = typeof image === "string" ? image : image?.url;
              if (!url) return null;
              return (
                <img
                  key={`${url}-${index}`}
                  src={url}
                  alt={`${form.name} ${index + 1}`}
                  className="h-24 w-full rounded object-cover border"
                />
              );
            })}
          </div>
        )}

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(event) => setImages(Array.from(event.target.files || []))}
        />

        {mutation.isError && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
            {mutation.error?.response?.data?.message || mutation.error?.message || "Failed to update destination."}
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-green-600 text-white px-6 py-3 rounded disabled:opacity-60"
        >
          {mutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditDestination;
