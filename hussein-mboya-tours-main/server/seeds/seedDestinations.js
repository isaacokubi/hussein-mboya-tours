import Destination from "../models/Destination.js";

const destinations = [
  {
    name: "Maasai Mara",
    slug: "maasai-mara",
    country: "Kenya",
    location: "Narok County",
    description: "Experience the Great Migration and unforgettable safari adventures.",
    images: ["/destinations/maasai-mara.jpg"],
    attractions: ["Great Migration", "Big Five Wildlife", "Maasai Culture"],
    activities: ["Game Drives", "Photography", "Hot Air Balloon Safari"],
    featured: true,
  },
  {
    name: "Amboseli National Park",
    slug: "amboseli-national-park",
    country: "Kenya",
    location: "Kajiado County",
    description: "Discover elephant herds and views of Mount Kilimanjaro.",
    images: ["/destinations/amboseli.jpg"],
    attractions: ["Mount Kilimanjaro Views", "Elephant Herds"],
    activities: ["Safari Drives", "Bird Watching", "Nature Walks"],
    featured: true,
  },
  {
    name: "Diani Beach",
    slug: "diani-beach",
    country: "Kenya",
    location: "Kwale County",
    description: "Relax on white sandy beaches and enjoy coastal experiences.",
    images: ["/destinations/diani.jpg"],
    attractions: ["White Sandy Beaches", "Indian Ocean", "Marine Life"],
    activities: ["Swimming", "Snorkeling", "Diving"],
    featured: true,
  },
];

export default async function seedDestinations() {
  await Destination.deleteMany({});
  const created = await Destination.insertMany(destinations);
  console.log(`Seeded ${created.length} destinations`);
  return created;
}
