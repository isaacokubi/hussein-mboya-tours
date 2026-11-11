/**
 * Purpose: repair Tenant Homepages operational script. Main declarations: slugify, cleanName, isSynthetic, assertSafeTarget, tourTitle.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "dotenv/config";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";

// Declare EXPECTED_HOST for use by the surrounding module or function.
const EXPECTED_HOST = "cluster0.cdtxzts.mongodb.net";
// Declare EXPECTED_DATABASE for use by the surrounding module or function.
const EXPECTED_DATABASE = "husseindb";
// Declare TARGET_TENANTS for use by the surrounding module or function.
const TARGET_TENANTS = [
  {
    slug: "hussein-mboya",
    name: "Hussein Mboya Tours",
    tagline: "Experience the Magic of Kenya",
    description: "Discover Kenya through expertly planned safaris, wildlife encounters, coastal escapes and tailor-made journeys with Hussein Mboya Tours.",
    packageTitles: ["Classic Kenya Safari", "Wildlife Explorer", "Kenya Safari & Coast Escape"],
  },
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
// Declare DESTINATION_NAMES for use by the surrounding module or function.
const DESTINATION_NAMES = new Set([
  "Maasai Mara", "Amboseli", "Tsavo East", "Tsavo West", "Lake Naivasha",
  "Lake Nakuru", "Samburu", "Mount Kenya", "Watamu", "Diani", "Lamu",
  "Nairobi National Park",
]);
// Declare DESTINATION_IMAGE_PATHS for use by the surrounding module or function.
const DESTINATION_IMAGE_PATHS = {
  "Maasai Mara": "/destinations/maasai-mara.jpg",
  "Amboseli": "/destinations/amboseli.jpg",
  "Tsavo East": "/demo-destinations/kenya-landscape-03.svg",
  "Tsavo West": "/demo-destinations/kenya-landscape-04.svg",
  "Lake Naivasha": "/demo-destinations/kenya-landscape-05.svg",
  "Lake Nakuru": "/demo-destinations/kenya-landscape-06.svg",
  "Samburu": "/demo-destinations/kenya-landscape-07.svg",
  "Mount Kenya": "/demo-destinations/kenya-landscape-08.svg",
  "Watamu": "/demo-destinations/kenya-landscape-09.svg",
  "Diani": "/destinations/diani.jpg",
  "Lamu": "/demo-destinations/kenya-landscape-11.svg",
  "Nairobi National Park": "/demo-destinations/kenya-landscape-12.svg",
};
// Declare TOUR_IMAGE_PATHS for use by the surrounding module or function.
const TOUR_IMAGE_PATHS = [
  "/gallery/mara.jpg", "/gallery/amboseli.jpg", "/gallery/diani.jpg",
  "/gallery/beach.jpg", "/gallery/safari.jpg", "/gallery/culture.jpg",
  "/demo-destinations/kenya-landscape-13.svg", "/demo-destinations/kenya-landscape-14.svg",
  "/demo-destinations/kenya-landscape-15.svg", "/demo-destinations/kenya-landscape-16.svg",
  "/demo-destinations/kenya-landscape-17.svg", "/demo-destinations/kenya-landscape-18.svg",
];
// Declare HERO_IMAGE_PATHS for use by the surrounding module or function.
const HERO_IMAGE_PATHS = ["/hero1.jpeg", "/hero2.jpeg", "/hero4.jpeg"];
// Declare GALLERY_IMAGE_PATHS for use by the surrounding module or function.
const GALLERY_IMAGE_PATHS = ["/gallery/mara.jpg", "/gallery/amboseli.jpg", "/gallery/diani.jpg", "/gallery/beach.jpg", "/gallery/safari.jpg", "/gallery/culture.jpg"];

// Declare slugify for use by the surrounding module or function.
const slugify = (value) => String(value || "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
// Declare cleanName for use by the surrounding module or function.
const cleanName = (value) => String(value || "").replace(/^\s*TEST\s+/i, "").trim();
// Declare isSynthetic for use by the surrounding module or function.
const isSynthetic = (record) => /^\s*TEST\b/i.test(String(record?.title || record?.name || ""))
  || /^test-/i.test(String(record?.slug || ""))
  || /TEST\/DEMO|synthetic sample|synthetic demo/i.test(String(record?.description || record?.subtitle || record?.badge || ""));

// Define assertSafeTarget; its parameters and body implement this operation.
function assertSafeTarget() {
  // Check the condition (process.env.CONFIRM_TENANT_HOMEPAGE_REPAIR !== "YES") and run the matching branch.
  if (process.env.CONFIRM_TENANT_HOMEPAGE_REPAIR !== "YES") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Set CONFIRM_TENANT_HOMEPAGE_REPAIR=YES to confirm the two-tenant public homepage repair.");
  }
  // Check the condition (process.env.ALLOW_ATLAS_DEMO_SEED !== "YES") and run the matching branch.
  if (process.env.ALLOW_ATLAS_DEMO_SEED !== "YES") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Set ALLOW_ATLAS_DEMO_SEED=YES to explicitly allow this demo Atlas repair.");
  }
  // Declare rawUri for use by the surrounding module or function.
  const rawUri = String(process.env.MONGODB_URI || "");
  // Check the condition (!rawUri) and run the matching branch.
  if (!rawUri) throw new Error("MONGODB_URI is required.");
  // Declare target for use by the surrounding module or function.
  const target = new URL(rawUri);
  // Declare database for use by the surrounding module or function.
  const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");
  // Check the condition (target.hostname.toLowerCase() !== EXPECTED_HOST || database !== EXPECT) and run the matching branch.
  if (target.hostname.toLowerCase() !== EXPECTED_HOST || database !== EXPECTED_DATABASE) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(`Refusing to write outside ${EXPECTED_DATABASE} on the approved demo Atlas cluster.`);
  }
  // Check the condition (String(process.env.NODE_ENV || "").toLowerCase() === "production") and run the matching branch.
  if (String(process.env.NODE_ENV || "").toLowerCase() === "production") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Refusing to run this demo-content repair with NODE_ENV=production.");
  }
}

// Define tourTitle; its parameters and body implement this operation.
function tourTitle(tour, destination, tenantName, index) {
  // Declare existing for use by the surrounding module or function.
  const existing = String(tour.title || "");
  // Declare match for use by the surrounding module or function.
  const match = existing.match(/^\s*TEST\s+(.+?)\s+-\s+.+$/i);
  // Check the condition (match?.[1]) and run the matching branch.
  if (match?.[1]) return cleanName(match[1]);
  // Check the condition (!/^\s*TEST\b/i.test(existing) && !/^test-/i.test(String(tour.slug || ") and run the matching branch.
  if (!/^\s*TEST\b/i.test(existing) && !/^test-/i.test(String(tour.slug || ""))) return existing;
  // Return the expression shown below to the caller.
  return `${destination || "Kenya"} Safari Experience ${String(index + 1).padStart(2, "0")}`;
}

// Define main; its parameters and body implement this operation.
async function main() {
  // Perform the side effect or state update expressed on the following line.
  assertSafeTarget();
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  // Declare db for use by the surrounding module or function.
  const db = mongoose.connection.db;
  // Declare tenants for use by the surrounding module or function.
  const tenants = await db.collection("organizations")
    .find({ slug: { $in: TARGET_TENANTS.map((tenant) => tenant.slug) } }, { projection: { _id: 1, slug: 1, settings: 1 } })
    .toArray();
  // Check the condition (tenants.length !== TARGET_TENANTS.length) and run the matching branch.
  if (tenants.length !== TARGET_TENANTS.length) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Expected Amani Trails and Demo Safari tenant records. No repair was started.");
  }

  // Declare plans for use by the surrounding module or function.
  const plans = [];
  // Repeat the enclosed work for each required iteration.
  for (const spec of TARGET_TENANTS) {
    // Declare tenant for use by the surrounding module or function.
    const tenant = tenants.find((row) => row.slug === spec.slug);
    // Declare scope for use by the surrounding module or function.
    const scope = { tenantId: tenant._id };
    // Declare [destinations, tours, packages, categories, slides, galleries] for use by the surrounding module or function.
    const [destinations, tours, packages, categories, slides, galleries] = await Promise.all([
      db.collection("destinations").find(scope).toArray(),
      db.collection("tours").find({ ...scope, isDeleted: { $ne: true } }).toArray(),
      db.collection("tourpackages").find(scope).toArray(),
      db.collection("tourcategories").find(scope).toArray(),
      db.collection("heroslides").find(scope).toArray(),
      db.collection("galleries").find(scope).toArray(),
    ]);

    // Include already-cleaned canonical destinations so reruns remain safe and useful.
    // Declare destinationRepairs for use by the surrounding module or function.
    const destinationRepairs = destinations
      .filter((row) => DESTINATION_NAMES.has(cleanName(row.name)) || isSynthetic(row) || /^test-/i.test(String(row.slug || "")))
      .map((row) => {
        // Declare name for use by the surrounding module or function.
        const name = cleanName(row.name);
        // Check the condition (!DESTINATION_NAMES.has(name)) and run the matching branch.
        if (!DESTINATION_NAMES.has(name)) throw new Error(`Unknown synthetic destination in ${spec.slug}: ${row.name}. No records were changed.`);
        // Return the object assembled below to the caller.
        return { row, name, slug: `${spec.slug}-${slugify(name)}` };
      });
    // Declare destinationById for use by the surrounding module or function.
    const destinationById = new Map(destinations.map((row) => [String(row._id), row]));
    // Declare tourRepairs for use by the surrounding module or function.
    const tourRepairs = tours
      .filter((row) => isSynthetic(row) || /^test-/i.test(String(row.slug || "")))
      .map((row, index) => {
        // Declare destination for use by the surrounding module or function.
        const destination = destinationById.get(String(row.destination));
        // Declare destinationName for use by the surrounding module or function.
        const destinationName = cleanName(destination?.name) || String(row.location || "Kenya");
        // Return the object assembled below to the caller.
        return {
          row,
          title: tourTitle(row, destinationName, spec.name, index),
          destinationName,
          slug: `${spec.slug}-${slugify(tourTitle(row, destinationName, spec.name, index))}-${index + 1}`,
        };
      });
    // Declare packageRepairs for use by the surrounding module or function.
    const packageRepairs = packages
      .filter((row) => isSynthetic(row) || /^test-/i.test(String(row.slug || "")))
      .map((row, index) => {
        // Declare destination for use by the surrounding module or function.
        const destination = cleanName(row.destination);
        // Declare title for use by the surrounding module or function.
        const title = spec.packageTitles[index % spec.packageTitles.length];
        // Return the object assembled below to the caller.
        return { row, title, destination: DESTINATION_NAMES.has(destination) ? destination : ["Maasai Mara", "Amboseli", "Diani"][index % 3], slug: `${spec.slug}-${slugify(title)}-${index + 1}` };
      });
    // Declare categoryRepairs for use by the surrounding module or function.
    const categoryRepairs = categories.filter((row) => isSynthetic(row) || /^test-/i.test(String(row.slug || "")));
    // Declare slideRepairs for use by the surrounding module or function.
    const slideRepairs = slides.filter((row) => isSynthetic(row) || /^\s*TEST\b/i.test(String(row.title || "")));
    // Declare galleryRepairs for use by the surrounding module or function.
    const galleryRepairs = galleries.filter((row) => isSynthetic(row) || /^\s*TEST\b/i.test(String(row.title || "")));

    // Check the condition (destinationRepairs.length < 6) and run the matching branch.
    if (destinationRepairs.length < 6) throw new Error(`Expected at least six recognized Kenya destinations for ${spec.slug}; found ${destinationRepairs.length}. No records were changed.`);
    // Tours, packages, and slides may already have been cleaned by an earlier run.
    // Existing records are reconciled below even when their old TEST markers are gone.
    // Check the condition (!tours.length || !packages.length || !slides.length) and run the matching branch.
    if (!tours.length || !packages.length || !slides.length) {
      // Stop the current operation by raising a new Error instance.
      throw new Error(`Expected existing tours, packages, and homepage slide for ${spec.slug}. No records were changed.`);
    }

    // Preflight unique slugs before any writes. The repair is scoped to the two
    // demo tenants and refuses to overwrite any existing non-synthetic record.
    // Repeat the enclosed work for each required iteration.
    for (const item of destinationRepairs) {
      // Declare collision for use by the surrounding module or function.
      const collision = destinations.find((row) => String(row._id) !== String(item.row._id) && row.slug === item.slug);
      // Check the condition (collision) and run the matching branch.
      if (collision) throw new Error(`Destination slug collision in ${spec.slug}: ${item.slug}. No records were changed.`);
    }
    // Declare allTours for use by the surrounding module or function.
    const allTours = await db.collection("tours").find({}, { projection: { _id: 1, slug: 1 } }).toArray();
    // Repeat the enclosed work for each required iteration.
    for (const item of tourRepairs) {
      // Declare collision for use by the surrounding module or function.
      const collision = allTours.find((row) => String(row._id) !== String(item.row._id) && row.slug === item.slug);
      // Check the condition (collision) and run the matching branch.
      if (collision) throw new Error(`Tour slug collision: ${item.slug}. No records were changed.`);
    }
    // Declare allPackages for use by the surrounding module or function.
    const allPackages = await db.collection("tourpackages").find({}, { projection: { _id: 1, slug: 1 } }).toArray();
    // Repeat the enclosed work for each required iteration.
    for (const item of packageRepairs) {
      // Declare collision for use by the surrounding module or function.
      const collision = allPackages.find((row) => String(row._id) !== String(item.row._id) && row.slug === item.slug);
      // Check the condition (collision) and run the matching branch.
      if (collision) throw new Error(`Package slug collision: ${item.slug}. No records were changed.`);
    }
    // Perform the side effect or state update expressed on the following line.
    plans.push({ spec, tenant, scope, destinationRepairs, tourRepairs, packageRepairs, categoryRepairs, slideRepairs, slides, galleryRepairs, galleries });
  }

  // Declare report for use by the surrounding module or function.
  const report = [];
  // Repeat the enclosed work for each required iteration.
  for (const plan of plans) {
    // Declare { spec, tenant, scope } for use by the surrounding module or function.
    const { spec, tenant, scope } = plan;
    // Repeat the enclosed work for each required iteration.
    for (const item of plan.destinationRepairs) {
      // Perform the side effect or state update expressed on the following line.
      await db.collection("destinations").updateOne({ _id: item.row._id, ...scope }, { $set: {
        name: item.name,
        slug: item.slug,
        description: `${item.name} is one of Kenya's memorable destinations, offering distinctive landscapes, wildlife and locally guided experiences.`,
        featuredImage: DESTINATION_IMAGE_PATHS[item.name] || "/demo-destinations/kenya-landscape-01.svg",
        images: [{ url: DESTINATION_IMAGE_PATHS[item.name] || "/demo-destinations/kenya-landscape-01.svg", publicId: "" }],
        shortDescription: `Explore ${item.name} with a locally planned Kenya journey.`,
        status: "active",
        active: true,
        featured: true,
        isDeleted: false,
      } });
    }

    // Repeat the enclosed work for each required iteration.
    for (const [index, item] of plan.tourRepairs.entries()) {
      // Declare cleanTitle for use by the surrounding module or function.
      const cleanTitle = item.title.replace(/\s+/g, " ").trim();
      // Perform the side effect or state update expressed on the following line.
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
    // Declare canonicalDestinations for use by the surrounding module or function.
    const canonicalDestinations = plan.destinationRepairs.map(({ row, name }) => ({
      row,
      name: cleanName(name || row.name),
    }));
    // Declare destinationDescriptions for use by the surrounding module or function.
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
    // Repeat the enclosed work for each required iteration.
    for (const entry of canonicalDestinations) {
      // Declare description for use by the surrounding module or function.
      const description = destinationDescriptions[entry.name];
      // Check the condition (!description) and run the matching branch.
      if (!description) continue;
      // Perform the side effect or state update expressed on the following line.
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
    // Declare destinationForTourTitle for use by the surrounding module or function.
    const destinationForTourTitle = (title) => {
      // Declare normalized for use by the surrounding module or function.
      const normalized = String(title || "").toLowerCase();
      // Declare expected for use by the surrounding module or function.
      let expected;
      // Check the condition (/maasai\s+mara/.test(normalized)) and run the matching branch.
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
      // Return the expression shown below to the caller.
      return canonicalDestinations.find((entry) => entry.name.toLowerCase() === expected.toLowerCase()) || null;
    };
    // Declare allTenantTours for use by the surrounding module or function.
    const allTenantTours = await db.collection("tours").find({ ...scope, isDeleted: { $ne: true } }).toArray();
    // Repeat the enclosed work for each required iteration.
    for (const [tourIndex, tour] of allTenantTours.entries()) {
      // Declare destinationEntry for use by the surrounding module or function.
      const destinationEntry = destinationForTourTitle(tour.title);
      // Check the condition (!destinationEntry) and run the matching branch.
      if (!destinationEntry) continue;
      // Declare destinationName for use by the surrounding module or function.
      const destinationName = destinationEntry.name;
      // Declare descriptions for use by the surrounding module or function.
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
      // Perform the side effect or state update expressed on the following line.
      await db.collection("tours").updateOne({ _id: tour._id, ...scope }, { $set: {
        destination: destinationEntry.row._id,
        location: destinationName,
        country: "Kenya",
        description: descriptions[destinationName] || `Explore ${destinationName} with a locally planned Kenya journey and guided experiences.`,
        shortDescription: `Discover ${destinationName} with local travel support.`,
        featuredImage: { url: TOUR_IMAGE_PATHS[tourIndex % TOUR_IMAGE_PATHS.length], publicId: "" },
        gallery: [{ url: TOUR_IMAGE_PATHS[(tourIndex + 1) % TOUR_IMAGE_PATHS.length], publicId: "" }],
      } });
    }

    // Ensure every tour has local image media, including titles without a recognized destination keyword.
    // Declare toursWithoutMappedDestination for use by the surrounding module or function.
    const toursWithoutMappedDestination = allTenantTours.filter((tour) => !destinationForTourTitle(tour.title));
    // Repeat the enclosed work for each required iteration.
    for (const [index, tour] of toursWithoutMappedDestination.entries()) {
      // Declare imageIndex for use by the surrounding module or function.
      const imageIndex = (index + allTenantTours.length) % TOUR_IMAGE_PATHS.length;
      // Perform the side effect or state update expressed on the following line.
      await db.collection("tours").updateOne({ _id: tour._id, ...scope }, { $set: {
        featuredImage: { url: TOUR_IMAGE_PATHS[imageIndex], publicId: "" },
        gallery: [{ url: TOUR_IMAGE_PATHS[(imageIndex + 1) % TOUR_IMAGE_PATHS.length], publicId: "" }],
      } });
    }

    // Declare syntheticAdminUsers for use by the surrounding module or function.
    const syntheticAdminUsers = await db.collection("users").find({
      ...scope,
      role: { $in: ["admin", "administrator"] },
      name: { $regex: "TEST|DEMO", $options: "i" },
    }).toArray();
    // Repeat the enclosed work for each required iteration.
    for (const admin of syntheticAdminUsers) {
      // Declare cleanAdminName for use by the surrounding module or function.
      const cleanAdminName = spec.slug === "demo-safari" ? "Demo Safari Administrator" : "Amani Trails Administrator";
      // Perform the side effect or state update expressed on the following line.
      await db.collection("users").updateOne({ _id: admin._id, ...scope }, { $set: { name: cleanAdminName } });
    }

    // Repeat the enclosed work for each required iteration.
    for (const [index, item] of plan.packageRepairs.entries()) {
      // Perform the side effect or state update expressed on the following line.
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

    // Repeat the enclosed work for each required iteration.
    for (const item of plan.categoryRepairs) {
      // Perform the side effect or state update expressed on the following line.
      await db.collection("tourcategories").updateOne({ _id: item._id, ...scope }, { $set: {
        name: "Kenya Safaris",
        slug: `${spec.slug}-kenya-safaris`,
        description: `Wildlife, landscapes and guided adventures with ${spec.name}.`,
        active: true,
      } });
    }

    // Repeat the enclosed work for each required iteration.
    for (const [index, item] of plan.slides.entries()) {
      // Declare slideUpdate for use by the surrounding module or function.
      const slideUpdate = {
        image: { url: HERO_IMAGE_PATHS[index % HERO_IMAGE_PATHS.length], publicId: "" },
        active: true,
        order: index,
      };
      // Check the condition (isSynthetic(item) || /^\s*TEST\b/i.test(String(item.title || ""))) and run the matching branch.
      if (isSynthetic(item) || /^\s*TEST\b/i.test(String(item.title || ""))) {
        // Perform the side effect or state update expressed on the following line.
        Object.assign(slideUpdate, {
          title: spec.tagline,
          subtitle: spec.description,
          badge: "KENYA SAFARIS • BEACH • ADVENTURE",
          "buttonOne.text": "Explore Tours",
          "buttonOne.link": "/tours",
          "buttonTwo.text": "Plan Your Trip",
          "buttonTwo.link": "/contact",
        });
      }
      // Perform the side effect or state update expressed on the following line.
      await db.collection("heroslides").updateOne({ _id: item._id, ...scope }, { $set: slideUpdate });
    }

    // Declare allTenantPackages for use by the surrounding module or function.
    const allTenantPackages = await db.collection("tourpackages").find(scope).toArray();
    // Repeat the enclosed work for each required iteration.
    for (const [index, item] of allTenantPackages.entries()) {
      // Perform the side effect or state update expressed on the following line.
      await db.collection("tourpackages").updateOne({ _id: item._id, ...scope }, { $set: {
        coverImage: { url: GALLERY_IMAGE_PATHS[index % GALLERY_IMAGE_PATHS.length], publicId: "" },
        gallery: [{ url: GALLERY_IMAGE_PATHS[(index + 1) % GALLERY_IMAGE_PATHS.length], publicId: "" }],
      } });
    }

    // Repeat the enclosed work for each required iteration.
    for (const [index, item] of plan.galleries.entries()) {
      // Declare galleryUpdate for use by the surrounding module or function.
      const galleryUpdate = {
        image: { url: GALLERY_IMAGE_PATHS[index % GALLERY_IMAGE_PATHS.length], publicId: "" },
        active: true,
      };
      // Check the condition (isSynthetic(item) || /^\s*TEST\b/i.test(String(item.title || ""))) and run the matching branch.
      if (isSynthetic(item) || /^\s*TEST\b/i.test(String(item.title || ""))) {
        // Perform the side effect or state update expressed on the following line.
        galleryUpdate.title = `${spec.name} Safari Gallery ${index + 1}`;
        // Perform the side effect or state update expressed on the following line.
        galleryUpdate.category = "Safari";
      }
      // Perform the side effect or state update expressed on the following line.
      await db.collection("galleries").updateOne({ _id: item._id, ...scope }, { $set: galleryUpdate });
    }

    // Perform the side effect or state update expressed on the following line.
    await db.collection("organizations").updateOne({ _id: tenant._id, slug: spec.slug }, { $set: {
      "settings.publicBranding.displayName": spec.name,
      "settings.publicBranding.description": spec.description,
    } });

    // Declare [publishedDestinations, featuredTours, publishedPackages, activeSlides] for use by the surrounding module or function.
    const [publishedDestinations, featuredTours, publishedPackages, activeSlides] = await Promise.all([
      db.collection("destinations").countDocuments({ ...scope, status: "active", active: true, featured: true, isDeleted: { $ne: true } }),
      db.collection("tours").countDocuments({ ...scope, published: true, featured: true, available: true, isDeleted: { $ne: true }, status: { $in: ["scheduled", "upcoming", "ongoing"] } }),
      db.collection("tourpackages").countDocuments({ ...scope, published: true, status: "active" }),
      db.collection("heroslides").countDocuments({ ...scope, active: true }),
    ]);
    // Check the condition (!publishedDestinations || !featuredTours || !publishedPackages || !act) and run the matching branch.
    if (!publishedDestinations || !featuredTours || !publishedPackages || !activeSlides) {
      // Stop the current operation by raising a new Error instance.
      throw new Error(`Post-repair public homepage validation failed for ${spec.slug}.`);
    }
    // Perform the side effect or state update expressed on the following line.
    report.push({
      tenant: spec.slug,
      destinationsRepaired: plan.destinationRepairs.length,
      toursRepaired: plan.tourRepairs.length,
      packagesRepaired: plan.packageRepairs.length,
      categoriesRepaired: plan.categoryRepairs.length,
      slidesRepaired: plan.slides.length,
      galleriesRepaired: plan.galleries.length,
      publishedFeaturedDestinations: publishedDestinations,
      publishedFeaturedTours: featuredTours,
      publishedPackages,
      activeSlides,
    });
  }

  // Perform the side effect or state update expressed on the following line.
  console.log(JSON.stringify({ success: true, database: mongoose.connection.name, repairedTenants: report }, null, 2));
}

// Perform the side effect or state update expressed on the following line.
main().catch((error) => {
  // Perform the side effect or state update expressed on the following line.
  console.error(`Tenant homepage repair failed: ${String(error.message || error).replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, "[MongoDB URI redacted]")}`);
  // Perform the side effect or state update expressed on the following line.
  process.exitCode = 1;
}).finally(() => mongoose.disconnect().catch(() => {}));
