import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBinoculars,
  FaUmbrellaBeach,
  FaMountain,
  FaPeopleGroup,
  FaMap,
  FaWater,
  FaLandmark,
} from "react-icons/fa6";
import { getCategories } from "../../api/categoryApi";

const DEFAULT_EXPERIENCES = [
  {
    _id: "default-safari",
    name: "Safari Adventures",
    slug: "safari",
    icon: "Binoculars",
    description: "Wildlife safaris, game drives and unforgettable national park experiences.",
  },
  {
    _id: "default-beach",
    name: "Beach Holidays",
    slug: "beach",
    icon: "Beach",
    description: "Relax on Kenya's coast with beautiful beaches, islands and ocean escapes.",
  },
  {
    _id: "default-mountain",
    name: "Mountain Adventures",
    slug: "mountain",
    icon: "Mountain",
    description: "Hiking, climbing and highland adventures for every level of explorer.",
  },
  {
    _id: "default-culture",
    name: "Cultural Experiences",
    slug: "culture",
    icon: "Landmark",
    description: "Discover Kenyan heritage, communities, traditions and authentic local culture.",
  },
];

const iconMap = {
  Binoculars: FaBinoculars,
  Beach: FaUmbrellaBeach,
  Mountain: FaMountain,
  People: FaPeopleGroup,
  Map: FaMap,
  Waves: FaWater,
  Landmark: FaLandmark,
};

export default function CategoriesSection() {
  const [categories, setCategories] = useState(DEFAULT_EXPERIENCES);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        const data = await getCategories();
        const remoteCategories = Array.isArray(data)
          ? data
          : Array.isArray(data?.categories)
            ? data.categories
            : [];

        if (mounted && remoteCategories.length > 0) {
          setCategories(remoteCategories);
        }
      } catch (error) {
        console.warn("Travel experiences unavailable; using homepage defaults.", error);
      }
    };

    void loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-20 bg-gray-100" aria-labelledby="travel-experiences-heading">
      <div className="container mx-auto px-6">
        <h2 id="travel-experiences-heading" className="text-4xl font-bold text-center mb-12">
          Explore Travel Experiences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || FaMap;
            const slug = category.slug || category.filter || category._id;

            return (
              <div
                key={category._id || category.slug || category.name}
                className="bg-white rounded-xl shadow-lg p-8 text-center hover:-translate-y-2 transition duration-300"
              >
                <div className="text-green-600 text-4xl flex justify-center mb-5">
                  <Icon aria-hidden="true" />
                </div>
                <h3 className="font-bold text-xl">{category.name}</h3>
                <p className="mt-3 text-gray-600">{category.description}</p>
                <Link
                  to={`/tours/category/${slug}`}
                  className="inline-block mt-5 text-yellow-700 font-semibold hover:text-green-700"
                >
                  View Tours →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
