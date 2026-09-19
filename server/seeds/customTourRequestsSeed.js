import mongoose from "mongoose";
import dotenv from "dotenv";
import Organization from "../models/Organization.js";
import CustomTourRequest from "../models/CustomTourRequest.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

const TENANT_SLUG = "amani-trails-safaris";

const requests = [
  { guestContact:{name:"Brian Mwangi",email:"custom-seed-001@amanitrails.co.ke",phone:"0712345601"}, destination:"Maasai Mara", durationDays:5, people:4, adults:4, children:0, startDate:"2026-10-10", budget:420000, requirements:"Private 4x4 safari, Big Five game drives, professional English-speaking guide and a sunset bush experience.", pickupLocation:"JKIA, Nairobi", accommodationPreference:"Luxury lodge", mealPreference:"Full board", transportPreference:"Private 4x4 safari vehicle", specialRequests:"Airport pickup and a flexible first-day itinerary.", status:"quoted", quotedAmount:395000, adminNotes:"Quote prepared for a private luxury Maasai Mara safari." },
  { guestContact:{name:"Faith Wanjiku",email:"custom-seed-002@amanitrails.co.ke",phone:"0723456702"}, destination:"Diani Beach", durationDays:4, people:2, adults:2, children:0, startDate:"2026-11-06", budget:220000, requirements:"Couples beach holiday with a private dinner, marine excursion and airport transfers.", pickupLocation:"Ukunda Airport", accommodationPreference:"Boutique beachfront hotel", mealPreference:"Breakfast and dinner", transportPreference:"Private transfers", specialRequests:"Quiet room suitable for a couple.", status:"approved", quotedAmount:198000, adminNotes:"Customer-ready quote approved for the requested Diani itinerary." },
  { guestContact:{name:"David Otieno",email:"custom-seed-003@amanitrails.co.ke",phone:"0734567803"}, destination:"Amboseli National Park", durationDays:4, people:6, adults:4, children:2, startDate:"2026-12-12", budget:310000, requirements:"Family safari with child-friendly activities, Amboseli game drives and views of Mount Kilimanjaro.", pickupLocation:"Nairobi", accommodationPreference:"Family-friendly lodge", mealPreference:"Full board", transportPreference:"Private safari van", specialRequests:"Rooms close together and an early morning game drive.", status:"pending", quotedAmount:0, adminNotes:"Awaiting itinerary costing and supplier availability." },
  { guestContact:{name:"Mercy Njeri",email:"custom-seed-004@amanitrails.co.ke",phone:"0745678904"}, destination:"Mount Kenya", durationDays:6, people:3, adults:3, children:0, startDate:"2027-01-18", budget:280000, requirements:"Guided Mount Kenya adventure with scenic highland accommodation and moderate trekking.", pickupLocation:"Nairobi CBD", accommodationPreference:"Mountain lodge", mealPreference:"Full board", transportPreference:"Private 4x4", specialRequests:"Please include equipment guidance and a pre-trek briefing.", status:"pending", quotedAmount:0, adminNotes:"Pending route confirmation and guide availability." },
  { guestContact:{name:"Samuel Kamau",email:"custom-seed-005@amanitrails.co.ke",phone:"0756789005"}, destination:"Nairobi and Lake Naivasha", durationDays:3, people:4, adults:4, children:0, startDate:"2026-10-24", budget:180000, requirements:"Short private escape combining Nairobi highlights, Lake Naivasha and a guided nature experience.", pickupLocation:"Westlands, Nairobi", accommodationPreference:"Mid-range hotel", mealPreference:"Breakfast", transportPreference:"Private vehicle", specialRequests:"Return to Nairobi by the final afternoon.", status:"rejected", quotedAmount:0, adminNotes:"Demo request marked rejected to exercise the admin status workflow." }
];

const seed = async () => {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in .env");
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const organization = await Organization.findOne({ slug: TENANT_SLUG, isDeleted: { $ne: true } }).lean();
    if (!organization) throw new Error("Tenant " + TENANT_SLUG + " was not found.");

    await runWithTenant({ tenantId: organization._id, tenant: organization }, async () => {
      for (const data of requests) {
        await CustomTourRequest.findOneAndUpdate(
          { tenantId: organization._id, "guestContact.email": data.guestContact.email },
          { $set: { ...data }, $setOnInsert: { tenantId: organization._id, user: null, customer: null } },
          { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
        );
        console.log("Seeded: " + data.guestContact.email + " / " + data.status);
      }
      const count = await CustomTourRequest.countDocuments({ tenantId: organization._id });
      console.log("Amani Trails Safaris custom tour requests: " + count + " total.");
    });
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
};

seed().catch((error) => {
  console.error("Custom tour request seed failed:", error);
  process.exitCode = 1;
});
