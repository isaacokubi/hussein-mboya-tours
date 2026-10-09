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

    // Repair destination relationships for already-cleaned tours as well as synthetic rows.
    // The first repair run renamed TEST tours, so those records no longer match
    // the synthetic selector above. Reconcile every existing tour in this tenant
    // by its title and bind it to a destination owned by the same tenant.
    const canonicalDestinations = destinations.map((row) => ({
      row,
      name: cleanName(row.name),
    }));
    const destinationDescriptions = {
      "Maasai Mara": "The Maasai Mara is famed for big-cat sightings, sweeping savannah and the seasonal Great Migration. Enjoy guided game drives and learn about Maasai culture.",
      "Amboseli": "Amboseli is known for large elephant herds, open plains and spectacular views of Mount Kilimanjaro on clear days.",
      "Tsavo East": "Tsavo East offers vast red-earth plains, baobab-dotted landscapes and excellent opportunities to spot elephants and other wildlife.",
      "Tsavo West": "Tsavo West combines volcanic hills, lava fields, Mzima Springs and varied wildlife habitats in a dramatic landscape.",
      "Lake Naivasha": "Lake Naivasha is a freshwater Rift Valley lake known for birdlife, boat trips and nearby walking and cycling experiences.",
      "Lake Nakuru": "Lake Nakuru National Park is celebrated for rhinos, rich birdlife, scenic viewpoints and its setting in the Great Rift Valley.",
      "Samburu": "Samburu's arid northern landscapes are home to distinctive wildlife species and vibrant Samburu cultural traditions.",
      "Mount Kenya": "Mount Kenya offers forest walks, highland scenery and trekking routes for different levels of experience and preparation.",
      "Watamu": "Watamu is a relaxed Indian Ocean destination with white-sand beaches, coral reefs and marine conservation experiences.",
      "Diani": "Diani is known for its white-sand beach, turquoise Indian Ocean waters, water sports and easy access to coastal excursions.",
      "Lamu": "Lamu blends Swahili architecture, historic lanes, dhow culture and a distinctive island pace of life.",
      "Nairobi National Park": "Nairobi National Park offers wildlife viewing across open grassland with the city's skyline in the distance, close to the capital.",
    };
    for (const entry of canonicalDestinations) {
      const description = destinationDescriptions[entry.name];
      if (!description) continue;
      await db.collection("destinations").updateOne({ _id: entry.row._id, ...scope }, { $set: {
        name: entry.name,
        description,
        shortDescription: `Discover ${entry.name} with local guides and thoughtfully planned Kenya experiences.`,
        country: "Kenya",
        status: "active",
        active: true,
        featured: true,
        isDeleted: false,
      } });
    }
    const destinationForTourTitle = (title) => {
      const normalized = String(title || "").toLowerCase();
      let expected;
      if (/maasai\s+mara/.test(normalized)) expected = "Maasai Mara";
      else if (/amboseli/.test(normalized)) expected = "Amboseli";
      else if (/tsavo\s+east/.test(normalized)) expected = "Tsavo East";
      else if (/tsavo\s+west/.test(normalized)) expected = "Tsavo West";
      else if (/nakuru/.test(normalized)) expected = "Lake Nakuru";
      else if (/naivasha/.test(normalized)) expected = "Lake Naivasha";
      else if (/samburu/.test(normalized)) expected = "Samburu";
      else if (/mount\s+kenya/.test(normalized)) expected = "Mount Kenya";
      else if (/watamu/.test(normalized)) expected = "Watamu";
      else if (/lamu/.test(normalized)) expected = "Lamu";
      else if (/nairobi/.test(normalized)) expected = "Nairobi National Park";
      else if (/diani|coast|beach/.test(normalized)) expected = "Diani";
      else return null;
      return canonicalDestinations.find((entry) => entry.name.toLowerCase() === expected.toLowerCase()) || null;
    };
    const allTenantTours = await db.collection("tours").find({ ...scope, isDeleted: { $ne: true } }).toArray();
    for (const tour of allTenantTours) {
      const destinationEntry = destinationForTourTitle(tour.title);
      if (!destinationEntry) continue;
      const destinationName = destinationEntry.name;
      const descriptions = {
        "Maasai Mara": "Explore Kenya's world-renowned savannahs, seasonal wildebeest migration and guided wildlife drives in the Maasai Mara.",
        "Amboseli": "Discover Amboseli's elephant herds, open plains and striking views of Mount Kilimanjaro with a local guide.",
        "Tsavo East": "Travel through Tsavo East's expansive red-earth landscapes, open savannah and diverse wildlife habitats.",
        "Tsavo West": "Explore Tsavo West's volcanic scenery, rugged hills, natural springs and varied wildlife landscapes.",
        "Lake Nakuru": "Discover Lake Nakuru National Park's lake views, birdlife, rhinos and surrounding Rift Valley scenery.",
        "Lake Naivasha": "Enjoy Lake Naivasha's freshwater scenery, birdlife and nearby Rift Valley outdoor experiences.",
        "Samburu": "Experience Samburu's northern landscapes, distinctive wildlife and rich local cultural heritage.",
        "Mount Kenya": "Explore Mount Kenya's foothills, forest trails and mountain scenery with appropriately planned local support.",
        "Watamu": "Enjoy Watamu's Indian Ocean beaches, marine experiences and relaxed coastal atmosphere.",
        "Diani": "Relax on Diani's white-sand Indian Ocean beaches and explore the Kenyan coast at your own pace.",
        "Lamu": "Discover Lamu's Swahili heritage, historic old town and peaceful island atmosphere.",
        "Nairobi National Park": "Experience Nairobi National Park's wildlife and open grasslands just outside Kenya's capital.",
      };
      await db.collection("tours").updateOne({ _id: tour._id, ...scope }, { $set: {
        destination: destinationEntry.row._id,
        location: destinationName,
        country: "Kenya",
        description: descriptions[destinationName] || `Explore ${destinationName} with a locally planned Kenya journey and guided experiences.`,
        shortDescription: `Discover ${destinationName} with local travel support.`,
      } });
    }

    const syntheticAdminUsers = await db.collection("users").find({
      ...scope,
      role: { $in: ["admin", "administrator"] },
      name: { $regex: "TEST|DEMO", $options: "i" },
    }).toArray();
    for (const admin of syntheticAdminUsers) {
      const cleanAdminName = spec.slug === "demo-safari" ? "Demo Safari Administrator" : "Amani Trails Administrator";
      await db.collection("users").updateOne({ _id: admin._id, ...scope }, { $set: { name: cleanAdminName } });
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
