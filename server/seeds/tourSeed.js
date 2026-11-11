/**
 * Purpose: tour Seed database seed module. Main declarations: seedTours, getDestination.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load dotenv so this module can use its exported dependencies.
import dotenv from "dotenv";

// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Declare seedTours for use by the surrounding module or function.
const seedTours = async () => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!process.env.MONGODB_URI) and run the matching branch.
    if (!process.env.MONGODB_URI) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("MONGODB_URI is missing in .env");
    }

    // Perform the side effect or state update expressed on the following line.
    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    // Declare destinations for use by the surrounding module or function.
    const destinations = await Destination.find();

    // Check the condition (destinations.length === 0) and run the matching branch.
    if (destinations.length === 0) {
      // Stop the current operation by raising a new Error instance.
      throw new Error(
        "No destinations found. Seed destinations before seeding tours."
      );
    }

    // Declare getDestination for use by the surrounding module or function.
    const getDestination = (name) => {
      // Declare destination for use by the surrounding module or function.
      const destination = destinations.find(
        (d) => d.name.toLowerCase() === name.toLowerCase()
      );

      // Check the condition (!destination) and run the matching branch.
      if (!destination) {
        // Stop the current operation by raising a new Error instance.
        throw new Error(`Destination not found: ${name}`);
      }

      // Return the id value to the caller.
      return destination._id;
    };

    // Perform the side effect or state update expressed on the following line.
    await Tour.deleteMany({});

    // debug removed

    // Declare tourData for use by the surrounding module or function.
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

    // Perform the side effect or state update expressed on the following line.
    await Tour.insertMany(tourData, {
      ordered: true,
    });

    // debug removed
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("❌ Tour seed failed:", error.message);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
    // debug removed
  }
};

// Perform the side effect or state update expressed on the following line.
seedTours();
