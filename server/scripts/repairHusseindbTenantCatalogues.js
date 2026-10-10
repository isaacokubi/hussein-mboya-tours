import "dotenv/config";
import mongoose from "mongoose";
import { pathToFileURL } from "node:url";

export const EXPECTED_HOST = "cluster0.cdtxzts.mongodb.net";
export const EXPECTED_DATABASE = "husseindb";

export const TENANTS = [
  {
    slug: "hussein-mboya",
    name: "Hussein Mboya Tours",
    destinations: [
      ["Maasai Mara Conservancy", "The Maasai Mara is known for open savannah, big-cat sightings and seasonal wildebeest migration.", ["Guided game drives", "Wildlife photography", "Maasai cultural visits"]],
      ["Amboseli Kilimanjaro Plains", "Explore elephant herds across open plains with views toward Mount Kilimanjaro on clear days.", ["Elephant tracking", "Sunrise drives", "Landscape photography"]],
      ["Tsavo East Wilderness", "Discover broad red-earth plains, baobab trees and diverse wildlife in Tsavo East.", ["Wildlife viewing", "Bird watching", "Guided nature drives"]],
      ["Tsavo West Springs", "Visit volcanic scenery, rugged hills and the clear waters of Mzima Springs.", ["Mzima Springs", "Nature walks", "Wildlife drives"]],
      ["Naivasha Rift Valley", "Enjoy a freshwater Rift Valley lake, rich birdlife and nearby escarpment scenery.", ["Boat excursions", "Bird watching", "Crescent Island walks"]],
      ["Nakuru Flamingo Lakes", "Explore a Rift Valley landscape celebrated for birdlife, rhinos and scenic viewpoints.", ["Bird watching", "Rhino viewing", "Scenic drives"]],
      ["Samburu Northern Frontier", "Experience northern Kenya's dry-country landscapes and distinctive wildlife.", ["Samburu wildlife", "Cultural visits", "River walks"]],
      ["Mount Kenya Highlands", "Discover cool highland forests, mountain views and trekking routes around Mount Kenya.", ["Forest hikes", "Mountain viewpoints", "Nature photography"]],
      ["Watamu Marine Coast", "Enjoy the Indian Ocean coast, white-sand beaches and coral reef conservation areas.", ["Snorkelling", "Glass-bottom boat", "Beach relaxation"]],
      ["Diani Coral Shores", "Relax on Diani's white-sand beaches with access to water sports and coastal excursions.", ["Beach activities", "Kitesurfing", "Coastal excursions"]],
      ["Lamu Old Town Coast", "Explore Swahili architecture, historic lanes, dhow culture and island life in Lamu.", ["Old Town walks", "Dhow sailing", "Swahili cuisine"]],
      ["Nairobi Urban Wildlife", "See wildlife on the capital's doorstep and combine a game drive with city experiences.", ["Game drives", "City excursions", "Nature photography"]]
    ],
    tours: [
      "Mara Big Five Expedition", "Amboseli Elephant and Kilimanjaro Safari", "Tsavo East Family Wildlife Drive",
      "Tsavo West Springs and Lava Trail", "Naivasha Boat and Rift Valley Escape", "Nakuru Rhino and Birding Tour",
      "Samburu Northern Frontier Safari", "Mount Kenya Foothills Trek", "Watamu Marine Discovery",
      "Diani Private Beach Escape", "Lamu Swahili Heritage Journey", "Nairobi Dawn Game Drive"
    ],
    priceBase: 48000
  },
  {
    slug: "amani-trails",
    name: "Amani Trails Safaris",
    destinations: [
      ["Mara River Migration Camp", "Follow migration country around the Mara River, with seasonal wildlife movement and guided camp experiences.", ["Migration viewing", "River game drives", "Campfire evenings"]],
      ["Amboseli Elephant Corridor", "Explore elephant routes, acacia country and open views toward Kilimanjaro.", ["Elephant tracking", "Photography", "Guided game drives"]],
      ["Tsavo Red-Earth Trails", "Travel across Tsavo's red-earth country with wildlife stops and baobab-lined scenery.", ["Red-earth safari", "Wildlife drives", "Birding"]],
      ["Chyulu Hills Explorer", "Discover rolling green hills, volcanic formations and broad views across southern Kenya.", ["Guided hikes", "Cave visits", "Scenic viewpoints"]],
      ["Naivasha Crescent Island", "Experience lake-edge walking routes, birdlife and boat access around Crescent Island.", ["Boat rides", "Guided walking", "Bird watching"]],
      ["Nakuru Rhino Sanctuary", "Explore protected rhino habitat and varied birdlife in the Rift Valley.", ["Rhino viewing", "Birding", "Rift Valley viewpoints"]],
      ["Samburu Ewaso Nyiro", "Discover wildlife and cultural experiences around the Ewaso Nyiro river country.", ["River wildlife", "Cultural visits", "Nature drives"]],
      ["Aberdare Forest Escape", "Enjoy misty highland forests, waterfalls and cool mountain air in the Aberdares.", ["Forest walks", "Waterfall visits", "Bird watching"]],
      ["Kilifi Creek Retreat", "Slow down by Kilifi Creek with mangrove scenery and coastal village experiences.", ["Creek excursions", "Kayaking", "Coastal culture"]],
      ["Shimba Hills Coast", "Combine forest reserve scenery, rolling hills and nearby Indian Ocean experiences.", ["Forest walks", "Wildlife viewing", "Coastal day trips"]],
      ["Lamu Cultural Islands", "Discover island heritage, traditional dhow travel and Swahili coastal life.", ["Heritage walks", "Dhow trips", "Local cuisine"]],
      ["Ol Pejeta Conservancy", "Visit a conservancy known for rhino protection, open plains and conservation learning.", ["Conservation visits", "Wildlife drives", "Guided learning"]]
    ],
    tours: [
      "Mara Great Migration Signature", "Amboseli Elephant Tracking Journey", "Tsavo Red-Earth Safari Circuit",
      "Chyulu Hills Guided Walking Safari", "Naivasha Boat and Crescent Island", "Nakuru Rhino Conservation Tour",
      "Samburu River and Culture Circuit", "Aberdare Waterfall Trek", "Kilifi Creek Slow Travel Escape",
      "Shimba Hills Forest and Coast", "Lamu Island Heritage by Dhow", "Ol Pejeta Rhino Conservation Experience"
    ],
    priceBase: 62000
  },
  {
    slug: "demo-safari",
    name: "Demo Safari Adventures",
    destinations: [
      ["Mombasa Heritage Quarter", "Explore Mombasa's historic Swahili streets, waterfront landmarks and coastal food culture.", ["Old Town walk", "Fort Jesus visit", "Swahili food tour"]],
      ["Taita Hills Sanctuary", "Discover green hills, wildlife habitat and viewpoints across the Taita highlands.", ["Wildlife drives", "Highland walks", "Birding"]],
      ["Galana River Safari", "Follow riverine habitats and open country with opportunities for wildlife observation.", ["River wildlife", "Game drives", "Photography"]],
      ["Mzima Springs Discovery", "Visit clear spring pools and shaded trails in a striking volcanic landscape.", ["Spring trails", "Nature walks", "Wildlife viewing"]],
      ["Hell's Gate Adventure Park", "Explore dramatic cliffs, geothermal scenery and cycling routes in the Rift Valley.", ["Cycling", "Hiking", "Geothermal viewpoints"]],
      ["Elementaita Bird Haven", "Enjoy lake views and bird habitats in a quieter section of the Great Rift Valley.", ["Bird watching", "Lake viewpoints", "Nature photography"]],
      ["Meru Wilderness Reserve", "Experience varied habitats, remote wildlife routes and the wild landscapes of Meru.", ["Guided game drives", "Birding", "Wilderness viewing"]],
      ["Thomson Falls Highlands", "Visit a dramatic waterfall surrounded by cool highland scenery and local viewpoints.", ["Waterfall visit", "Highland walks", "Photography"]],
      ["Malindi Marine Park", "Discover marine life, coral gardens and clear coastal waters around Malindi.", ["Snorkelling", "Boat excursions", "Marine education"]],
      ["Kisite Mpunguti Reef", "Explore offshore reef scenery and marine wildlife along Kenya's southern coast.", ["Reef snorkelling", "Boat trips", "Marine wildlife"]],
      ["Pate Island Heritage", "Learn about island settlements, Swahili history and the quieter northern coast.", ["Heritage visits", "Coastal walks", "Dhow culture"]],
      ["Karura Forest Escape", "Enjoy forest trails, streams and green spaces on the edge of Nairobi.", ["Forest walks", "Cycling", "Bird watching"]]
    ],
    tours: [
      "Mombasa Swahili City Discovery", "Taita Hills Evening Wildlife Safari", "Galana River Wildlife Trail",
      "Mzima Springs Nature Excursion", "Hell's Gate Cycling Adventure", "Elementaita Birding Break",
      "Meru Untamed Wilderness Safari", "Thomson Falls Highland Day Trip", "Malindi Coral Reef Getaway",
      "Kisite Marine Snorkelling Cruise", "Pate Island Heritage Journey", "Karura Forest Nature Escape"
    ],
    priceBase: 35000
  }
];

export function slugify(value) {
  return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function isSyntheticSeedRecord(record) {
  return /^\s*TEST\b/i.test(String(record?.title || record?.name || ""))
    || /^test-/i.test(String(record?.slug || ""))
    || /TEST\/DEMO|synthetic sample|synthetic demo/i.test(String(record?.description || ""));
}

export function assertSafeTarget(rawUri, env = process.env) {
  if (env.CONFIRM_HUSSEINDB_CATALOGUE_REPAIR !== "YES") {
    throw new Error("Set CONFIRM_HUSSEINDB_CATALOGUE_REPAIR=YES to confirm this targeted production catalogue repair.");
  }
  if (!rawUri) throw new Error("MONGODB_URI is required.");
  const target = new URL(rawUri);
  const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");
  if (target.hostname.toLowerCase() !== EXPECTED_HOST || database !== EXPECTED_DATABASE) {
    throw new Error(`Refusing to write outside ${EXPECTED_DATABASE} on the approved Atlas cluster.`);
  }
  if (String(env.NODE_ENV || "").toLowerCase() === "production") {
    throw new Error("Run the reviewed repair manually in an explicitly controlled maintenance session, not with NODE_ENV=production.");
  }
  return { host: target.hostname.toLowerCase(), database };
}

function stableRecords(records, label, tenantSlug, minCount = 8) {
  const sorted = [...records].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    || String(a._id).localeCompare(String(b._id)));
  if (sorted.length < minCount) throw new Error(`Expected at least ${minCount} ${label} for ${tenantSlug}; found ${sorted.length}. No records were changed.`);
  return sorted;
}

export function buildCatalogueItinerary({ tenantSlug, tourTitle, destinationName, destinationDescription, activities = [], durationDays = 3 }) {
  const days = Math.max(1, Math.min(14, Math.floor(Number(durationDays) || 3)));
  const cleanTitle = String(tourTitle || "Kenya journey").trim();
  const destination = String(destinationName || "the destination").trim();
  const activityList = activities.filter((value) => typeof value === "string" && value.trim());
  const brand = tenantSlug === "amani-trails" ? "Amani Trails" : tenantSlug === "demo-safari" ? "Demo Safari" : "Hussein Mboya Tours";
  if (days === 1) return [{
    day: 1,
    title: `Guided ${destination} experience`,
    description: `${brand}: enjoy ${cleanTitle} with a local guide. The final order of activities depends on access, weather and operating conditions.`,
    activities: activityList.length ? activityList : [`Explore ${destination}`, "Guided interpretation and photo stops"],
    meals: ["As confirmed before departure"],
    accommodation: "",
  }];
  return Array.from({ length: days }, (_, index) => {
    const first = index === 0;
    const last = index === days - 1;
    const dayActivities = first
      ? ["Meet your guide and confirm the route", "Safety and trip briefing", `Transfer toward ${destination}`]
      : last
        ? ["Final morning activity, if time allows", "Check-out and departure preparation", "Return transfer or onward connection"]
        : (activityList.length ? activityList : [`Explore ${destination}`, "Guided nature, wildlife or cultural experience", "Scenic stops and photography"]).slice(0, 4);
    const title = first
      ? `Arrival and introduction to ${destination}`
      : last
        ? "Final experience and return journey"
        : days === 2
          ? `Discover ${destination}`
          : `Day ${index + 1}: ${destination} guided experience`;
    const description = first
      ? `Meet the ${brand} team for the ${cleanTitle}. Review the route and practical arrangements before travelling to ${destination}. Accommodation and inclusions follow the confirmed booking.`
      : last
        ? "Enjoy a final activity where timing allows, then prepare for departure and travel to the agreed drop-off point."
        : `${destinationDescription || `Discover ${destination} with a local guide.`} Activities may be adjusted for weather, wildlife movement, access rules and local operating conditions.`;
    return {
      day: index + 1,
      title,
      description,
      activities: dayActivities,
      meals: first ? ["Lunch", "Dinner"] : last ? ["Breakfast"] : ["Breakfast", "Lunch", "Dinner"],
      accommodation: last ? "" : "Accommodation as confirmed in the booking",
    };
  });
}

export function buildRepairPlan(tenantSpec, tenant, destinations, tours) {
  const sortedDestinations = stableRecords(destinations, "destinations", tenantSpec.slug, 12);
  if (sortedDestinations.length !== 12) throw new Error(`Expected exactly 12 seeded destinations for ${tenantSpec.slug}; found ${sortedDestinations.length}. No records were changed.`);
  const sortedTours = stableRecords(tours, "tours", tenantSpec.slug, 8);
  if (sortedTours.length > tenantSpec.tours.length) throw new Error(`Found more tour records than the approved catalogue can map for ${tenantSpec.slug}; no records were changed.`);
  return {
    tenant,
    destinations: sortedDestinations.map((row, index) => ({ row, spec: tenantSpec.destinations[index] })),
    tours: sortedTours.map((row, index) => ({
      row,
      title: tenantSpec.tours[index],
      destinationIndex: index % sortedDestinations.length,
      price: tenantSpec.priceBase + index * 3500,
      agentPrice: tenantSpec.priceBase + index * 3000,
    }))
  };
}

async function main() {
  assertSafeTarget(process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000, appName: "husseindb-tenant-catalogue-repair" });
  const db = mongoose.connection.db;
  const orgs = await db.collection("organizations").find(
    { slug: { $in: TENANTS.map((tenant) => tenant.slug) } },
    { projection: { _id: 1, slug: 1, name: 1 } }
  ).toArray();
  if (orgs.length !== TENANTS.length) throw new Error("Expected all three known tenants. No records were changed.");

  const plans = [];
  for (const spec of TENANTS) {
    const org = orgs.find((item) => item.slug === spec.slug);
    const scope = { tenantId: org._id };
    const [destinations, tours] = await Promise.all([
      db.collection("destinations").find(scope).toArray(),
      db.collection("tours").find({ ...scope, isDeleted: { $ne: true } }).toArray()
    ]);
    plans.push({ spec, ...buildRepairPlan(spec, org, destinations, tours) });
  }

  const slugOwners = new Map();
  for (const plan of plans) {
    for (const [index, item] of plan.destinations.entries()) {
      const slug = `${plan.spec.slug}-${slugify(item.spec[0])}`;
      if (slugOwners.has(slug)) throw new Error(`Destination slug collision: ${slug}. No records were changed.`);
      slugOwners.set(slug, { kind: "destination", tenant: plan.spec.slug, index });
    }
    for (const item of plan.tours) {
      const slug = `${plan.spec.slug}-${slugify(item.title)}`;
      if (slugOwners.has(slug)) throw new Error(`Catalogue slug collision: ${slug}. No records were changed.`);
      slugOwners.set(slug, { kind: "tour", tenant: plan.spec.slug });
    }
  }

  const summary = plans.map((plan) => ({
    tenant: plan.spec.slug,
    destinationCount: plan.destinations.length,
    tourCount: plan.tours.length,
    destinationNames: plan.destinations.map(({ spec }) => spec[0]),
    tourTitles: plan.tours.map(({ title }) => title),
    priceRangeKES: plan.tours.length ? [
      Math.min(...plan.tours.map((item) => item.price)),
      Math.max(...plan.tours.map((item) => item.price))
    ] : []
  }));
  console.log(JSON.stringify({ mode: process.env.APPLY_HUSSEINDB_CATALOGUE_REPAIR === "YES" ? "APPLY" : "DRY_RUN", database: EXPECTED_DATABASE, summary }, null, 2));

  if (process.env.APPLY_HUSSEINDB_CATALOGUE_REPAIR !== "YES") {
    console.log("Dry run only: no database records were modified. Set APPLY_HUSSEINDB_CATALOGUE_REPAIR=YES after reviewing the plan.");
    return;
  }

  // All tenant/catalogue checks complete before the first write. Existing IDs remain
  // unchanged so bookings, reviews and payments retain their references.
  for (const plan of plans) {
    const scope = { tenantId: plan.tenant._id };
    for (const [index, item] of plan.destinations.entries()) {
      const [name, description, activities] = item.spec;
      const slug = `${plan.spec.slug}-${slugify(name)}`;
      await db.collection("destinations").updateOne({ _id: item.row._id, ...scope }, { $set: {
        name,
        slug,
        description,
        shortDescription: `${plan.spec.name} destination: ${name}`,
        region: plan.spec.slug === "hussein-mboya" ? "Nairobi" : plan.spec.slug === "amani-trails" ? "Narok" : "Mombasa",
        city: plan.spec.slug === "hussein-mboya" ? "Nairobi" : plan.spec.slug === "amani-trails" ? "Narok" : "Mombasa",
        attractions: [name, ...activities],
        activities,
        active: true,
        status: "active",
        isDeleted: false
      } });
    }
    for (const item of plan.tours) {
      const destination = plan.destinations[item.destinationIndex];
      const destinationName = destination.spec[0];
      await db.collection("tours").updateOne({ _id: item.row._id, ...scope }, { $set: {
        title: item.title,
        slug: `${plan.spec.slug}-${slugify(item.title)}`,
        description: `${plan.spec.name}: a guided journey to ${destinationName}. ${destination.spec[1]}`,
        shortDescription: `${plan.spec.name}: ${item.title}`,
        destination: destination.row._id,
        country: "Kenya",
        location: destinationName,
        category: "Safari",
        tags: [plan.spec.name, destinationName, "Kenya"],
        price: item.price,
        agentPrice: item.agentPrice,
        discount: 0,
        discountPrice: null,
        highlights: [`Explore ${destinationName}`, ...destination.spec[2]],
        itinerary: buildCatalogueItinerary({
          tenantSlug: plan.spec.slug,
          tourTitle: item.title,
          destinationName,
          destinationDescription: destination.spec[1],
          activities: destination.spec[2],
          durationDays: item.row.durationDays || item.row.durationDetails?.days || item.row.duration || 3,
        }),
        published: true,
        available: true,
        isDeleted: false
      } });
    }
  }

  const verification = [];
  for (const plan of plans) {
    const scope = { tenantId: plan.tenant._id };
    const [destinations, tours] = await Promise.all([
      db.collection("destinations").find(scope).toArray(),
      db.collection("tours").find({ ...scope, isDeleted: { $ne: true } }).toArray()
    ]);
    const expectedNames = new Set(plan.destinations.map(({ spec }) => spec[0]));
    const expectedTitles = new Set(plan.tours.map(({ title }) => title));
    const ownedDestinationIds = new Set(destinations.map((item) => String(item._id)));
    const invalidTours = tours.filter((tour) => !ownedDestinationIds.has(String(tour.destination)));
    const missingNames = [...expectedNames].filter((name) => !destinations.some((item) => item.name === name));
    const missingTitles = [...expectedTitles].filter((title) => !tours.some((item) => item.title === title));
    if (invalidTours.length || missingNames.length || missingTitles.length) {
      throw new Error(`Post-write verification failed for ${plan.spec.slug}: invalidTours=${invalidTours.length}, missingDestinations=${missingNames.length}, missingTours=${missingTitles.length}.`);
    }
    verification.push({ tenant: plan.spec.slug, destinations: destinations.length, tours: tours.length, invalidTourDestinationRefs: invalidTours.length, uniqueDestinationNames: new Set(destinations.map((item) => item.name)).size, uniqueTourTitles: new Set(tours.map((item) => item.title)).size });
  }
  console.log(JSON.stringify({ success: true, applied: true, database: EXPECTED_DATABASE, verification }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`Tenant catalogue repair failed: ${String(error.message || error).replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, "[MongoDB URI redacted]")}`);
    process.exitCode = 1;
  }).finally(() => mongoose.disconnect().catch(() => {}));
}
