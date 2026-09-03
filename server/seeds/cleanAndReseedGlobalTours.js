import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

dotenv.config();

const PASSWORD = "Admin@123456";
const image = (id, width = 1800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=90`;

const IMAGE_POOL = [
  image("photo-1516426122078-c23e76319801"),
  image("photo-1547970810-dc1eac37d174"),
  image("photo-1549366021-9f761d450615"),
  image("photo-1510414842594-a61c69b5ae57"),
  image("photo-1507525428034-b723cf961d3e"),
  image("photo-1464822759023-fed622ff2c3b"),
  image("photo-1501785888041-af3ef285b470"),
  image("photo-1526772662000-3f88f10405ff"),
];

const TENANTS = [
  {
    name: "Global Tours Kenya",
    slug: "global-tours-kenya",
    email: "admin@globaltours.co.ke",
    phone: "0707476586",
    address: "Nairobi, Kenya",
  },
  {
    name: "Savanna Crown Safaris",
    slug: "savanna-crown-safaris",
    email: "admin@savannacrown.co.ke",
    phone: "0712345678",
    address: "Nairobi, Kenya",
  },
  {
    name: "Coastal Horizon Adventures",
    slug: "coastal-horizon-adventures",
    email: "admin@coastalhorizon.co.ke",
    phone: "0723456789",
    address: "Mombasa, Kenya",
  },
];

const DESTINATIONS = [
  ["Maasai Mara", "maasai-mara", "Narok County", "Kenya's iconic wildlife reserve, famous for big cats and the Great Migration."],
  ["Amboseli", "amboseli", "Kajiado County", "A spectacular safari destination with elephants and views of Mount Kilimanjaro."],
  ["Tsavo National Park", "tsavo-national-park", "Taita-Taveta County", "Vast wilderness, red elephants and unforgettable game drives."],
  ["Lake Naivasha", "lake-naivasha", "Nakuru County", "A scenic freshwater lake surrounded by wildlife and dramatic landscapes."],
  ["Watamu", "watamu", "Kilifi County", "A tropical coastal destination known for marine life, white beaches and coral reefs."],
  ["Diani Beach", "diani-beach", "Kwale County", "A world-class Indian Ocean beach destination with white sand and turquoise water."],
  ["Mount Kenya", "mount-kenya", "Nyeri County", "Highland landscapes, alpine scenery and rewarding mountain adventures."],
  ["Samburu National Reserve", "samburu-national-reserve", "Samburu County", "Northern Kenya wilderness famous for unique wildlife and Samburu culture."],
];

const TOUR_TEMPLATES = [
  ["Maasai Mara Safari Adventure", "Maasai Mara", "Safari", 4, 850],
  ["Amboseli Wildlife Escape", "Amboseli", "Safari", 3, 690],
  ["Tsavo Wildlife Explorer", "Tsavo National Park", "Safari", 4, 820],
  ["Naivasha Lakeside Escape", "Lake Naivasha", "Nature", 2, 380],
  ["Hell's Gate Cycling Adventure", "Lake Naivasha", "Adventure", 2, 450],
  ["Watamu Marine Discovery", "Watamu", "Beach", 3, 610],
  ["Diani Beach Retreat", "Diani Beach", "Beach", 4, 720],
  ["Mount Kenya Highland Adventure", "Mount Kenya", "Mountain", 4, 950],
  ["Samburu Wildlife Discovery", "Samburu National Reserve", "Safari", 3, 780],
  ["Kenya Family Safari", "Maasai Mara", "Family", 5, 1180],
];

const PERMISSIONS = [
  "manage_users", "manage_tours", "manage_destinations", "manage_bookings",
  "manage_payments", "view_reports", "manage_gallery", "manage_staff",
  "manage_vehicles", "manage_settings", "view_assigned_tours", "view_tour_guests",
  "update_tour_status", "submit_tour_report", "create_bookings", "manage_customer_bookings",
  "view_tours", "view_destinations", "view_commissions", "view_wallet",
];

const ROLE_DEFS = [
  ["super_admin", "Super Admin", 100],
  ["admin", "Admin", 90],
  ["tour_manager", "Tour Manager", 70],
  ["agent", "Travel Agent", 50],
  ["tour_guide", "Tour Guide", 40],
  ["driver", "Driver", 30],
  ["customer", "Customer", 10],
];

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const oid = () => new mongoose.Types.ObjectId();

const run = async () => {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // This is an intentional full demo reset. Nothing from the previous seed is retained.
  const collections = await db.listCollections().toArray();
  for (const collection of collections) {
    await db.collection(collection.name).drop().catch(() => {});
  }

  const hashedPassword = await bcrypt.hash(PASSWORD, 12);
  const now = new Date();

  const permissionDocs = PERMISSIONS.map((name) => ({
    _id: oid(),
    name,
    label: name.replace(/_/g, " "),
    module: name.split(/[._]/)[0],
    category: "other",
    description: `Permission to ${name.replace(/_/g, " ")}`,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }));
  await db.collection("permissions").insertMany(permissionDocs);
  const permissionIds = permissionDocs.map((p) => p._id);

  const roleDocs = ROLE_DEFS.map(([name, displayName, level]) => ({
    _id: oid(), name, displayName, level, isSystem: true, status: "active",
    permissions: permissionIds, createdAt: now, updatedAt: now,
  }));
  await db.collection("roles").insertMany(roleDocs);
  const roleByName = new Map(roleDocs.map((r) => [r.name, r]));

  const organizations = TENANTS.map((tenant) => ({
    _id: oid(), name: tenant.name, slug: tenant.slug, legalName: tenant.name,
    supportEmail: tenant.email, supportPhone: tenant.phone, address: tenant.address,
    country: "Kenya", timezone: "Africa/Nairobi", currency: "KES", status: "active",
    subscription: { plan: "professional", seats: 25, trialEndsAt: null, renewsAt: null },
    features: { payments: true, mpesa: true, stripe: true, ai: false, customDomain: false },
    settings: { companyName: tenant.name, city: tenant.address.split(",")[0], country: "Kenya" },
    createdAt: now, updatedAt: now,
  }));
  await db.collection("organizations").insertMany(organizations);

  const userDocs = [];
  const staffDocs = [];
  const agentDocs = [];
  const customerDocs = [];
  const vehicleDocs = [];
  const tenantTourSets = [];

  for (let t = 0; t < organizations.length; t += 1) {
    const tenant = organizations[t];
    const company = TENANTS[t];
    const suffix = t === 0 ? "gt" : t === 1 ? "scs" : "cha";
    const roles = roleByName;

    const makeUser = (name, email, phone, roleName) => {
      const user = {
        _id: oid(), tenantId: tenant._id, name, email, phone,
        password: hashedPassword, role: roleName, legacyRole: roleName,
        roleId: roles.get(roleName)._id, status: "active", isVerified: true,
        createdAt: now, updatedAt: now,
      };
      userDocs.push(user);
      return user;
    };

    const admin = makeUser(`${company.name} Admin`, company.email, company.phone, "admin");
    const manager = makeUser(`${company.name} Tour Manager`, `manager@${suffix}.co.ke`, company.phone, "tour_manager");
    const agentUser = makeUser(`${company.name} Travel Agent`, `agent@${suffix}.co.ke`, company.phone, "agent");
    const guide1 = makeUser(`${company.name} Safari Guide`, `guide1@${suffix}.co.ke`, company.phone, "tour_guide");
    const guide2 = makeUser(`${company.name} Wildlife Guide`, `guide2@${suffix}.co.ke`, company.phone, "tour_guide");
    const driver = makeUser(`${company.name} Driver`, `driver@${suffix}.co.ke`, company.phone, "driver");
    const customer1 = makeUser(`${company.name} Customer One`, `customer1@${suffix}.co.ke`, "+254700100001", "customer");
    const customer2 = makeUser(`${company.name} Customer Two`, `customer2@${suffix}.co.ke`, "+254700100002", "customer");

    const staffFor = (user, position, role) => ({
      _id: oid(), tenantId: tenant._id, user: user._id, name: user.name, email: user.email,
      phone: user.phone, position, role, status: "active", isActive: true, isDeleted: false,
      availability: "available", createdBy: admin._id, createdAt: now, updatedAt: now,
    });
    staffDocs.push(staffFor(manager, "tour_manager", "tour_manager"));
    staffDocs.push(staffFor(guide1, "guide", "guide"));
    staffDocs.push(staffFor(guide2, "guide", "guide"));
    staffDocs.push(staffFor(driver, "driver", "driver"));

    const agent = {
      _id: oid(), tenantId: tenant._id, user: agentUser._id, companyName: company.name,
      name: agentUser.name, email: agentUser.email, phone: agentUser.phone, location: company.address,
      commissionRate: 10, totalCommission: 0, pendingCommission: 0, paidCommission: 0,
      walletBalance: 0, totalSales: 0, totalBookings: 0, successfulBookings: 0,
      cancelledBookings: 0, isApproved: true, status: "active", createdAt: now, updatedAt: now,
    };
    agentDocs.push(agent);

    const customerFor = (user, index) => ({
      _id: oid(), tenantId: tenant._id, user: user._id, name: user.name,
      email: user.email, phone: user.phone, country: "Kenya", nationality: "Kenyan",
      status: "active", isActive: true, totalBookings: index === 1 ? 2 : 1,
      createdAt: now, updatedAt: now,
    });
    customerDocs.push(customerFor(customer1, 1));
    customerDocs.push(customerFor(customer2, 2));

    for (let v = 1; v <= 2; v += 1) {
      vehicleDocs.push({
        _id: oid(), tenantId: tenant._id, name: `${company.name} Safari Van ${v}`,
        registrationNumber: `KDA ${t + 10}${v}A`, type: "Safari Van", capacity: 7,
        seats: 7, status: "available", active: true, isActive: true,
        driver: driver._id, createdBy: admin._id, createdAt: now, updatedAt: now,
      });
    }

    const destinationDocs = DESTINATIONS.map(([name, slug, region, description], index) => ({
      _id: oid(), tenantId: tenant._id, name, slug, country: "Kenya", region,
      shortDescription: description, description, images: [{ url: IMAGE_POOL[(index + t) % IMAGE_POOL.length] }],
      featuredImage: IMAGE_POOL[(index + t) % IMAGE_POOL.length],
      attractions: ["Scenic Landscapes", "Wildlife", "Local Culture"],
      activities: ["Guided Tours", "Photography", "Sightseeing"], languages: ["English", "Swahili"],
      currency: "KES", timezone: "Africa/Nairobi", bestSeason: "All Year", featured: index < 5,
      popular: true, status: "active", active: true, isDeleted: false, createdAt: now, updatedAt: now,
    }));
    await db.collection("destinations").insertMany(destinationDocs);
    const destinationByName = new Map(destinationDocs.map((d) => [d.name, d]));

    const tourDocs = TOUR_TEMPLATES.map(([title, destinationName, category, days, price], index) => {
      const destination = destinationByName.get(destinationName);
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + 10 + index * 4 + t * 2);
      const tourImage = IMAGE_POOL[(index + 2 + t) % IMAGE_POOL.length];
      return {
        _id: oid(), tenantId: tenant._id, title, slug: `${slugify(title)}-${suffix}`,
        description: `${days}-day ${category.toLowerCase()} experience in ${destinationName}, Kenya, professionally planned by ${company.name}.`,
        shortDescription: `${days}-day ${category.toLowerCase()} experience in ${destinationName}.`,
        tags: [company.name, category, destinationName, "Kenya"], category,
        destination: destination._id, country: "Kenya", location: destination.region,
        meetingPoint: "Nairobi CBD", duration: `${days} Days`,
        durationDetails: { days, nights: Math.max(0, days - 1) }, date: startDate, startDate,
        capacity: 20, price, agentPrice: Math.max(0, price - 50), discount: index % 4 === 0 ? 5 : 0,
        featuredImage: { url: tourImage }, gallery: [{ url: tourImage }, { url: IMAGE_POOL[(index + 3) % IMAGE_POOL.length] }],
        highlights: ["Professional local guide", "Comfortable transport", "Authentic Kenyan experience"],
        inclusions: ["Professional guide", "Transport", "Accommodation", "Selected activities"],
        exclusions: ["International flights", "Travel insurance", "Personal expenses"], languages: ["English", "Swahili"],
        difficulty: category === "Mountain" ? "moderate" : "easy",
        itinerary: Array.from({ length: days }, (_, dayIndex) => ({
          day: dayIndex + 1, title: dayIndex === 0 ? "Arrival and Orientation" : dayIndex === days - 1 ? "Final Experience and Departure" : "Explore and Experience",
          description: `Discover ${destinationName} with guided activities and scenic stops.`,
          activities: ["Sightseeing", "Photography", "Guided exploration"],
        })),
        availabilitySettings: { totalSlots: 20, bookedSlots: 0, waitlistEnabled: true }, bookingDeadline: 1,
        instantBooking: true, cancellationPolicy: "Free cancellation subject to company policy.", featured: index < 6,
        status: "upcoming", published: true, available: true, isDeleted: false,
        averageRating: 4.5, totalReviews: 12 + index, popularity: 80 - index, createdBy: admin._id,
        createdAt: now, updatedAt: now,
      };
    });
    await db.collection("tours").insertMany(tourDocs);
    tenantTourSets.push({ tenant, company, admin, manager, agentUser, agent, guide1, guide2, driver, customer1, customer2, customerDocs: customerDocs.slice(-2), destinationDocs, tourDocs });

    const categories = [
      ["Wildlife Safari", "wildlife-safari", "Wildlife and national park experiences."],
      ["Beach Holidays", "beach-holidays", "Indian Ocean beach and marine experiences."],
      ["Mountain Adventures", "mountain-adventures", "Mountain hiking and highland adventures."],
      ["Family Tours", "family-tours", "Comfortable experiences designed for families."],
    ].map(([name, slug, description], index) => ({
      _id: oid(), tenantId: tenant._id, name, slug: `${slug}-${suffix}`, description,
      icon: ["Binoculars", "Beach", "Mountain", "Users"][index], active: true, createdAt: now, updatedAt: now,
    }));
    await db.collection("tourcategories").insertMany(categories);

    await db.collection("galleries").insertMany(Array.from({ length: 8 }, (_, index) => ({
      _id: oid(), tenantId: tenant._id, title: `${company.name} Experience ${index + 1}`,
      image: { url: IMAGE_POOL[(index + t) % IMAGE_POOL.length], publicId: "" },
      category: index < 4 ? "Safari" : "Beach", featured: true, active: true, createdAt: now, updatedAt: now,
    })));

    await db.collection("heroslides").insertMany([
      ["Discover Kenya Beyond the Ordinary", "Premium safaris, coastal escapes and unforgettable East African adventures."],
      ["Wild Kenya. Beautifully Yours.", "Travel with local expertise across wildlife reserves, mountains, lakes and the coast."],
      ["From Safari Trails to the Indian Ocean", "Build your perfect Kenyan journey with experiences designed around you."],
    ].map(([title, subtitle], index) => ({
      _id: oid(), tenantId: tenant._id, title, subtitle, badge: company.name.toUpperCase(),
      image: { url: IMAGE_POOL[(index + t) % IMAGE_POOL.length], publicId: "" },
      buttonOne: { text: "Explore Tours", link: "/tours" }, buttonTwo: { text: "Contact Us", link: "/contact" },
      active: true, order: index + 1, createdAt: now, updatedAt: now,
    })));

    const customers = [customerDocs[customerDocs.length - 2], customerDocs[customerDocs.length - 1]];
    const tours = tourDocs;
    const vehicles = vehicleDocs.slice(-2);
    const guides = staffDocs.filter((s) => s.tenantId.equals(tenant._id) && s.position === "guide");
    const bookingSeed = [
      { customer: customers[0], tour: tours[0], status: "confirmed", paymentStatus: "paid", guests: 2, amount: tours[0].price * 2 },
      { customer: customers[1], tour: tours[3], status: "pending", paymentStatus: "partial", guests: 1, amount: tours[3].price },
      { customer: customers[0], tour: tours[6], status: "completed", paymentStatus: "paid", guests: 2, amount: tours[6].price * 2 },
      { customer: customers[1], tour: tours[5], status: "confirmed", paymentStatus: "paid", guests: 2, amount: tours[5].price * 2 },
    ];

    const bookingDocs = bookingSeed.map((item, index) => {
      const travelDate = new Date(item.tour.startDate);
      const booking = {
        _id: oid(), tenantId: tenant._id, bookingNumber: `GT-${t + 1}${String(index + 1).padStart(4, "0")}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`,
        customer: item.customer._id, user: item.customer.user, customerSnapshot: { name: item.customer.name, email: item.customer.email, phone: item.customer.phone },
        contact: { name: item.customer.name, email: item.customer.email, phone: item.customer.phone },
        agent: agent._id, bookingSource: "website", tour: item.tour._id, travelDate,
        originalTravelDate: travelDate, travelers: [{ name: item.customer.name, nationality: "Kenyan", gender: "other" }],
        numberOfGuests: item.guests, pickupLocation: "Nairobi CBD", hotelName: "Demo Hotel", specialRequests: [],
        assignedGuide: guides[index % guides.length]?._id || null, assignedDriver: staffDocs.find((s) => s.tenantId.equals(tenant._id) && s.position === "driver")?._id || null,
        assignedVehicle: vehicles[index % vehicles.length]?._id || null, assigned: index !== 1,
        subtotal: item.amount, discountAmount: 0, taxAmount: 0, serviceFee: 0, totalAmount: item.amount,
        commissionRate: 10, commissionAmount: Math.round(item.amount * 0.1), commissionStatus: "pending",
        depositAmount: item.paymentStatus === "partial" ? Math.round(item.amount * 0.3) : item.amount,
        balanceAmount: item.paymentStatus === "partial" ? Math.round(item.amount * 0.7) : 0,
        paymentMethod: "MPESA", paymentStatus: item.paymentStatus, paymentReference: `DEMO-${t + 1}-${index + 1}`,
        mpesaReceipt: item.paymentStatus === "paid" ? `DEMO${t + 1}${index + 1}MPESA` : "", payments: [], refundAmount: 0, refundStatus: "none",
        status: item.status, confirmedAt: item.status !== "pending" ? now : null, assignedAt: index !== 1 ? now : null,
        createdBy: admin._id, createdAt: now, updatedAt: now,
      };
      return booking;
    });
    await db.collection("bookings").insertMany(bookingDocs);

    const paymentDocs = [];
    for (let i = 0; i < bookingDocs.length; i += 1) {
      const booking = bookingDocs[i];
      const amount = booking.paymentStatus === "partial" ? booking.depositAmount : booking.totalAmount;
      const payment = {
        _id: oid(), tenantId: tenant._id, customer: booking.user, user: booking.user, booking: booking._id,
        provider: "MPESA", method: "mpesa", paymentMethod: "MPESA", amount, currency: "KES",
        phone: booking.contact.phone, phoneNumber: booking.contact.phone, status: "completed",
        transactionId: `DEMO-TXN-${t + 1}-${i + 1}`, transactionReference: booking.paymentReference,
        invoiceNumber: `INV-${t + 1}-${String(i + 1).padStart(4, "0")}`,
        mpesaReceiptNumber: booking.mpesaReceipt || `DEMO${t + 1}${i + 1}MPESA`, transactionDate: now.toISOString(),
        callbackResponse: { demo: true }, createdAt: now, updatedAt: now,
      };
      paymentDocs.push(payment);
      booking.payments.push(payment._id);
    }
    await db.collection("payments").insertMany(paymentDocs);
    await db.collection("bookings").bulkWrite(bookingDocs.map((b) => ({ updateOne: { filter: { _id: b._id }, update: { $set: { payments: b.payments } } } })));

    await db.collection("reviews").insertMany(tours.slice(0, 4).map((tour, index) => ({
      _id: oid(), tenantId: tenant._id, user: customers[index % 2].user, customer: customers[index % 2]._id,
      tour: tour._id, rating: 5, title: "Excellent experience", comment: `A memorable ${tour.title} with professional service.`,
      status: "approved", approved: true, createdAt: now, updatedAt: now,
    })));

    await db.collection("invoices").insertMany(bookingDocs.map((booking, index) => ({
      _id: oid(), tenantId: tenant._id, invoiceNumber: `INV-${t + 1}-${String(index + 1).padStart(4, "0")}`,
      booking: booking._id, customer: booking.customer, user: booking.user, subtotal: booking.subtotal,
      taxAmount: 0, discountAmount: 0, totalAmount: booking.totalAmount, amountPaid: booking.depositAmount,
      balanceDue: booking.balanceAmount, currency: "KES", status: booking.balanceAmount ? "partial" : "paid",
      issueDate: now, dueDate: booking.travelDate, createdAt: now, updatedAt: now,
    })));

    await db.collection("notifications").insertMany([
      { _id: oid(), tenantId: tenant._id, user: admin._id, title: "Welcome to your dashboard", message: `${company.name} demo workspace is ready.`, type: "system", read: false, createdAt: now, updatedAt: now },
      { _id: oid(), tenantId: tenant._id, user: manager._id, title: "New booking received", message: "A demo booking is ready for management.", type: "booking", read: false, createdAt: now, updatedAt: now },
    ]);

    await db.collection("wishlists").insertOne({ _id: oid(), tenantId: tenant._id, user: customers[0].user, tours: [tours[1]._id, tours[4]._id], createdAt: now, updatedAt: now });
  }

  // Global platform account: same password, not attached to a tenant.
  await db.collection("users").insertOne({
    _id: oid(), tenantId: null, name: "Platform Super Admin", email: "superadmin@globaltours.co.ke",
    password: hashedPassword, role: "super_admin", legacyRole: "super_admin", roleId: roleByName.get("super_admin")._id,
    status: "active", isVerified: true, createdAt: now, updatedAt: now,
  });

  console.log("\nTHREE-TENANT DEMO RESEED COMPLETE");
  console.log("All previous collections/tenant records were removed before reseeding.");
  console.log(`Tenants: ${organizations.length}`);
  console.log(`Users: ${userDocs.length + 1} + platform super admin`);
  console.log(`Password for every seeded account: ${PASSWORD}`);
  console.log("\nTENANT ADMIN ACCOUNTS:");
  TENANTS.forEach((tenant) => console.log(`- ${tenant.name}: ${tenant.email}`));
  console.log("\nOTHER ACCOUNT EMAILS (password is the same):");
  console.log("- superadmin@globaltours.co.ke");
  console.log("- manager@gt.co.ke / agent@gt.co.ke / guide1@gt.co.ke / guide2@gt.co.ke / driver@gt.co.ke / customer1@gt.co.ke / customer2@gt.co.ke");
  console.log("- manager@scs.co.ke / agent@scs.co.ke / guide1@scs.co.ke / guide2@scs.co.ke / driver@scs.co.ke / customer1@scs.co.ke / customer2@scs.co.ke");
  console.log("- manager@cha.co.ke / agent@cha.co.ke / guide1@cha.co.ke / guide2@cha.co.ke / driver@cha.co.ke / customer1@cha.co.ke / customer2@cha.co.ke");
};

run()
  .catch((error) => {
    console.error("Three-tenant demo reseed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
