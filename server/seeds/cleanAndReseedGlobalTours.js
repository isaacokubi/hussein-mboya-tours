import dotenv from "dotenv";
import mongoose from "mongoose";
import crypto from "crypto";

import Destination from "../models/Destination.js";
import Tour from "../models/Tour.js";
import Gallery from "../models/Gallery.js";
import HeroSlide from "../models/HeroSlide.js";
import TourCategory from "../models/TourCategory.js";
import Organization from "../models/Organization.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import User from "../models/User.js";

dotenv.config();

const image = (id, width = 1800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=90`;

const galleryData = [
  ["Kenya Wildlife", image("photo-1557050543-4d5f4e07ef46"), "Safari"],
  ["Maasai Mara Safari", image("photo-1516426122078-c23e76319801"), "Safari"],
  ["Samburu Wilderness", image("photo-1547970810-dc1eac37d174"), "Safari"],
  ["African Lion Safari", image("photo-1549366021-9f761d450615"), "Safari"],
  ["Kenya Coast", image("photo-1510414842594-a61c69b5ae57"), "Beach"],
  ["Watamu Beach", image("photo-1507525428034-b723cf961d3e"), "Beach"],
  ["Indian Ocean Escape", image("photo-1500375592092-40eb2168fd21"), "Beach"],
  ["Mombasa Coast", image("photo-1473116763249-2faaef81ccda"), "Beach"],
  ["Mount Kenya", image("photo-1464822759023-fed622ff2c3b"), "Adventure"],
  ["Kenya Highlands", image("photo-1516026672322-bc52d61a55d5"), "Adventure"],
  ["Lake Naivasha", image("photo-1501785888041-af3ef285b470"), "Adventure"],
  ["Safari Adventure", image("photo-1526772662000-3f88f10405ff"), "Adventure"],
];

const heroData = [
  {
    title: "Discover Kenya Beyond the Ordinary",
    subtitle: "Premium safaris, coastal escapes and unforgettable East African adventures.",
    badge: "GLOBAL TOURS • KENYA",
    image: image("photo-1516426122078-c23e76319801", 2200),
    order: 1,
  },
  {
    title: "Wild Kenya. Beautifully Yours.",
    subtitle: "Travel with local expertise across wildlife reserves, mountains, lakes and the coast.",
    badge: "CURATED AFRICAN EXPERIENCES",
    image: image("photo-1547970810-dc1eac37d174", 2200),
    order: 2,
  },
  {
    title: "From Safari Trails to the Indian Ocean",
    subtitle: "Build your perfect Kenyan journey with experiences designed around you.",
    badge: "SAFARI • BEACH • ADVENTURE",
    image: image("photo-1507525428034-b723cf961d3e", 2200),
    order: 3,
  },
];

const categories = [
  { name: "Wildlife Safari", slug: "wildlife-safari", description: "Experience Kenya's wildlife and iconic national parks.", icon: "Binoculars" },
  { name: "Beach Holidays", slug: "beach-holidays", description: "Relax on Kenya's beautiful Indian Ocean coastline.", icon: "Beach" },
  { name: "Mountain Adventures", slug: "mountain-adventures", description: "Explore Kenya's mountains, highlands and hiking trails.", icon: "Mountain" },
  { name: "Group Tours", slug: "group-tours", description: "Enjoy memorable guided journeys with fellow travellers.", icon: "People" },
];

const permissions = [
  "manage_users", "manage_tours", "manage_destinations", "manage_bookings",
  "manage_payments", "view_reports", "manage_gallery", "manage_staff",
  "manage_vehicles", "manage_settings", "view_assigned_tours", "view_tour_guests",
  "update_tour_status", "submit_tour_report",
].map((name) => ({
  name,
  description: `Permission to ${name.replace(/_/g, " ")}`,
  label: name.replace(/_/g, " "),
  module: name.split(/[._]/)[0],
  category: "other",
  isActive: true,
}));

const roles = [
  { name: "super_admin", displayName: "Super Admin", level: 100, isSystem: true },
  { name: "admin", displayName: "Admin", level: 90, isSystem: true },
  { name: "tour_manager", displayName: "Tour Manager", level: 70, isSystem: true },
  { name: "agent", displayName: "Travel Agent", level: 50, isSystem: true },
  { name: "tour_guide", displayName: "Tour Guide", level: 40, isSystem: true },
  { name: "driver", displayName: "Driver", level: 30, isSystem: true },
  { name: "customer", displayName: "Customer", level: 10, isSystem: true, isDefault: true },
];

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");

  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Keep the product catalogue and tenant configuration. Remove transactional,
  // test, demo and historical records so dashboards start clean.
  const keepCollections = new Set([
    "destinations",
    "tours",
    "organizations",
    "roles",
    "permissions",
    "systemsettings",
    "systemsettingses",
  ]);

  const collections = await db.listCollections().toArray();
  let dropped = 0;
  for (const collection of collections) {
    if (!keepCollections.has(collection.name)) {
      await db.collection(collection.name).drop().catch(() => {});
      dropped += 1;
    }
  }

  // Recreate the core system collections/models removed above only where needed.
  await Permission.bulkWrite(permissions.map((permission) => ({
    updateOne: { filter: { name: permission.name }, update: { $set: permission }, upsert: true },
  })));

  for (const role of roles) {
    await Role.findOneAndUpdate(
      { name: role.name },
      { $set: { ...role, status: "active" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  let organization = await Organization.findOne({ slug: "global-tours" });
  if (!organization) {
    organization = await Organization.create({
      name: "Global Tours",
      slug: "global-tours",
      legalName: "Global Tours",
      supportEmail: "izobrack3@gmail.com",
      supportPhone: "0707476586",
      address: "Nairobi, Kenya",
      country: "Kenya",
      timezone: "Africa/Nairobi",
      currency: "KES",
      status: "active",
      subscription: { plan: "professional", seats: 10 },
      features: { payments: true, mpesa: true, stripe: true, ai: false, customDomain: false },
    });
  }

  // Replace old gallery/hero/category demo data with only the current Global Tours content.
  await Gallery.deleteMany({});
  await Gallery.insertMany(galleryData.map(([title, url, category]) => ({
    tenantId: organization._id,
    title,
    image: { url, publicId: "" },
    category,
    featured: true,
    active: true,
  })));

  await HeroSlide.deleteMany({});
  await HeroSlide.insertMany(heroData.map((slide) => ({
    tenantId: organization._id,
    title: slide.title,
    subtitle: slide.subtitle,
    badge: slide.badge,
    image: { url: slide.image, publicId: "" },
    buttonOne: { text: "Explore Tours", link: "/tours" },
    buttonTwo: { text: "Contact Us", link: "/contact" },
    active: true,
    order: slide.order,
  })));

  await TourCategory.deleteMany({});
  await TourCategory.insertMany(categories);

  const adminRole = await Role.findOne({ name: "admin" });
  const permissionDocs = await Permission.find({ name: { $in: permissions.map((p) => p.name) } });
  adminRole.permissions = permissionDocs.map((permission) => permission._id);
  await adminRole.save();

  // One clean admin account is recreated so the dashboard remains accessible.
  await User.deleteMany({});
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@globaltours.co.ke";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(18).toString("base64url");
  await User.create({
    name: "Global Tours Admin",
    email: adminEmail,
    password: adminPassword,
    role: "admin",
    roleId: adminRole._id,
    legacyRole: "admin",
    status: "active",
    isVerified: true,
  });

  console.log("\nGLOBAL TOURS CLEAN RESEED COMPLETE");
  console.log(`Collections cleared: ${dropped}`);
  console.log("Preserved: destinations, tours and tenant/system configuration.");
  console.log(`Gallery: ${galleryData.length} fresh records`);
  console.log(`Hero slides: ${heroData.length} fresh records`);
  console.log(`Tour categories: ${categories.length}`);
  console.log(`Admin email: ${adminEmail}`);
  if (process.env.SEED_ADMIN_PASSWORD) console.log("Admin password: taken from SEED_ADMIN_PASSWORD");
  else console.log("Admin password: generated and intentionally not printed; set SEED_ADMIN_PASSWORD before running if you need a known password.");
};

run()
  .catch((error) => {
    console.error("Global Tours clean reseed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
