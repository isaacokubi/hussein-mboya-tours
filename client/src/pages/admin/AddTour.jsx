import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { createTour } from "../../api/adminTourApi";
import { getDestinations } from "../../api/adminDestinationApi";

export default function AddTour() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);

  const { data: destinationsData, isLoading: destinationsLoading } = useQuery({
    queryKey: ["destinations"],
    queryFn: getDestinations,
  });

  const destinations = Array.isArray(destinationsData)
    ? destinationsData
    : destinationsData?.destinations || [];

  const [form, setForm] = useState({
    title: "",
    description: "",
    destination: "",
    country: "Kenya",
    date: "",
    duration: "",
    price: "",
    category: "Safari",
    featured: false,
  });

  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      images.forEach((image) => {
        data.append("images", image);
      });

      await createTour(data);

      navigate("/admin/tours");
    } catch (error) {
      console.error("Create tour failed:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to create tour. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Add New Tour</h1>

      <form
        onSubmit={submit}
        className="
          space-y-5
          bg-white
          p-6
          rounded-lg
          shadow
        "
      >
        <div>
          <label className="block mb-2 font-medium">
            Tour Title
          </label>

          <input
            type="text"
            name="title"
            placeholder="Tour title"
            className="
              w-full
              border
              rounded
              px-4
              py-3
            "
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Description
          </label>

          <textarea
            name="description"
            placeholder="Description"
            rows={5}
            className="
              w-full
              border
              rounded
              px-4
              py-3
            "
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Destination
          </label>

          <select
            name="destination"
            className="
              w-full
              border
              rounded
              px-4
              py-3
            "
            value={form.destination}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Destination
            </option>

            {destinationsLoading && (
              <option disabled>
                Loading destinations...
              </option>
            )}

            {destinations.map((destination) => (
              <option
                key={destination._id}
                value={destination._id}
              >
                {destination.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Country
          </label>

          <input
            type="text"
            name="country"
            placeholder="Country"
            className="
              w-full
              border
              rounded
              px-4
              py-3
            "
            value={form.country}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Travel Date
          </label>

          <input
            type="date"
            name="date"
            className="
              w-full
              border
              rounded
              px-4
              py-3
            "
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Duration
          </label>

          <input
            type="text"
            name="duration"
            placeholder="e.g. 3 Days"
            className="
              w-full
              border
              rounded
              px-4
              py-3
            "
            value={form.duration}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Price
          </label>

          <input
            type="number"
            name="price"
            placeholder="Price"
            className="
              w-full
              border
              rounded
              px-4
              py-3
            "
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Category
          </label>

          <select
            name="category"
            className="
              w-full
              border
              rounded
              px-4
              py-3
            "
            value={form.category}
            onChange={handleChange}
          >
            <option value="Safari">Safari</option>
            <option value="Beach">Beach</option>
            <option value="Mountain">Mountain</option>
            <option value="Culture">Culture</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
            />

            <span>Featured Tour</span>
          </label>
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Tour Images
          </label>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) =>
              setImages(Array.from(e.target.files))
            }
          />

          {images.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {images.length} image(s) selected
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="
            bg-green-600
            hover:bg-green-700
            text-white
            px-8
            py-3
            rounded
            font-medium
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {submitting ? "Saving Tour..." : "Save Tour"}
        </button>
      </form>
    </div>
  );
}