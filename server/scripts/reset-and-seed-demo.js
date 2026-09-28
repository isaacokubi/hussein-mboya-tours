import mongoose from "mongoose";
import dotenv from "dotenv";
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
import Quotation from "../models/Quotation.js";
import CustomTourRequest from "../models/CustomTourRequest.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

// This command creates synthetic QA data. Prevent model hooks from enqueueing
// webhook deliveries or touching external integrations while the reset runs.
process.env.DEMO_SEED_MODE = "true";

const CONFIRM = process.env.CONFIRM_DEMO_RESET;
const DEMO_PASSWORD = String(process.env.SEED_DEMO_PASSWORD || "");
const DEMO_DATABASE_NAME = "husseindb";
const DEMO_DATABASE_HOST = "cluster0.cdtxzts.mongodb.net";
const DEMO_TENANTS = [
  { slug: "hussein-mboya", name: "Hussein Mboya Tours", legalName: "Hussein Mboya Tours Limited", county: "Nairobi" },
  { slug: "amani-trails", name: "Amani Trails Safaris", legalName: "Amani Trails Safaris Limited", county: "Narok" },
  { slug: "demo-safari", name: "Demo Safari Adventures", legalName: "Demo Safari Adventures Limited", county: "Mombasa" },
];
if (CONFIRM !== "YES") throw new Error("Refusing destructive reset. Set CONFIRM_DEMO_RESET=YES.");
if (DEMO_PASSWORD.length < 8) throw new Error("SEED_DEMO_PASSWORD must be at least 8 characters.");

function assertDemoResetTarget() {
  const uri = String(process.env.MONGODB_URI || "");
  if (!uri) throw new Error("Refusing destructive reset: MONGODB_URI is missing.");
  let target;
  try {
    target = new URL(uri);
  } catch {
    throw new Error("Refusing destructive reset: MONGODB_URI is invalid.");
  }
  const databaseName = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");
  if (target.hostname.toLowerCase() !== DEMO_DATABASE_HOST || databaseName !== DEMO_DATABASE_NAME) {
    throw new Error(`Refusing destructive reset: target must be the authorized demo database ${DEMO_DATABASE_NAME} on its configured demo Atlas cluster.`);
  }
}

const emailDomainFor = (slug) => `${String(slug || "tenant").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.com`;
const emailFor = (localPart, slug) => `${localPart}@${emailDomainFor(slug)}`;
const phoneFor = (index) => `0712${String(340000 + index).slice(-6)}`;
const demoTourImageIds = [
  "photo-1516426122078-c23e76319801", "photo-1547471080-7cc2caa01a7e", "photo-1534177616072-ef7dc120449d",
  "photo-1516026672322-bc52d61a55d5", "photo-1547036967-23d11aacaee0", "photo-1500530855697-b586d89ba3ee",
  "photo-1501785888041-af3ef285b470", "photo-1469474968028-56623f02e42e", "photo-1441974231531-c6227db76b6e",
  "photo-1472396961693-142e6e269027", "photo-1497250681960-ef046c08a56e", "photo-1501854140801-50d01698950b",
];
const packageCategory = (category) => ({ Family: "Adventure", Corporate: "Safari", Photography: "Adventure", Cultural: "Culture" })[category] || category;

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
  const tenants = [];
  for (const spec of DEMO_TENANTS) {
    const existing = await Organization.findOne({ slug: spec.slug }).lean();
    const tenant = await Organization.findOneAndUpdate(
      { slug: spec.slug },
      {
        $set: {
          name: spec.name,
          legalName: spec.legalName,
          supportEmail: `hello@${emailDomainFor(spec.slug)}`,
          supportPhone: "0712345678",
          address: `${spec.county}, Kenya`,
          country: "Kenya",
          timezone: "Africa/Nairobi",
          currency: "KES",
          status: "active",
          subscription: { plan: "professional", seats: 30, trialEndsAt: null, renewsAt: null },
          features: { payments: true, mpesa: true, stripe: true, ai: false, customDomain: false },
          settings: { publicBranding: { displayName: spec.name, description: `Demo travel company serving ${spec.county}, Kenya.` }, payments: { mode: "sandbox" } },
        },
        $unset: { domain: "" },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    tenants.push({ ...tenant.toObject(), createdAt: existing?.createdAt || tenant.createdAt });
  }
  const demoTenantIds = tenants.map(({ _id }) => _id);
  await db.collection("organizations").deleteMany({ _id: { $nin: demoTenantIds } });

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
  const rolePermissionNames = {
    admin: null,
    manager: ["dashboard.view", "bookings.view", "bookings.create", "bookings.manage", "tours.view", "tours.manage", "destinations.view", "destinations.manage", "customers.view", "customers.manage", "staff.view", "staff.manage", "vehicles.view", "vehicles.manage", "agents.view", "agents.manage", "reviews.view", "reviews.manage", "leads.view", "leads.manage", "notifications.view", "reports.view"],
    guide: ["dashboard.view", "bookings.view", "tours.view", "notifications.view"],
    driver: ["dashboard.view", "bookings.view", "vehicles.view", "notifications.view"],
    agent: ["dashboard.view", "bookings.view", "bookings.create", "tours.view", "customers.view", "leads.view", "notifications.view"],
    customer: ["bookings.view", "bookings.create", "tours.view"],
  };
  for (const [name, displayName, level] of roleDefs) {
    const allowedPermissions = rolePermissionNames[name];
    roles[name] = await Role.create({
      tenantId: tenant._id, name, displayName,
      description: `Demo ${displayName} account for dashboard testing.`,
      permissions: permissions.filter((p) => allowedPermissions === null || allowedPermissions.includes(p.name)).map((p) => p._id),
      isSystem: true, status: "active", level,
    });
  }

  const users = {};
  let sequence = tenantIndex * 20;
  for (const [role] of roleDefs) {
    const localPart = ({ manager: "manager", guide: "guide1", driver: "driver1", customer: "customer1" })[role] || role;
    users[role] = await createUser({
      name: `Demo ${role[0].toUpperCase() + role.slice(1)} - ${tenant.name}`,
      email: emailFor(localPart, tenant.slug),
      phone: phoneFor(sequence++),
      role: role === "manager" ? "tour_manager" : role,
      tenantId: tenant._id,
      roleId: roles[role]._id,
    });
  }
  for (let customerIndex = 2; customerIndex <= 4; customerIndex += 1) {
    users[`customer${customerIndex}`] = await createUser({
      name: `Demo Customer ${customerIndex} - ${tenant.name}`,
      email: emailFor(`customer${customerIndex}`, tenant.slug),
      phone: phoneFor(sequence++), role: "customer", tenantId: tenant._id,
      roleId: (await Role.findOne({ tenantId: tenant._id, name: "customer" }))._id,
    });
  }
  await Organization.updateOne({ _id: tenant._id }, { $set: { createdBy: users.admin._id } });

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
  const customerRecords = [customer];
  for (let i = 2; i <= 4; i += 1) {
    const account = users[`customer${i}`];
    customerRecords.push(await Customer.create({
      tenantId: tenant._id, user: account._id, firstName: `Demo${i}`, lastName: "Traveler",
      email: account.email, phone: account.phone, nationality: "Kenyan", city: "Nairobi", county: "Nairobi",
      country: "Kenya", customerType: "individual", preferredContactMethod: "email",
      marketingConsent: false, totalBookings: i - 1, completedBookings: Math.max(i - 2, 0), totalSpent: 42000 * i,
      status: "active", createdBy: users.admin._id,
    }));
  }

  const destinationSpecs = [
    ["Maasai Mara","Narok","Iconic savannah reserve known for Big Five wildlife and the Great Migration."],
    ["Amboseli","Kajiado","Open plains with large elephant herds and views of Mount Kilimanjaro."],
    ["Tsavo East","Taita-Taveta","Vast red-earth landscapes, wildlife and the Galana River."],
    ["Tsavo West","Taita-Taveta","Volcanic hills, Mzima Springs and varied safari habitats."],
    ["Diani Beach","Kwale","White-sand Indian Ocean beaches, reefs and coastal forests."],
    ["Watamu","Kilifi","Marine parks, quiet beaches and Swahili coastal heritage."],
    ["Naivasha","Nakuru","Freshwater lake, boat safaris and the Great Rift Valley escarpment."],
    ["Nakuru","Nakuru","Lake Nakuru National Park, rhino conservation and Rift Valley scenery."],
    ["Samburu","Samburu","Northern Kenya wilderness and unique specialist wildlife."],
    ["Mount Kenya","Laikipia","High-altitude trails, alpine landscapes and forest wildlife."],
    ["Lamu","Lamu","Historic Swahili architecture, dhow sailing and island culture."],
    ["Nairobi","Nairobi","Kenya's energetic capital, culture and wildlife on the city edge."],
  ];
  const destinations = await Destination.insertMany(destinationSpecs.map(([name, region, description], i) => {
    const image = `/demo-destinations/kenya-landscape-${String(((tenantIndex * 6 + i) % 18) + 1).padStart(2, "0")}.svg`;
    return { tenantId: tenant._id, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), country: "Kenya", region, city: region, shortDescription: description, description: `${description} Explore guided experiences, local culture and conservation with ${tenant.name}.`, featuredImage: image, images: [{ url: image }], attractions: ["Wildlife and nature","Local culture"], activities: ["Guided tours","Photography"], languages: ["English","Swahili"], currency: "KES", timezone: "Africa/Nairobi", bestSeason: "All Year", weather: "Seasonal tropical climate.", status: "active", active: true, isDeleted: false, featured: i < 6 };
  }));
  const tourData = [
    ["3 Day Maasai Mara Safari",0,3,58500,"Safari"], ["5 Day Amboseli Explorer",1,5,98000,"Safari"],
    ["7 Day Kenya Wildlife Circuit",2,7,168000,"Safari"], ["4 Day Coastal Escape",4,4,76000,"Beach"],
    ["Luxury Kenya Safari",0,6,245000,"Luxury"], ["Kenya Family Adventure",6,5,112000,"Family"],
    ["Kenya Honeymoon Experience",4,6,198000,"Honeymoon"], ["Corporate Kenya Retreat",11,3,89500,"Corporate"],
    ["Wildlife Photography Expedition",8,7,187000,"Photography"], ["Mount Kenya Adventure",9,5,125000,"Adventure"],
    ["Samburu Cultural Safari",8,4,108000,"Cultural"], ["Nairobi City Experience",11,2,34000,"City Tour"],
  ];
  const tours = [];
  for (let i=0;i<tourData.length;i++) {
    const [title,destinationIndex,days,price,category]=tourData[i];
    const dest = destinations[destinationIndex];
    const date = new Date(Date.now() + (i+8)*86400000);
    tours.push(await Tour.create({
      tenantId: tenant._id, title, description: `Experience ${dest.name} with expert local guides, comfortable transport and carefully paced days. This demo ${title} itinerary includes memorable scenery, wildlife and authentic Kenyan hospitality.`,
      shortDescription: `${days} days exploring ${dest.name} with local experts.`, category, destination: dest._id,
      country:"Kenya", location:dest.name, meetingPoint:"Nairobi CBD", duration:`${days} days`,
      durationDetails:{days,nights:Math.max(0,days-1)}, date, startDate:date, capacity:20,
      price, agentPrice:Math.round(price*0.9), featuredImage:{url:`https://images.unsplash.com/${demoTourImageIds[i % demoTourImageIds.length]}?auto=format&fit=crop&w=1200&q=85`},
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
    category:packageCategory(tours[i].category), duration:tours[i].duration, numberOfDays:tours[i].durationDetails.days,
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
  await Tour.updateOne({ _id: tours[0]._id, tenantId: tenant._id }, { $set: { assignedVehicle: vehicle._id } });

  const bookingDocs=[];
  for(let i=0;i<8;i++){
    const tour=tours[i%tours.length];
    const bookingCustomer=customerRecords[i%customerRecords.length];
    const amount=Number(tour.price)*(i%2?2:1);
    bookingDocs.push({
      bookingNumber:`DEMO-${String(tenantIndex + 1).padStart(2, "0")}-${String(i + 1).padStart(4, "0")}`,
      tenantId:tenant._id, customer:bookingCustomer._id, user:bookingCustomer.user,
      customerSnapshot:{name:bookingCustomer.firstName+" "+bookingCustomer.lastName,email:bookingCustomer.email,phone:bookingCustomer.phone},
      contact:{name:bookingCustomer.firstName+" "+bookingCustomer.lastName,email:bookingCustomer.email,phone:bookingCustomer.phone},
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

  const quoteTotal = Number(tours[0].price) * 2;
  await Quotation.create({
    tenantId: tenant._id, agent: agent._id, customer: customer._id, tour: tours[0]._id,
    quotationNumber: `DEMO-QT-${tenantIndex + 1}-001`,
    items: [{ name: tours[0].title, category: "Other", description: "Two traveler safari package", quantity: 2, unitPrice: tours[0].price, total: quoteTotal }],
    subtotal: quoteTotal, grandTotal: quoteTotal, currency: "KES", status: "converted",
    validUntil: new Date(Date.now() + 30 * 86400000), sentAt: new Date(Date.now() - 5 * 86400000),
    approvedAt: new Date(Date.now() - 4 * 86400000), booking: bookings[0]._id,
    createdBy: users.agent._id, notes: "Demo quote accepted and converted to the linked booking.",
  });
  await Quotation.create({
    tenantId: tenant._id, agent: agent._id, customer: customer._id, tour: tours[1]._id,
    quotationNumber: `DEMO-QT-${tenantIndex + 1}-002`,
    items: [{ name: tours[1].title, category: "Other", description: "Family safari package", quantity: 4, unitPrice: tours[1].price, total: Number(tours[1].price) * 4 }],
    subtotal: Number(tours[1].price) * 4, grandTotal: Number(tours[1].price) * 4, currency: "KES", status: "sent",
    validUntil: new Date(Date.now() + 30 * 86400000), sentAt: new Date(), createdBy: users.agent._id,
    notes: "Demo quotation awaiting customer response.",
  });
  await CustomTourRequest.create({
    tenantId: tenant._id, customer: users.customer._id, user: users.customer._id,
    guestContact: { name: customer.firstName + " " + customer.lastName, email: customer.email, phone: customer.phone },
    destination: "Maasai Mara and Diani Beach", durationDays: 8, people: 2,
    startDate: new Date(Date.now() + 60 * 86400000), budget: 320000,
    requirements: "Combine wildlife viewing with a relaxed coastal stay.", status: "quoted",
    quotedAmount: 298000, adminNotes: "Demo modification request with a prepared quote.",
    assignedAgent: agent._id, assignedGuide: guideStaff._id, assignedDriver: driverStaff._id,
  });
  await CustomTourRequest.create({
    tenantId: tenant._id, customer: users.customer2._id, user: users.customer2._id,
    guestContact: { name: users.customer2.name, email: users.customer2.email, phone: users.customer2.phone },
    destination: "Amboseli", durationDays: 5, people: 4,
    startDate: new Date(Date.now() + 75 * 86400000), budget: 420000,
    requirements: "Family departure with accessible pacing.", status: "pending",
  });

  for(let i=0;i<3;i++) await Payment.create({
    tenantId:tenant._id, customer:bookings[i].user, user:bookings[i].user, booking:bookings[i]._id,
    provider:i===1?"STRIPE":"MPESA", method:i===1?"card":"mpesa", paymentMethod:i===1?"CARD":"MPESA",
    amount:Number(bookings[i].totalAmount)*0.5, currency:"KES", phone:users.customer.phone, status:"completed",
    transactionId:`DEMO-PAY-${tenantIndex}-${i+1}`, transactionReference:`DEMO-REF-${tenantIndex}-${i+1}`,
    paidAt:new Date(Date.now()-i*86400000), processedAt:new Date(Date.now()-i*86400000),
  });

  for(let i=0;i<3;i++) await Commission.create({
    tenantId:tenant._id, agent:agent._id, booking:bookings[i]._id, customer:bookings[i].user, tour:bookings[i].tour,
    bookingAmount:bookings[i].totalAmount, rate:10, amount:bookings[i].totalAmount*0.1,
    status:i===0?"paid":"pending", paymentMethod:i===0?"MPESA":undefined, paymentReference:i===0?`DEMO-COM-${tenantIndex}`:"",
    paidAt:i===0?new Date():null, approvedBy:users.admin._id, approvedAt:new Date(), createdBy:users.agent._id,
  });

  for(let i=0;i<3;i++) await Review.create({
    tenantId:tenant._id, user:bookings[i].user, customer:bookings[i].customer, tour:tours[i]._id, booking:bookings[i]._id,
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
  assertDemoResetTarget();
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
  if (ownerCount === 0) {
    await runWithTenant({ role: "super_admin", bypass: true }, () => createUser({
      name: "Demo Platform Owner", email: "superadmin@hussein-mboya.com", phone: "0712345000",
      role: "super_admin", tenantId: null,
    }));
  }
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
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  const rawDb = mongoose.connection.db;
  for (let tenantIndex = 0; tenantIndex < tenants.length; tenantIndex += 1) {
    const tenant = tenants[tenantIndex];
    const [acceptedQuote, booking] = await Promise.all([
      rawDb.collection(Quotation.collection.collectionName).findOne({
        tenantId: tenant._id, quotationNumber: `DEMO-QT-${tenantIndex + 1}-001`, status: "converted",
      }),
      rawDb.collection(Booking.collection.collectionName).findOne(
        { tenantId: tenant._id }, { sort: { createdAt: 1 }, projection: { _id: 1 } }
      ),
    ]);
    if (!acceptedQuote || !booking) throw new Error(`Could not connect the accepted demo quotation to a booking for tenant ${tenant.slug}.`);
    await rawDb.collection(Quotation.collection.collectionName).updateOne(
      { _id: acceptedQuote._id, tenantId: tenant._id }, { $set: { booking: booking._id } }
    );
  }
  console.log(JSON.stringify({
    success:true,
    message:"Demo reset complete. Platform owner accounts and tenant identities were preserved; all other data was replaced with seeded dashboard test data.",
    tenants:tenants.map(t=>({id:t._id,name:t.name,slug:t.slug})),
    platformOwnersPreserved:ownerCount,
    demoUsersPerTenant:9,
    demoPasswordConfigured:true,
  },null,2));
  await mongoose.disconnect();
};

async function runWithTransientRetry() {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await main();
      return;
    } catch (error) {
      await mongoose.disconnect().catch(() => {});
      const details = [error?.name, error?.message, error?.stderr?.toString?.(), error?.cause?.name, error?.cause?.message].join(" ");
      const transientMongoFailure = /MongoNetwork|MongoServerSelection|PoolCleared|ECONNRESET|ETIMEDOUT|server monitor timeout|socket disconnected/i.test(details);
      if (!transientMongoFailure || attempt === 3) {
        console.error("DEMO RESET FAILED:", error);
        process.exitCode = 1;
        return;
      }
      console.warn(`Transient Atlas connection failure during demo reset (attempt ${attempt}/3). Retrying the guarded reset after cleanup.`);
      await new Promise((resolve) => setTimeout(resolve, 5000 * attempt));
    }
  }
}

runWithTransientRetry();
