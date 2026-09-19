import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import Staff from "../models/Staff.js";
import Agent from "../models/Agent.js";
import Customer from "../models/Customer.js";
import Destination from "../models/Destination.js";
import Tour from "../models/Tour.js";
import TourPackage from "../models/TourPackage.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Commission from "../models/Commission.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";
import Vehicle from "../models/Vehicle.js";
import Lead from "../models/Lead.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

// This command creates synthetic QA data. Prevent model hooks from enqueueing
// webhook deliveries or touching external integrations while the reset runs.
process.env.DEMO_SEED_MODE = "true";

const CONFIRM = process.env.CONFIRM_DEMO_RESET;
const DEMO_PASSWORD = String(process.env.SEED_DEMO_PASSWORD || "");
if (CONFIRM !== "YES") throw new Error("Refusing destructive reset. Set CONFIRM_DEMO_RESET=YES.");
if (DEMO_PASSWORD.length < 8) throw new Error("SEED_DEMO_PASSWORD must be at least 8 characters.");

const emailFor = (role, slug) => {
  const safe = String(slug || "tenant").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 35);
  return `${role}.${safe}@demo.globaltours.test`;
};
const phoneFor = (index) => `0712${String(340000 + index).slice(-6)}`;
const oid = () => new mongoose.Types.ObjectId();

async function resetCollectionsPreservingOwners() {
  const db = mongoose.connection.db;
  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  const owners = await db.collection("users").find({ role: { $in: ["super_admin", "superadmin"] } }).toArray();

  for (const collection of collections) {
    if (["organizations", "users"].includes(collection.name)) continue;
    await db.collection(collection.name).deleteMany({});
  }

  await db.collection("users").deleteMany({ role: { $nin: ["super_admin", "superadmin"] } });

  // Preserve only the tenant identity needed by the platform: id, name and slug.
  const tenants = await Organization.find({}).lean();
  for (const tenant of tenants) {
    await db.collection("organizations").replaceOne(
      { _id: tenant._id },
      {
        _id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        country: "Kenya",
        timezone: "Africa/Nairobi",
        currency: "KES",
        status: "active",
        features: { payments: true, mpesa: true, stripe: true, ai: true, customDomain: false },
        createdAt: tenant.createdAt || new Date(),
        updatedAt: new Date(),
      },
      { upsert: true }
    );
  }

  // Keep the platform owner's identity/access intact. Its password is never
  // printed or replaced by this script.
  for (const owner of owners) {
    await db.collection("users").replaceOne(
      { _id: owner._id },
      { ...owner, role: "super_admin", tenantId: null, roleId: null, permissionsOverride: [] },
      { upsert: true }
    );
  }
  return { tenants, ownerCount: owners.length };
}

async function seedRbac() {
  const permissionNames = [
    "dashboard.view","bookings.view","bookings.create","bookings.manage","tours.view","tours.manage",
    "destinations.view","destinations.manage","customers.view","customers.manage","staff.view","staff.manage",
    "vehicles.view","vehicles.manage","agents.view","agents.manage","finance.view","finance.manage",
    "reviews.view","reviews.manage","leads.view","leads.manage","notifications.view","reports.view","settings.manage"
  ];
  const permissions = [];
  for (const name of permissionNames) {
    const permission = await Permission.create({
      name,
      label: name.replace(/[._]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
      module: name.split(/[._]/)[0],
      category: "other",
      isActive: true,
    });
    permissions.push(permission);
  }
  return permissions;
}

async function createUser({ name, email, phone, role, tenantId, roleId = null }) {
  return User.create({
    name, email, phone, password: DEMO_PASSWORD, role, roleId, tenantId,
    legacyRole: role, status: "active", isVerified: true,
  });
}

async function seedTenant(tenant, tenantIndex, permissions) {
  const roleDefs = [
    ["admin","Administrator",9], ["manager","Tour Manager",8], ["guide","Tour Guide",6],
    ["driver","Driver",5], ["agent","Travel Agent",6], ["customer","Customer",1],
  ];
  const roles = {};
  for (const [name, displayName, level] of roleDefs) {
    roles[name] = await Role.create({
      tenantId: tenant._id, name, displayName,
      description: `Demo ${displayName} account for dashboard testing.`,
      permissions: permissions.map((p) => p._id),
      isSystem: true, status: "active", level,
    });
  }

  const users = {};
  let sequence = tenantIndex * 20;
  for (const [role] of roleDefs) {
    users[role] = await createUser({
      name: `Demo ${role[0].toUpperCase() + role.slice(1)} - ${tenant.name}`,
      email: emailFor(role, tenant.slug),
      phone: phoneFor(sequence++),
      role: role === "manager" ? "tour_manager" : role,
      tenantId: tenant._id,
      roleId: roles[role]._id,
    });
  }

  const guideStaff = await Staff.create({
    user: users.guide._id, name: users.guide.name, email: users.guide.email, phone: users.guide.phone,
    position: "guide", role: "guide", department: "Operations", employeeNumber: `DEMO-G-${tenantIndex + 1}`,
    experience: 7, languages: ["English","Swahili","French"], certifications: ["KPSGA Level II","First Aid"],
    availability: "available", status: "active", isActive: true, tenantId: tenant._id,
    createdBy: users.admin._id,
  });
  const driverStaff = await Staff.create({
    user: users.driver._id, name: users.driver.name, email: users.driver.email, phone: users.driver.phone,
    position: "driver", role: "driver", department: "Transport", employeeNumber: `DEMO-D-${tenantIndex + 1}`,
    licenseNumber: `DL-DEMO-${tenantIndex + 1}`, licenseExpiry: new Date(Date.now() + 365*86400000),
    experience: 8, languages: ["English","Swahili"], availability: "available", status: "active",
    isActive: true, tenantId: tenant._id, createdBy: users.admin._id,
  });
  const agent = await Agent.create({
    tenantId: tenant._id, user: users.agent._id, companyName: `${tenant.name} Partner Desk`,
    phone: users.agent.phone, email: users.agent.email, location: "Nairobi, Kenya", website: "https://example.com",
    description: "Demo travel agent account for testing commissions and partner sales.",
    commissionRate: 10, totalCommission: 4500, pendingCommission: 1500, paidCommission: 3000,
    walletBalance: 12500, totalSales: 45000, totalBookings: 6, successfulBookings: 5,
    cancelledBookings: 1, isApproved: true, approvedBy: users.admin._id, approvedAt: new Date(),
    status: "active",
  });

  const customer = await Customer.create({
    tenantId: tenant._id, user: users.customer._id, firstName: "Demo", lastName: "Customer",
    email: users.customer.email, phone: users.customer.phone, gender: "female", nationality: "Kenyan",
    city: "Nairobi", county: "Nairobi", country: "Kenya", customerType: "individual",
    preferredContactMethod: "whatsapp", marketingConsent: true, loyaltyPoints: 680,
    totalBookings: 4, completedBookings: 3, totalSpent: 128000, status: "active",
    createdBy: users.admin._id,
  });

  const destinations = await Destination.insertMany([
    { tenantId: tenant._id, name: "Maasai Mara", slug: `maasai-mara-${tenantIndex}`, country: "Kenya", region: "Narok", city: "Narok", shortDescription: "Iconic safari country and wildlife reserve.", description: "Demo destination for safari dashboard testing.", featuredImage: "https://images.unsplash.com/photo-1516426122078-c23e76319801", images: [{url:"https://images.unsplash.com/photo-1516426122078-c23e76319801"}], attractions:["Big Five","Great Migration"], activities:["Game drives","Photography"], languages:["English","Swahili"], currency:"KES", timezone:"Africa/Nairobi", bestSeason:"All Year", weather:"Warm and dry with seasonal rains." },
    { tenantId: tenant._id, name: "Diani Beach", slug: `diani-beach-${tenantIndex}`, country: "Kenya", region: "Kwale", city: "Diani", shortDescription: "Indian Ocean beach escape.", description: "Demo coastal destination for dashboard testing.", featuredImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", images: [{url:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e"}], attractions:["Diani Beach","Kaya Kinondo"], activities:["Snorkelling","Boat trips"], languages:["English","Swahili"], currency:"KES", timezone:"Africa/Nairobi", bestSeason:"All Year" },
    { tenantId: tenant._id, name: "Mount Kenya", slug: `mount-kenya-${tenantIndex}`, country: "Kenya", region: "Central", city: "Nanyuki", shortDescription: "High-altitude mountain adventure.", description: "Demo mountain destination for dashboard testing.", featuredImage: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5", images: [{url:"https://images.unsplash.com/photo-1516026672322-bc52d61a55d5"}], attractions:["Mount Kenya","Ol Pejeta"], activities:["Hiking","Wildlife"], languages:["English","Swahili"], currency:"KES", timezone:"Africa/Nairobi", bestSeason:"All Year" },
    { tenantId: tenant._id, name: "Nairobi", slug: `nairobi-${tenantIndex}`, country: "Kenya", region: "Nairobi County", city: "Nairobi", shortDescription: "Kenya's capital city and cultural gateway.", description: "Demo Nairobi destination for city-tour dashboard testing.", featuredImage: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6", images: [{url:"https://images.unsplash.com/photo-1489392191049-fc10c97e64b6"}], attractions:["Nairobi National Park","Karen Blixen Museum"], activities:["City tours","Cultural experiences"], languages:["English","Swahili"], currency:"KES", timezone:"Africa/Nairobi", bestSeason:"All Year" },
  ]);

  const tourData = [
    ["Maasai Mara Explorer","Maasai Mara",5,85000,"Safari"],
    ["Diani Coast Escape","Diani Beach",4,62000,"Beach"],
    ["Mount Kenya Challenge","Mount Kenya",4,70000,"Mountain"],
    ["Nairobi City & Culture","Nairobi",2,28000,"City Tour"],
  ];
  const tours = [];
  for (let i=0;i<tourData.length;i++) {
    const [title,destName,days,price,category]=tourData[i];
    const dest = destinations.find(d => d.name === destName);
    const date = new Date(Date.now() + (i+8)*86400000);
    tours.push(await Tour.create({
      tenantId: tenant._id, title, description: `Demo ${title} itinerary prepared for dashboard and workflow testing.`,
      shortDescription: `Production-style demo ${title}.`, category, destination: dest?._id,
      country:"Kenya", location:destName, meetingPoint:"Nairobi CBD", duration:`${days} days`,
      durationDetails:{days,nights:Math.max(0,days-1)}, date, startDate:date, capacity:20,
      price, agentPrice:Math.round(price*0.9), featuredImage:{url:"https://images.unsplash.com/photo-1516426122078-c23e76319801"},
      highlights:["Professional guide","Comfortable transport","Daily support"], inclusions:["Park fees","Guide","Transport"],
      exclusions:["International flights","Personal shopping"], languages:["English","Swahili"], difficulty:"easy",
      itinerary:Array.from({length:days},(_,d)=>({day:d+1,title:`Day ${d+1}`,description:"Demo itinerary activities and sightseeing.",meals:["Breakfast"],activities:["Sightseeing","Guided experience"]})),
      availability:[{date,totalSlots:20,bookedSlots:i+2}], availabilitySettings:{totalSlots:20,bookedSlots:i+2,waitlistEnabled:true},
      bookingDeadline:1, instantBooking:true, status:"upcoming", published:true, featured:i<2, available:true,
      isDeleted:false, averageRating:4.6, totalReviews:8+i, totalBookings:5+i, popularity:80-i*8,
      createdBy:users.manager._id, assignedGuide:guideStaff._id, assignedDriver:driverStaff._id,
      assignmentStatus:"assigned",
    }));
  }

  await TourPackage.insertMany(tours.map((tour,i)=>({
    tenantId:tenant._id, title:tours[i].title, slug:`package-${tenantIndex}-${i+1}`,
    description:tours[i].description, shortDescription:tours[i].shortDescription,
    destination:tours[i].location, country:"Kenya", startLocation:"Nairobi",
    category:tours[i].category, duration:tours[i].duration, numberOfDays:tours[i].durationDetails.days,
    currency:"KES", basePrice:tours[i].price, agentPrice:tours[i].agentPrice, maximumGuests:10,
    availableSeats:18, bookingDeadline:1, instantBooking:true, status:"active", featured:i<2,
    published:true, isDeleted:false, createdBy:users.manager._id, views:120+i*50,
  })));

  const vehicle = await Vehicle.create({
    tenantId:tenant._id, name:"Demo Safari Cruiser", registrationNumber:`KDA ${100 + tenantIndex} DEM`,
    model:"Land Cruiser 79", manufacturer:"Toyota", year:2023, type:"LAND_CRUISER", capacity:7,
    driver:driverStaff._id, assignedTour:tours[0]._id, status:"assigned", isActive:true, fuelType:"Diesel",
    transmission:"Automatic", mileage:58000, insuranceNumber:`INS-DEMO-${tenantIndex}`,
    insuranceExpiry:new Date(Date.now()+180*86400000), lastServiceDate:new Date(Date.now()-20*86400000),
    nextServiceDate:new Date(Date.now()+70*86400000), description:"Demo safari vehicle for fleet dashboard testing.", createdBy:users.admin._id,
  });

  const bookingDocs=[];
  for(let i=0;i<8;i++){
    const tour=tours[i%tours.length];
    const amount=Number(tour.price)*(i%2?2:1);
    bookingDocs.push({
      bookingNumber:`DEMO-${String(tenantIndex + 1).padStart(2, "0")}-${String(i + 1).padStart(4, "0")}`,
      tenantId:tenant._id, customer:customer._id, user:users.customer._id,
      customerSnapshot:{name:customer.firstName+" "+customer.lastName,email:customer.email,phone:customer.phone},
      contact:{name:customer.firstName+" "+customer.lastName,email:customer.email,phone:customer.phone},
      agent: i%3===0 ? agent._id : null, bookingSource:i%3===0?"agent":"website", bookingType:i%4===0?"group":"individual",
      tour:tour._id, travelDate:new Date(Date.now()+(15+i)*86400000), travelers:[{name:"Demo Customer",age:34,gender:"female",nationality:"Kenyan"}],
      numberOfGuests:i%4===0?4:(i%3)+1, pickupLocation:"Nairobi CBD", pickupTime:new Date(Date.now()+(15+i)*86400000+8*3600000),
      subtotal:amount, totalAmount:amount, commissionRate:i%3===0?10:0, commissionAmount:i%3===0?amount*0.1:0,
      commissionStatus:i%3===0?"paid":"pending", depositAmount:amount*0.5, balanceAmount:amount*0.5,
      paymentMethod:i%2?"CARD":"MPESA", paymentStatus:i%3===0?"paid":(i%2?"partial":"pending"),
      transactionId:`DEMO-TXN-${tenantIndex}-${i+1}`, paymentReference:`DEMO-${tenantIndex}-${i+1}`,
      status:["completed","confirmed","assigned","pending"][i%4], assignedGuide:guideStaff._id, assignedDriver:driverStaff._id,
      assignedVehicle:vehicle._id, assigned:true, createdBy:users.agent._id, updatedBy:users.admin._id, isDeleted:false,
    });
  }
  const bookings=await Booking.insertMany(bookingDocs);

  for(let i=0;i<3;i++) await Payment.create({
    tenantId:tenant._id, customer:users.customer._id, user:users.customer._id, booking:bookings[i]._id,
    provider:i===1?"STRIPE":"MPESA", method:i===1?"card":"mpesa", paymentMethod:i===1?"CARD":"MPESA",
    amount:Number(bookings[i].totalAmount)*0.5, currency:"KES", phone:users.customer.phone, status:"completed",
    transactionId:`DEMO-PAY-${tenantIndex}-${i+1}`, transactionReference:`DEMO-REF-${tenantIndex}-${i+1}`,
    paidAt:new Date(Date.now()-i*86400000), processedAt:new Date(Date.now()-i*86400000),
  });

  for(let i=0;i<3;i++) await Commission.create({
    tenantId:tenant._id, agent:agent._id, booking:bookings[i]._id, customer:users.customer._id, tour:bookings[i].tour,
    bookingAmount:bookings[i].totalAmount, rate:10, amount:bookings[i].totalAmount*0.1,
    status:i===0?"paid":"pending", paymentMethod:i===0?"MPESA":undefined, paymentReference:i===0?`DEMO-COM-${tenantIndex}`:"",
    paidAt:i===0?new Date():null, approvedBy:users.admin._id, approvedAt:new Date(), createdBy:users.agent._id,
  });

  for(let i=0;i<3;i++) await Review.create({
    tenantId:tenant._id, user:users.customer._id, customer:users.customer._id, tour:tours[i]._id, booking:bookings[i]._id,
    rating:5-i%2, title:["Amazing safari","Beautiful coast","Great mountain guide"][i],
    comment:"Demo verified customer review for dashboard testing.", recommend:true, verified:true, approved:true,
    helpfulVotes:4+i, notHelpfulVotes:0, adminReply:{message:"Thank you for travelling with us!",repliedBy:users.admin._id,repliedAt:new Date()},
  });

  for(const recipient of [users.admin,users.manager,users.guide,users.driver,users.agent,users.customer]) {
    await Notification.create({
      tenantId:tenant._id, recipient:recipient._id, user:recipient._id,
      title:"Demo dashboard activity", message:"This is seeded testing data. A real booking, assignment or payment event would appear here.",
      type:"system", priority:"normal", read:false, isSent:true, actionUrl:"/dashboard",
    });
  }

  await Lead.insertMany([
    {tenantId:tenant._id,firstName:"Jane",lastName:"Wanjiku",name:"Jane Wanjiku",email:`jane.${tenantIndex}@demo.test`,phone:phoneFor(sequence++),nationality:"Kenyan",country:"Kenya",city:"Nairobi",county:"Nairobi",tour:tours[0]._id,travelDate:new Date(Date.now()+30*86400000),guests:2,message:"Interested in a Maasai Mara safari.",source:"website",landingPage:"/tours/maasai-mara",marketingConsent:true,consentAt:new Date(),status:"new"},
    {tenantId:tenant._id,firstName:"Brian",lastName:"Otieno",name:"Brian Otieno",email:`brian.${tenantIndex}@demo.test`,phone:phoneFor(sequence++),nationality:"Kenyan",country:"Kenya",city:"Kisumu",county:"Kisumu",tour:tours[1]._id,travelDate:new Date(Date.now()+45*86400000),guests:4,message:"Family beach holiday inquiry.",source:"website",status:"qualified",lastContactedAt:new Date()},
  ]);
}

const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 5,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 120000,
    waitQueueTimeoutMS: 30000,
  });
  const {tenants, ownerCount} = await resetCollectionsPreservingOwners();
  const permissions = await seedRbac();
  for (let i=0;i<tenants.length;i++) {
    await runWithTenant({ tenantId: tenants[i]._id, tenant: tenants[i], role: "super_admin", bypass: false }, () => seedTenant(tenants[i], i, permissions));
  }

  // Extend the core reset with the existing production-style demo seeders.
  // This fills hospitality, airport transfers, accounting/finance, compliance,
  // operations, and external website test-mode integrations for all tenants.
  const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  await mongoose.disconnect();
  const demoSeeders = [
    ["seeds/ensureDashboardMasterData.js", "financial master data (suppliers)"],
    ["seeds/financialDashboardSeedRunner.js", "accounting/finance"],
    ["seeds/dashboardOperationalSeed.js", "website integrations/operations"],
    ["seeds/hospitalityDeveloperSeed.js", "hotels/airport transfers"],
  ];
  for (const [script, label] of demoSeeders) {
    console.log("\n=== SEEDING " + label.toUpperCase() + " TEST DATA ===");
    execFileSync(process.execPath, [path.join(serverDir, script)], {
      cwd: serverDir,
      env: process.env,
      stdio: "inherit",
    });
  }
  console.log(JSON.stringify({
    success:true,
    message:"Demo reset complete. Platform owner accounts and tenant identities were preserved; all other data was replaced with seeded dashboard test data.",
    tenants:tenants.map(t=>({id:t._id,name:t.name,slug:t.slug})),
    platformOwnersPreserved:ownerCount,
    demoUsersPerTenant:6,
    demoPasswordConfigured:true,
  },null,2));
  await mongoose.disconnect();
};

main().catch(async (error)=>{ console.error("DEMO RESET FAILED:",error); await mongoose.disconnect().catch(()=>{}); process.exit(1); });
