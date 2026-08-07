import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  Users,
  MapPin,
} from "lucide-react";

export default function TravelSearch() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    destination: "",
    date: "",
    travelers: 1,
  });

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (form.destination.trim()) {
      params.append(
        "search",
        form.destination.trim()
      );
    }

    if (form.date) {
      params.append("date", form.date);
    }

    params.append(
      "travelers",
      form.travelers
    );

    navigate(`/tours?${params.toString()}`);
  };

  return (
    <form
      onSubmit={submit}
      className="
      bg-white
      rounded-2xl
      shadow-2xl
      p-4
      lg:p-5
      grid
      gap-4
      md:grid-cols-4
      items-end
      "
    >
      {/* Destination */}

      <div>
        <label className="block text-sm font-medium mb-2">
          Destination
        </label>

        <div className="relative">
          <MapPin
            size={18}
            className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-gray-400
            "
          />

          <input
            type="text"
            value={form.destination}
            onChange={(e) =>
              updateField(
                "destination",
                e.target.value
              )
            }
            placeholder="Maasai Mara, Diani..."
            className="
            w-full
            border
            rounded-lg
            pl-10
            pr-4
            py-3
            focus:ring-2
            focus:ring-green-600
            focus:outline-none
            "
          />
        </div>
      </div>

      {/* Date */}

      <div>
        <label className="block text-sm font-medium mb-2">
          Travel Date
        </label>

        <div className="relative">
          <Calendar
            size={18}
            className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-gray-400
            "
          />

          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              updateField("date", e.target.value)
            }
            className="
            w-full
            border
            rounded-lg
            pl-10
            pr-4
            py-3
            focus:ring-2
            focus:ring-green-600
            focus:outline-none
            "
          />
        </div>
      </div>

      {/* Travelers */}

      <div>
        <label className="block text-sm font-medium mb-2">
          Travelers
        </label>

        <div className="relative">
          <Users
            size={18}
            className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-gray-400
            "
          />

          <select
            value={form.travelers}
            onChange={(e) =>
              updateField(
                "travelers",
                Number(e.target.value)
              )
            }
            className="
            w-full
            border
            rounded-lg
            pl-10
            pr-4
            py-3
            focus:ring-2
            focus:ring-green-600
            focus:outline-none
            "
          >
            {[...Array(10)].map((_, index) => (
              <option
                key={index + 1}
                value={index + 1}
              >
                {index + 1}{" "}
                {index === 0
                  ? "Traveler"
                  : "Travelers"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Button */}

      <button
        type="submit"
        className="
        h-12
        bg-green-700
        hover:bg-green-800
        text-white
        rounded-lg
        font-semibold
        flex
        items-center
        justify-center
        gap-2
        transition
        "
      >
        <Search size={18} />
        Search Tours
      </button>
    </form>
  );
}