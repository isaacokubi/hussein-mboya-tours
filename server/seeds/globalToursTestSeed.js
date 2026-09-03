import mongoose from "mongoose";
import dotenv from "dotenv";
import Destination from "../models/Destination.js";
import Tour from "../models/Tour.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

// Direct image URLs known to be usable by browsers. Keep these as remote media
// references for test data; production uploads should use the platform media flow.
const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
];

const destinationData = [
  ["Tsavo National Park", "tsavo-national-park", "Taita-Taveta County", "Vast wilderness, red elephants and unforgettable game drives across one of Kenya's largest protected areas."],
  ["Lake Naivasha", "lake-naivasha", "Nakuru County", "A scenic freshwater lake surrounded by wildlife, dramatic landscapes and peaceful lakeside escapes."],
  ["Watamu", "watamu", "Kilifi County", "A tropical coastal destination known for marine life, white beaches, coral reefs and relaxed island adventures."],
  ["Mount Kenya", "mount-kenya", "Nyeri County", "Highland landscapes, alpine scenery and rewarding mountain adventures around Africa's second-highest peak."],
  ["Samburu National Reserve", "samburu-national-reserve", "Samburu County", "A spectacular northern Kenya safari destination famous for unique wildlife and rich Samburu culture."],
];

const tourData = [
  ["Tsavo East Wildlife Explorer", "Tsavo National Park", "Safari", 3, 650],
  ["Tsavo West Rhino & Springs Safari", "Tsavo National Park", "Safari", 4, 820],
  ["Naivasha Lakeside Escape", "Lake Naivasha", "Nature", 2, 380],
  ["Hell's Gate Cycling Adventure", "Lake Naivasha", "Adventure", 2, 450],
  ["Lake Naivasha & Crescent Island Safari", "Lake Naivasha", "Wildlife", 3, 590],
  ["Watamu Beach Retreat", "Watamu", "Beach", 4, 720],
  ["Watamu Marine Discovery", "Watamu", "Beach", 3, 610],
  ["Malindi & Watamu Coastal Escape", "Watamu", "Beach", 5, 890],
  ["Mount Kenya Highland Adventure", "Mount Kenya", "Mountain", 4, 950],
  ["Mount Kenya Sirimon Trek", "Mount Kenya", "Mountain", 5, 1250],
  ["Mount Kenya Scenic Highlands", "Mount Kenya", "Mountain", 3, 760],
  ["Samburu Wildlife Discovery", "Samburu National Reserve", "Safari", 3, 780],
  ["Samburu Cultural Safari", "Samburu National Reserve", "Culture", 4, 920],
  ["Northern Kenya Photography Safari", "Samburu National Reserve", "Photography", 5, 1350],
  ["Tsavo Family Safari", "Tsavo National Park", "Family", 4, 880],
  ["Tsavo Luxury Wilderness Escape", "Tsavo National Park", "Luxury", 5, 1450],
  ["Naivasha Romantic Getaway", "Lake Naivasha", "Honeymoon", 3, 690],
  ["Watamu Honeymoon Paradise", "Watamu", "Honeymoon", 5, 1180],
  ["Mount Kenya Family Highlands", "Mount Kenya", "Family", 4, 840],
  ["Samburu Luxury Wilderness Experience", "Samburu National Reserve", "Luxury", 5, 1550],
];

const slugifyTitle = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const seed = async () => {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in .env");
  await mongoose.connect(process.env.MONGODB_URI);

  await runWithTenant({ role: "super_admin", bypass: true }, async () => {
    const destinationSlugs = destinationData.map(([, slug]) => slug);
    const tourSlugs = tourData.map(([title]) => slugifyTitle(title));

    // Only remove this seed's records, never real Global Tours data.
    await Tour.deleteMany({ slug: { $in: tourSlugs } });
    await Destination.deleteMany({ slug: { $in: destinationSlugs } });

    const destinations = await Destination.insertMany(
      destinationData.map(([name, slug, location, description], index) => ({
        name,
        slug,
        country: "Kenya",
        region: location,
        shortDescription: description,
        description,
        images: [{ url: IMAGE_POOL[index % IMAGE_POOL.length] }],
        featuredImage: IMAGE_POOL[index % IMAGE_POOL.length],
        attractions: ["Scenic Landscapes", "Wildlife", "Local Culture"],
        activities: ["Guided Tours", "Photography", "Sightseeing"],
        languages: ["English", "Swahili"],
        currency: "KES",
        timezone: "Africa/Nairobi",
        bestSeason: "All Year",
        featured: true,
        popular: true,
        status: "active",
        active: true,
        isDeleted: false,
      }))
    );

    const byName = new Map(destinations.map((destination) => [destination.name, destination]));
    const start = new Date();
    start.setDate(start.getDate() + 14);

    const tours = tourData.map(([title, destinationName, category, days, price], index) => {
      const destination = byName.get(destinationName);
      const date = new Date(start);
      date.setDate(date.getDate() + index * 3);
      const image = IMAGE_POOL[(index + 2) % IMAGE_POOL.length];
      return {
        title,
        slug: slugifyTitle(title),
        description: `Join Global Tours for an unforgettable ${days}-day ${category.toLowerCase()} experience in ${destinationName}, Kenya. Enjoy professionally planned travel, memorable activities and comfortable stays.`,
        shortDescription: `${days}-day ${category.toLowerCase()} experience in ${destinationName}.`,
        tags: ["Global Tours", category, destinationName, "Kenya"],
        category,
        destination: destination._id,
        country: "Kenya",
        location: destination.region,
        meetingPoint: "Nairobi CBD",
        duration: `${days} Days`,
        durationDetails: { days, nights: Math.max(0, days - 1) },
        date,
        startDate: date,
        capacity: 20 + (index % 3) * 10,
        price,
        agentPrice: Math.max(0, price - 50),
        discount: index % 5 === 0 ? 5 : 0,
        featuredImage: { url: image },
        gallery: [{ url: image }, { url: IMAGE_POOL[(index + 3) % IMAGE_POOL.length] }],
        highlights: ["Professional local guide", "Flexible itinerary", "Authentic Kenyan experience"],
        inclusions: ["Professional guide", "Transport", "Accommodation", "Selected activities"],
        exclusions: ["International flights", "Travel insurance", "Personal expenses"],
        languages: ["English", "Swahili"],
        difficulty: category === "Mountain" ? "moderate" : "easy",
        itinerary: Array.from({ length: days }, (_, dayIndex) => ({
          day: dayIndex + 1,
          title: dayIndex === 0 ? "Arrival and Orientation" : dayIndex === days - 1 ? "Final Experience and Departure" : "Explore and Experience",
          description: `Discover ${destinationName} with guided activities, scenic stops and time to enjoy the destination.`,
          activities: ["Sightseeing", "Photography", "Guided exploration"],
        })),
        availabilitySettings: { totalSlots: 20 + (index % 3) * 10, bookedSlots: 0, waitlistEnabled: true },
        bookingDeadline: 1,
        instantBooking: true,
        cancellationPolicy: "Free cancellation subject to the Global Tours booking policy.",
        featured: index < 8,
        status: "upcoming",
        published: true,
        available: true,
        isDeleted: false,
        averageRating: Number((4.2 + (index % 8) * 0.1).toFixed(1)),
        totalReviews: index * 3,
        popularity: 50 + index,
      };
    });

    await Tour.insertMany(tours, { ordered: true });
    console.log(`Global Tours test seed complete: ${destinations.length} destinations + ${tours.length} tours.`);
  });
};

seed()
  .catch((error) => {
    console.error("Global Tours test seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
