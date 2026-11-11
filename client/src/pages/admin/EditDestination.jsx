/**
 * Purpose: Edit Destination page-level UI component. Main declarations: normalizeDestination, destinationToForm, EditDestination.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useEffect, useMemo, useState } from "react";
// Load react-router-dom so this module can use its exported dependencies.
import { useNavigate, useParams } from "react-router-dom";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Load ../../api/adminDestinationApi so this module can use its exported dependencies.
import {
  getAdminDestinationById,
  getAdminDestinations,
  updateDestination,
} from "../../api/adminDestinationApi";

// Declare emptyForm for use by the surrounding module or function.
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

// Declare normalizeDestination for use by the surrounding module or function.
const normalizeDestination = (destination) => {
  // Declare d for use by the surrounding module or function.
  const d = destination?.data || destination?.destination || destination;
  // Check the condition (!d || typeof d !== "object" || !d._id) and run the matching branch.
  if (!d || typeof d !== "object" || !d._id) return null;

  // Declare keywords for use by the surrounding module or function.
  const keywords = Array.isArray(d.seo?.keywords)
    ? d.seo.keywords.join(", ")
    : String(d.seo?.keywords || "");

  // Return the object assembled below to the caller.
  return {
    ...d,
    seo: {
      title: d.seo?.title || "",
      metaDescription: d.seo?.metaDescription || "",
      keywords,
    },
  };
};

// Declare destinationToForm for use by the surrounding module or function.
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

// Declare EditDestination for use by the surrounding module or function.
const EditDestination = () => {
  // Declare { id } for use by the surrounding module or function.
  const { id } = useParams();
  // Declare navigate for use by the surrounding module or function.
  const navigate = useNavigate();
  // Declare queryClient for use by the surrounding module or function.
  const queryClient = useQueryClient();
  // Declare [form, setForm] for use by the surrounding module or function.
  const [form, setForm] = useState(emptyForm);
  // Declare [images, setImages] for use by the surrounding module or function.
  const [images, setImages] = useState([]);

  // Declare destinationQuery for use by the surrounding module or function.
  const destinationQuery = useQuery({
    queryKey: ["admin-destination", id],
    enabled: Boolean(id),
    retry: 1,
    queryFn: async () => {
      // The detail endpoint is the source of truth. If an older deployment or
      // tenant-aware route cannot resolve it, fall back to the already
      // tenant-scoped admin collection instead of rendering an empty form.
      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Declare direct for use by the surrounding module or function.
        const direct = normalizeDestination(await getAdminDestinationById(id));
        // Check the condition (direct) and run the matching branch.
        if (direct) return direct;
      } catch (directError) {
        // Declare list for use by the surrounding module or function.
        const list = await getAdminDestinations();
        // Declare destinations for use by the surrounding module or function.
        const destinations = Array.isArray(list)
          ? list
          : Array.isArray(list?.destinations)
            ? list.destinations
            : [];
        // Declare fallback for use by the surrounding module or function.
        const fallback = destinations.find((item) => String(item?._id) === String(id));
        // Check the condition (fallback) and run the matching branch.
        if (fallback) return normalizeDestination(fallback);
        // Stop the current operation by raising the value of directError.
        throw directError;
      }

      // Declare list for use by the surrounding module or function.
      const list = await getAdminDestinations();
      // Declare destinations for use by the surrounding module or function.
      const destinations = Array.isArray(list)
        ? list
        : Array.isArray(list?.destinations)
          ? list.destinations
          : [];
      // Declare fallback for use by the surrounding module or function.
      const fallback = destinations.find((item) => String(item?._id) === String(id));
      // Check the condition (fallback) and run the matching branch.
      if (fallback) return normalizeDestination(fallback);

      // Declare error for use by the surrounding module or function.
      const error = new Error("Destination could not be found in the current tenant.");
      // Perform the side effect or state update expressed on the following line.
      error.code = "DESTINATION_NOT_FOUND";
      // Stop the current operation by raising the value of error.
      throw error;
    },
  });

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Check the condition (destinationQuery.data) and run the matching branch.
    if (destinationQuery.data) {
      // Perform the side effect or state update expressed on the following line.
      setForm(destinationToForm(destinationQuery.data));
      // Perform the side effect or state update expressed on the following line.
      setImages([]);
    }
  }, [destinationQuery.data]);

  // Declare existingImages for use by the surrounding module or function.
  const existingImages = useMemo(() => {
    // Declare source for use by the surrounding module or function.
    const source = destinationQuery.data?.images;
    // Return the expression shown below to the caller.
    return Array.isArray(source) ? source : [];
  }, [destinationQuery.data]);

  // Declare mutation for use by the surrounding module or function.
  const mutation = useMutation({
    mutationFn: async () => {
      // Declare data for use by the surrounding module or function.
      const data = new FormData();
      // Perform the side effect or state update expressed on the following line.
      data.append("name", form.name.trim());
      // Perform the side effect or state update expressed on the following line.
      data.append("slug", form.slug.trim());
      // Perform the side effect or state update expressed on the following line.
      data.append("country", form.country.trim());
      // Perform the side effect or state update expressed on the following line.
      data.append("city", form.city.trim());
      // Perform the side effect or state update expressed on the following line.
      data.append("description", form.description);
      // Perform the side effect or state update expressed on the following line.
      data.append("featured", String(form.featured));
      // Perform the side effect or state update expressed on the following line.
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
      // Perform the side effect or state update expressed on the following line.
      images.forEach((image) => data.append("images", image));
      // Return the result of updateDestination() to the caller.
      return updateDestination(id, data);
    },
    onSuccess: async () => {
      // Perform the side effect or state update expressed on the following line.
      await queryClient.invalidateQueries({ queryKey: ["admin-destinations"] });
      // Perform the side effect or state update expressed on the following line.
      await queryClient.invalidateQueries({ queryKey: ["admin-destination", id] });
      // Perform the side effect or state update expressed on the following line.
      await queryClient.invalidateQueries({ queryKey: ["destinations"] });
      // Perform the side effect or state update expressed on the following line.
      navigate("/admin/destinations");
    },
  });

  // Check the condition (destinationQuery.isLoading) and run the matching branch.
  if (destinationQuery.isLoading) {
    // Return the expression shown below to the caller.
    return <div className="p-6">Loading destination...</div>;
  }

  // Check the condition (destinationQuery.isError || !destinationQuery.data) and run the matching branch.
  if (destinationQuery.isError || !destinationQuery.data) {
    // Return the expression shown below to the caller.
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

  // Return the expression shown below to the caller.
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
