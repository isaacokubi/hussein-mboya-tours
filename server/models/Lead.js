import * as firestore from "../config/firestore.js";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const leadSchema = new firestore.Schema({
  tenantId: { type: firestore.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  integrationKey: { type: firestore.Schema.Types.ObjectId, ref: "WebsiteIntegrationKey", default: null },
  firstName: { type: String, trim: true, default: "" },
  lastName: { type: String, trim: true, default: "" },
  name: { type: String, trim: true, default: "" },
  email: { type: String, trim: true, lowercase: true, default: "" },
  phone: { type: String, trim: true, required: true },
  company: { type: String, trim: true, default: "" },
  nationality: { type: String, trim: true, default: "" },
  country: { type: String, trim: true, default: "" },
  city: { type: String, trim: true, default: "" },
  county: { type: String, trim: true, default: "" },
  tour: { type: firestore.Schema.Types.ObjectId, ref: "Tour", default: null },
  travelDate: { type: Date, default: null },
  guests: { type: Number, min: 1, max: 100, default: 1 },
  message: { type: String, trim: true, default: "" },
  source: { type: String, trim: true, default: "website" },
  landingPage: { type: String, trim: true, default: "" },
  referrer: { type: String, trim: true, default: "" },
  utm: { type: firestore.Schema.Types.Mixed, default: {} },
  customFields: { type: firestore.Schema.Types.Mixed, default: {} },
  marketingConsent: { type: Boolean, default: false },
  consentAt: { type: Date, default: null },
  status: { type: String, enum: ["new", "contacted", "qualified", "converted", "lost", "archived"], default: "new", index: true },
  convertedBooking: { type: firestore.Schema.Types.ObjectId, ref: "Booking", default: null },
  lastContactedAt: { type: Date, default: null },
}, { timestamps: true });

leadSchema.index({ tenantId: 1, phone: 1, createdAt: -1 });
leadSchema.index({ tenantId: 1, email: 1, createdAt: -1 });
leadSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
leadSchema.plugin(tenantPlugin);

export default firestore.models.Lead || firestore.model("Lead", leadSchema);
