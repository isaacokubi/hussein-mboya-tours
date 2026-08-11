import mongoose from "mongoose";
import dotenv from "dotenv";

import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";

dotenv.config();

const seedTours = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");

    const destinations = await Destination.find();

    if (destinations.length === 0) {
      throw new Error(
        "No destinations found. Seed destinations before seeding tours."
      );
    }

    const getDestination = (name) => {
      const destination = destinations.find(
        (d) => d.name.toLowerCase() === name.toLowerCase()
      );

      if (!destination) {
        throw new Error(`Destination not found: ${name}`);
      }

      return destination._id;
    };

    await Tour.deleteMany({});

    console.log("🗑 Existing tours removed");

    const tourData = [
      {
        title: "Maasai Mara Safari Adventure",
        slug: "maasai-mara-safari-adventure",

        description:
          "Experience the Great Migration, wildlife, and unforgettable safari moments in Kenya's most famous reserve.",

        category: "Safari",

        destination: getDestination("Maasai Mara"),

        country: "Kenya",

        duration: 3,

        difficulty: "easy",

        price: 500,

        discount: 0,

        images: ["/destinations/maasai-mara.jpg"],

        itinerary: [
          {
            day: 1,
            title: "Arrival and Game Drive",
            description:
              "Arrive at Maasai Mara and enjoy an evening wildlife drive.",
          },
          {
            day: 2,
            title: "Great Migration Experience",
            description:
              "Full-day safari exploring lions, elephants, zebras, and other wildlife.",
          },
          {
            day: 3,
            title: "Departure",
            description:
              "Morning game drive before returning home.",
          },
        ],

        inclusions: [
          "Transport",
          "Accommodation",
          "Park Fees",
          "Professional Guide",
        ],

        exclusions: [
          "Personal Expenses",
          "Travel Insurance",
        ],

        availabilitySettings: {
          totalSlots: 20,
          bookedSlots: 0,
        },

        featured: true,

        status: "active",
      },

      {
        title: "Diani Beach Escape",

        slug: "diani-beach-escape",

        description:
          "Relax on Kenya's most beautiful white sandy beaches with luxury accommodation and coastal adventures.",

        category: "Beach",

        destination: getDestination("Diani Beach"),

        country: "Kenya",

        duration: 5,

        difficulty: "easy",

        price: 700,

        discount: 0,

        images: ["/destinations/diani.jpg"],

        itinerary: [
          {
            day: 1,
            title: "Arrival",
            description:
              "Arrive and check into your luxury beach resort.",
          },
          {
            day: 2,
            title: "Beach Activities",
            description:
              "Enjoy water sports or relax on the white sandy beach.",
          },
          {
            day: 3,
            title: "Coastal Exploration",
            description:
              "Discover marine life and coastal culture.",
          },
          {
            day: 4,
            title: "Leisure Day",
            description:
              "Spa, swimming, or optional excursions.",
          },
          {
            day: 5,
            title: "Departure",
            description:
              "Transfer to the airport.",
          },
        ],

        inclusions: [
          "Hotel Accommodation",
          "Breakfast",
          "Beach Activities",
        ],

        exclusions: [
          "Flights",
          "Personal Expenses",
        ],

        availabilitySettings: {
          totalSlots: 20,
          bookedSlots: 0,
        },

        featured: true,

        status: "active",
      },

      {
        title: "Amboseli Wildlife Safari",

        slug: "amboseli-wildlife-safari",

        description:
          "Discover elephants, breathtaking landscapes, and spectacular views of Mount Kilimanjaro.",

        category: "Safari",

        destination: getDestination("Amboseli National Park"),

        country: "Kenya",

        duration: 4,

        difficulty: "easy",

        price: 850,

        discount: 0,

        images: ["/destinations/amboseli.jpg"],

        itinerary: [
          {
            day: 1,
            title: "Arrival at Amboseli",
            description:
              "Check into the lodge and enjoy an evening game drive.",
          },
          {
            day: 2,
            title: "Full-Day Safari",
            description:
              "Explore Amboseli National Park and its famous elephant herds.",
          },
          {
            day: 3,
            title: "Nature Experience",
            description:
              "Photography, bird watching, and wildlife viewing.",
          },
          {
            day: 4,
            title: "Departure",
            description:
              "Morning safari before returning.",
          },
        ],

        inclusions: [
          "Transport",
          "Accommodation",
          "Park Fees",
          "Professional Guide",
        ],

        exclusions: [
          "Tips",
          "Personal Expenses",
        ],

        availabilitySettings: {
          totalSlots: 20,
          bookedSlots: 0,
        },

        featured: true,

        status: "active",
      },
    ];

    await Tour.insertMany(tourData, {
      ordered: true,
    });

    console.log(`✅ ${tourData.length} tours seeded successfully`);
  } catch (error) {
    console.error("❌ Tour seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
    console.log("🔌 MongoDB connection closed");
  }
};

seedTours();