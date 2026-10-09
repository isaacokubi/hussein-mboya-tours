import "dotenv/config";
import mongoose from "mongoose";

const EXPECTED_HOST = "cluster0.cdtxzts.mongodb.net";
const EXPECTED_DATABASE = "husseindb";
const TARGET_TENANTS = [
  {
    slug: "amani-trails",
    name: "Amani Trails Safaris",
    tagline: "Discover Kenya with Amani Trails Safaris",
    description: "Thoughtfully planned Kenya safaris, wildlife encounters, coastal escapes and tailor-made journeys with local travel support.",
    packageTitles: ["Classic Kenya Safari", "Wildlife Explorer", "Kenya Safari & Coast Escape"],
  },
  {
    slug: "demo-safari",
    name: "Demo Safari Adventures",
    tagline: "Discover Kenya with Demo Safari Adventures",
    description: "Explore Kenya's wildlife, coast and landscapes with flexible safari itineraries and locally coordinated travel services.",
    packageTitles: ["Classic Kenya Safari", "Wildlife Explorer", "Kenya Safari & Coast Escape"],
  },
];
const DESTINATION_NAMES = new Set([
  "Maasai Mara", "Amboseli", "Tsavo East", "Tsavo West", "Lake Naivasha",
  "Lake Nakuru", "Samburu", "Mount Kenya", "Watamu", "Diani", "Lamu",
  "Nairobi National Park",
]);
const slugify = (value) => String(value || "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
const cleanName = (value) => String(value || "").replace(/^\s*TEST\s+/i, "").trim();
const isSynthetic = (record) => /^\s*TEST\b/i.test(String(record?.title || record?.name || ""))
  || /^test-/i.test(String(record?.slug || ""))
  || /TEST\/DEMO|synthetic sample|synthetic demo/i.test(String(record?.description || record?.subtitle || record?.badge || ""));

function assertSafeTarget() {
  if (process.env.CONFIRM_TENANT_HOMEPAGE_REPAIR !== "YES") {
    throw new Error("Set CONFIRM_TENANT_HOMEPAGE_REPAIR=YES to confirm the two-tenant public homepage repair.");
  }
  if (process.env.ALLOW_ATLAS_DEMO_SEED !== "YES") {
    throw new Error("Set ALLOW_ATLAS_DEMO_SEED=YES to explicitly allow this demo Atlas repair.");
  }
  const rawUri = String(process.env.MONGODB_URI || "");
  if (!rawUri) throw new Error("MONGODB_URI is required.");
  const target = new URL(rawUri);
  const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");
  if (target.hostname.toLowerCase() !== EXPECTED_HOST || database !== EXPECTED_DATABASE) {
    throw new Error(`Refusing to write outside ${EXPECTED_DATABASE} on the approved demo Atlas cluster.`);
  }
  if (String(process.env.NODE_ENV || "").toLowerCase() === "production") {
    throw new Error("Refusing to run this demo-content repair with NODE_ENV=production.");
  }
}

function tourTitle(tour, destination, tenantName, index) {
  const existing = String(tour.title || "");
  const match = existing.match(/^\s*TEST\s+(.+?)\s+-\s+.+$/i);
  if (match?.[1]) return cleanName(match[1]);
  if (!/^\s*TEST\b/i.test(existing) && !/^test-/i.test(String(tour.slug || ""))) return existing;
  return `${destination || "Kenya"} Safari Experience ${String(index + 1).padStart(2, "0")}`;
}

async function main() {
  assertSafeTarget();
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;
  const tenants = await db.collection("organizations")
    .find({ slug: { $in: TARGET_TENANTS.map((tenant) => tenant.slug) } }, { projection: { _id: 1, slug: 1, settings: 1 } })
    .toArray();
  if (tenants.length !== TARGET_TENANTS.length) {
    throw new Error("Expected Amani Trails and Demo Safari tenant records. No repair was started.");
  }

  const plans = [];
  for (const spec of TARGET_TENANTS) {
    const tenant = tenants.find((row) => row.slug === spec.slug);
    const scope = { tenantId: tenant._id };
    const [destinations, tours, packages, categories, slides, galleries] = await Promise.all([
      db.collection("destinations").find(scope).toArray(),
      db.collection("tours").find({ ...scope, isDeleted: { $ne: true } }).toArray(),
      db.collection("tourpackages").find(scope).toArray(),
      db.collection("tourcategories").find(scope).toArray(),
      db.collection("heroslides").find(scope).toArray(),
      db.collection("galleries").find(scope).toArray(),
    ]);

    const destinationRepairs = destinations
      .filter((row) => isSynthetic(row) || /^test-/i.test(String(row.slug || "")))
      .map((row) => {
        const name = cleanName(row.name);
        if (!DESTINATION_NAMES.has(name)) throw new Error(`Unknown synthetic destination in ${spec.slug}: ${row.name}. No records were changed.`);
        return { row, name, slug: `${spec.slug}-${slugify(name)}` };
      });
    const destinationById = new Map(destinations.map((row) => [String(row._id), row]));
    const tourRepairs = tours
      .filter((row) => isSynthetic(row) || /^test-/i.test(String(row.slug || "")))
      .map((row, index) => {
        const destination = destinationById.get(String(row.destination));
        const destinationName = cleanName(destination?.name) || String(row.location || "Kenya");
        return {
          row,
          title: tourTitle(row, destinationName, spec.name, index),
          destinationName,
          slug: `${spec.slug}-${slugify(tourTitle(row, destinationName, spec.name, index))}-${index + 1}`,
        };
      });
    const packageRepairs = packages
      .filter((row) => isSynthetic(row) || /^test-/i.test(String(row.slug || "")))
      .map((row, index) => {
        const destination = cleanName(row.destination);
        const title = spec.packageTitles[index % spec.packageTitles.length];
        return { row, title, destination: DESTINATION_NAMES.has(destination) ? destination : ["Maasai Mara", "Amboseli", "Diani"][index % 3], slug: `${spec.slug}-${slugify(title)}-${index + 1}` };
      });
    const categoryRepairs = categories.filter((row) => isSynthetic(row) || /^test-/i.test(String(row.slug || "")));
    const slideRepairs = slides.filter((row) => isSynthetic(row) || /^\s*TEST\b/i.test(String(row.title || "")));
    const galleryRepairs = galleries.filter((row) => isSynthetic(row) || /^\s*TEST\b/i.test(String(row.title || "")));

    if (destinationRepairs.length < 6) throw new Error(`Expected at least six synthetic destinations for ${spec.slug}; found ${destinationRepairs.length}. No records were changed.`);
    if (!tourRepairs.length || !packageRepairs.length || !slideRepairs.length) {
      throw new Error(`Expected synthetic tours, packages, and homepage slide for ${spec.slug}. No records were changed.`);
    }

    // Preflight unique slugs before any writes. The repair is scoped to the two
    // demo tenants and refuses to overwrite any existing non-synthetic record.
    for (const item of destinationRepairs) {
      const collision = destinations.find((row) => String(row._id) !== String(item.row._id) && row.slug === item.slug);
      if (collision) throw new Error(`Destination slug collision in ${spec.slug}: ${item.slug}. No records were changed.`);
    }
    const allTours = await db.collection("tours").find({}, { projection: { _id: 1, slug: 1 } }).toArray();
    for (const item of tourRepairs) {
      const collision = allTours.find((row) => String(row._id) !== String(item.row._id) && row.slug === item.slug);
      if (collision) throw new Error(`Tour slug collision: ${item.slug}. No records were changed.`);
    }
    const allPackages = await db.collection("tourpackages").find({}, { projection: { _id: 1, slug: 1 } }).toArray();
    for (const item of packageRepairs) {
      const collision = allPackages.find((row) => String(row._id) !== String(item.row._id) && row.slug === item.slug);
      if (collision) throw new Error(`Package slug collision: ${item.slug}. No records were changed.`);
    }
    plans.push({ spec, tenant, scope, destinationRepairs, tourRepairs, packageRepairs, categoryRepairs, slideRepairs, galleryRepairs });
  }

  const report = [];
  for (const plan of plans) {
    const { spec, tenant, scope } = plan;
    for (const item of plan.destinationRepairs) {
      await db.collection("destinations").updateOne({ _id: item.row._id, ...scope }, { $set: {
        name: item.name,
        slug: item.slug,
        description: `${item.name} is one of Kenya's memorable destinations, offering distinctive landscapes, wildlife and locally guided experiences.`,
        shortDescription: `Explore ${item.name} with a locally planned Kenya journey.`,
        status: "active",
        active: true,
        featured: true,
        isDeleted: false,
      } });
    }

    for (const [index, item] of plan.tourRepairs.entries()) {
      const cleanTitle = item.title.replace(/\s+/g, " ").trim();
      await db.collection("tours").updateOne({ _id: item.row._id, ...scope }, { $set: {
        title: cleanTitle,
        slug: item.slug,
        description: `Discover ${item.destinationName} on a carefully planned Kenya safari with local travel support, guided sightseeing and time to enjoy the destination.`,
        shortDescription: `A memorable ${item.destinationName} journey with local experts.`,
        tags: ["Kenya", "Safari", item.destinationName],
        meetingPoint: "Nairobi, Kenya",
        highlights: ["Local Kenyan guide", "Scenic destination experiences", "Flexible travel support"],
        itinerary: [
          { day: 1, title: "Arrival and introduction", description: `Meet your local team and begin exploring ${item.destinationName}.`, activities: ["Arrival briefing", "Guided sightseeing"], meals: ["Breakfast"] },
          { day: 2, title: "Explore the destination", description: `Enjoy the landscapes and experiences around ${item.destinationName}.`, activities: ["Guided excursion", "Wildlife or cultural viewing"], meals: ["Breakfast", "Lunch"] },
          { day: 3, title: "Final experiences and return", description: "Enjoy a final activity before your onward journey.", activities: ["Morning activity", "Return transfer"], meals: ["Breakfast"] },
        ],
        cancellationPolicy: "Cancellation terms and any applicable fees are confirmed in the written quotation before booking.",
        status: "upcoming",
        published: true,
        featured: index < 6,
        available: true,
        isDeleted: false,
      } });
    }

    for (const [index, item] of plan.packageRepairs.entries()) {
      await db.collection("tourpackages").updateOne({ _id: item.row._id, ...scope }, { $set: {
        title: item.title,
        slug: item.slug,
        destination: item.destination,
        country: "Kenya",
        description: `A flexible ${item.title.toLowerCase()} built around ${item.destination}, with locally coordinated transport, guiding and itinerary support.`,
        shortDescription: `A multi-day Kenya journey featuring ${item.destination}.`,
        highlights: ["Kenya's landscapes and wildlife", "Local travel support", "Flexible itinerary planning"],
        itinerary: Array.from({ length: Math.max(3, Number(item.row.numberOfDays || 3)) }, (_, dayIndex) => ({
          day: dayIndex + 1,
          title: ["Arrival and introduction", "Explore Kenya", "Guided destination experiences", "Leisure and onward travel"][Math.min(dayIndex, 3)],
          description: `Enjoy a thoughtfully planned day as part of your ${item.title.toLowerCase()}.`,
        })),
        status: "active",
        published: true,
      } });
    }

    for (const item of plan.categoryRepairs) {
      await db.collection("tourcategories").updateOne({ _id: item._id, ...scope }, { $set: {
        name: "Kenya Safaris",
        slug: `${spec.slug}-kenya-safaris`,
        description: `Wildlife, landscapes and guided adventures with ${spec.name}.`,
        active: true,
      } });
    }

    for (const [index, item] of plan.slideRepairs.entries()) {
      await db.collection("heroslides").updateOne({ _id: item._id, ...scope }, { $set: {
        title: spec.tagline,
        subtitle: spec.description,
        badge: "KENYA SAFARIS • BEACH • ADVENTURE",
        "buttonOne.text": "Explore Tours",
        "buttonOne.link": "/tours",
        "buttonTwo.text": "Plan Your Trip",
        "buttonTwo.link": "/contact",
        active: true,
        order: index,
      } });
    }

    for (const item of plan.galleryRepairs) {
      await db.collection("galleries").updateOne({ _id: item._id, ...scope }, { $set: {
        title: `${spec.name} Safari Gallery`,
        category: "Safari",
        active: true,
      } });
    }

    await db.collection("organizations").updateOne({ _id: tenant._id, slug: spec.slug }, { $set: {
      "settings.publicBranding.displayName": spec.name,
      "settings.publicBranding.description": spec.description,
    } });

    const [publishedDestinations, featuredTours, publishedPackages, activeSlides] = await Promise.all([
      db.collection("destinations").countDocuments({ ...scope, status: "active", active: true, featured: true, isDeleted: { $ne: true } }),
      db.collection("tours").countDocuments({ ...scope, published: true, featured: true, available: true, isDeleted: { $ne: true }, status: { $in: ["scheduled", "upcoming", "ongoing"] } }),
      db.collection("tourpackages").countDocuments({ ...scope, published: true, status: "active" }),
      db.collection("heroslides").countDocuments({ ...scope, active: true }),
    ]);
    if (!publishedDestinations || !featuredTours || !publishedPackages || !activeSlides) {
      throw new Error(`Post-repair public homepage validation failed for ${spec.slug}.`);
    }
    report.push({
      tenant: spec.slug,
      destinationsRepaired: plan.destinationRepairs.length,
      toursRepaired: plan.tourRepairs.length,
      packagesRepaired: plan.packageRepairs.length,
      categoriesRepaired: plan.categoryRepairs.length,
      slidesRepaired: plan.slideRepairs.length,
      galleriesRepaired: plan.galleryRepairs.length,
      publishedFeaturedDestinations: publishedDestinations,
      publishedFeaturedTours: featuredTours,
      publishedPackages,
      activeSlides,
    });
  }

  console.log(JSON.stringify({ success: true, database: mongoose.connection.name, repairedTenants: report }, null, 2));
}

main().catch((error) => {
  console.error(`Tenant homepage repair failed: ${String(error.message || error).replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, "[MongoDB URI redacted]")}`);
  process.exitCode = 1;
}).finally(() => mongoose.disconnect().catch(() => {}));
