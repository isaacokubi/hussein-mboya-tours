import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

const travelGuideSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
  excerpt: { type: String, default: "", trim: true, maxlength: 600 },
  content: { type: String, required: true, trim: true, maxlength: 50000 },
  category: { type: String, default: "Travel tips", trim: true, maxlength: 80 },
  tags: [{ type: String, trim: true, maxlength: 40 }],
  coverImage: { type: String, default: "", trim: true, maxlength: 2048 },
  status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
  publishedAt: { type: Date, default: null },
  seoTitle: { type: String, default: "", trim: true, maxlength: 180 },
  seoDescription: { type: String, default: "", trim: true, maxlength: 320 },
}, { timestamps: true });

travelGuideSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
travelGuideSchema.index({ tenantId: 1, status: 1, publishedAt: -1 });
travelGuideSchema.plugin(tenantPlugin);
travelGuideSchema.plugin(tenantAggregationPlugin);

export default mongoose.models.TravelGuide || mongoose.model("TravelGuide", travelGuideSchema);
